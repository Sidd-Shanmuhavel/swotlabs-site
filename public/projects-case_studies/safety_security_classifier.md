# Safety Security Classifier — AI-Powered Incident Triage Platform

## Part One — Business Overview (for all readers)

The Safety Security Classifier reads safety and security incident reports, decides what kind of incident each one is, scores how serious it is, and writes a short summary. We built it for a long-haul airline, where staff log safety incidents as tickets in Intelex. Reports arrive daily from across the operation: a bag mishandled on the ground, a passenger issue in the cabin, a hard landing, a maintenance defect in engineering. Each one needs a category and a risk score before anyone can decide what to look at first.

Done by hand, that triage is slow, and two analysts will file the same incident under different categories. A safety team with a full queue cannot read everything the day it lands. The classifier takes the title and description of an incident and uses a language model to predict one of four operational categories, score risk severity from one (negligible) to five (catastrophic), and write a summary a person can read in a few seconds. It writes all three back into Intelex, so the analyst opens a ticket and finds the suggested category, priority and summary already on it.

Triage moves faster and lands in the same place twice. Analysts spend their attention on the serious end of the queue. The system also measures itself against the categories analysts assign, publishing accuracy metrics and confusion matrices, so the safety team knows how far to trust it and where it drifts. It runs incrementally on Databricks, classifying the new incidents on each pass.

## Part Two — How It Works End to End (for semi-technical readers)

Eight tasks run in sequence on Databricks. Three of them run side by side, because they do independent work on the same rows.

The pipeline **ingests** raw incident data from Intelex into a staging table, then builds an analytics base table: the cleaned, ready-to-classify version of each incident. The three parallel tasks follow. One **categorises** an incident as Ground, Cabin, Flight or Engineering. One **prioritises** it with a risk severity from one to five. One **summarises** it in a short paragraph. Each task calls a language model hosted on Databricks with a prompt carrying the decision rules and worked examples, then parses the model's reply into structured fields.

A fourth task **merges** the three predictions into one table. Another computes **performance metrics**, including accuracy, precision, recall and the confusion matrix, against the category an analyst assigned. The last task writes the predictions **back to Intelex**, onto the original tickets.

The pipeline works incrementally: it knows which incidents it has already handled and classifies the rest. The model runs at zero temperature, so the same incident produces the same category twice, which matters when a safety team is auditing a decision. A framework called Delta Quality checks the data at each step, holding a category to the allowed values and a risk score between one and five. A failed rule stops the job rather than writing bad data downstream.

Databricks Asset Bundles handle deployment, and an Azure DevOps pipeline tests, lints, packages and ships changes through development, test and production.

## Part Three — Deep Technical Reference (for engineers)

### Pipeline topology

The workflow is defined in `databricks_resources/classification_workflow.yaml` as a job named `security-safety-classifier-pipeline-{env}` with eight tasks in dependency order: `00_data_source_ingestion`, `01_sr_incident_master_load`, then the parallel trio `02_01_incidents_categorization`, `02_02_incidents_prioritisation`, and `02_03_incidents_summarisation`, followed by `03_create_final_pred_table`, `04_01_create_viz_tables`, and `05_data_source_update`. Tasks run on serverless compute (migrated from a multi-cluster policy), with a configurable 1800-second task timeout and a job parameter `predict_after_datetime_reported` that defaults to using the latest already-processed datetime.

### Core library: `safety_security_core/`

The `llm/` subpackage contains `classification.py`, which builds the core LLM query using Databricks' native `ai_query()` SQL function with prompt templating, and `utils.py`, whose `best_ai_query_repartition()` calculates optimal Spark partitions by dividing the row count by an empirically tuned constant of seventeen, giving roughly seventeen rows per partition for best LLM throughput.

The `data_engineering/` subpackage holds `extract.py` (`extract_llm_classification_outputs()` parses regex patterns from raw LLM text into structured fields), `filtering.py` (`filter_master_data()` and `get_latest_datetime_reported_processed()` manage the incremental processing window), and `prompt_management.py` (templating, example injection, and validation via `create_examples()`, `extract_examples_data()`, and `validate_prompt()`, supporting few-shot learning).

The `utils/` subpackage provides `config.py` (a YAML loader with custom `!include`, `!get`, and `!join` constructors), `database.py` (`write_to_db()` and `merge_to_db()` with upsert logic), `spark_utils.py` (`compute_optimal_partitions()` targeting 256 MB per partition, and an `array_choice()` pandas UDF), plus `logging.py`, `async_utils.py`, `decorators.py`, `exceptions.py`, `nlp.py`, `string_manipulation.py`, and `dict_manipulation.py`. The `casting/` subpackage offers type conversion through `converters.py` (`str2bool()`, `str_to_dict()`, `str_to_datetime()`), `conversion_utils.py`, and `converter_register.py`.

### Jobs layer: `safety_security_jobs/`

`base_job.py` defines an abstract `BaseJob` metaclass that automatically wraps each job's `run()` method with `add_realtime_logging()` and `make_return_into_task_value()` decorators; it provides `write_table()`, `merge_into_delta_table()`, and `_log_task_event()`, and on construction loads configuration, the Spark session, dbutils, the logger, and the catalog.

The `config/` directory carries `config_jobs.py` (the `Config` class mapping YAML to job attributes), `jobs_config.yaml` (input/output table names, parameters, prompt references, temperature 0.0, max_tokens 100, an approximate 482 bytes per row), `env_config.yaml` (environment-to-catalog-to-endpoint-to-secret-scope mappings), `dataquality_rules.yaml` (per-job expectations using the dqx library), and `testing_config.yaml` (tolerance overrides). Its `prompts/` subfolder holds `category_classification.yaml`, `risk_classification.yaml`, `ticket_summary.yaml`, and `examples.yaml`.

The `classification/` directory implements the three prediction jobs: `tickets_classification.py` (`ClassifyTicketsJob`, extracting Category, Confidence, and Reason via regex), `risk_prioritisation.py` (`TicketsRiskPrioritiseJob`, extracting Severity one-to-five, Confidence, and Reason), and `ticket_summarisation.py` (`TicketsSummarisationJob`, extracting Summary).

The `data_engineering/` directory implements the pipeline plumbing: `data_source_ingestion.py` (`DataSourceIngestionJob`, source to `safety_security_s.or_master_incident`), `master_load.py` (`MasterLoadJob`, building the analytics base table `safety_security_s.incident_master_llm` with incremental processing by modification date), `final_incident_table_load.py` (`FinalLoadTableJob`, merging the three predictions into `safety_security_g.incidents_llm_predictions`), and `data_source_update.py` (`DataSourceUpdateJob`, writing back via an `update_description()` formatter into the source `PredefinedRisk` column).

The `visualisation/` directory's `model_performance_jobs.py` (`ComputeModelPerformanceJob`) computes classification metrics via scikit-learn, builds confusion matrices, and uses the `array_choice()` UDF to randomly select one ground-truth label when an incident carries multiple human-assigned categories. The `testing/` directory provides `dq_tests.py` (a `@test_dq_table_outputs` decorator wrapping `CKDExpectations` from `deltaquality.expectations`) and `general_tests.py` (a `@test_table_exact_match` decorator comparing outputs across runs with configurable tolerances). The `jobs_creation/` directory's `factory_method.py` provides a `CreateJob` factory with `get_job_names()` and `get_job_params()` for introspection.

### Taxonomy and rubrics

The four categories are Ground (cargo and hold damage, ground handling, loading, chocking, cleaning, catering, boarding, refuelling, gate agents), Cabin (passenger and crew issues, seating, baggage, lavatory, galley, comfort aids, crew instructions, seatbelts, health declarations), Flight (airborne operations, approaches, autopilot, birdstrikes, overspeed, air traffic control, flap limits, hard landings, windshear, go-arounds, diversions), and Engineering (maintenance, component failures, ETOPS, tooling, task cards, C-checks, deferred defects, minimum-equipment-list compliance, life-limited parts, third-party maintenance-repair-overhaul).

The five-level risk rubric runs from Level 1 Negligible (no operational impact, no injuries, no regulatory effect), through Level 2 Minor, Level 3 Major, Level 4 Severe (safety margins critically reduced, potential fatality, national media), to Level 5 Catastrophic (aircraft loss, multiple fatalities, operating restrictions, international media, catastrophic financial impact, two-day hub closure).

### Classification flow

Per ticket the flow is: `filter_master_data()` selects records reported after the last processed datetime; `load_and_add_examples_to_master_data()` validates prompt structure, extracts examples, and formats them as a few-shot column; `ai_query()` builds the SQL expression combining the YAML prompt template (with `{{placeholder}}` markers for `occurrence_title`, `occurrence_details`, and `examples`) and the LLM parameters (temperature 0.0, max_tokens 100); Databricks executes the query across distributed Spark partitions; `extract_llm_classification_outputs()` applies regex patterns to the raw text (for example a `Category:` capture for the category job, `Severity:` and `Confidence:` for risk, and `Summary:` for the summary job); and results are written to the prediction tables via `write_table()` in Delta format. Prompts must contain `Inputs:` and `Outputs:` sections, examples are capped at twenty with a warning, and the LLM uses purely greedy decoding with no sampling.

### Tech stack

The platform runs on Databricks serverless compute with Unity Catalog and native LLM serving endpoints, using PySpark 4.0+, Python 3.10–3.12, and Delta Lake. The classifying model is Meta Llama 3.3 70B Instruct (`databricks-meta-llama-3-3-70b-instruct`). Supporting libraries include scikit-learn 1.6.1 (metrics), pandas 2.2.3, numpy 1.26.4, databricks-labs-dqx 0.2.0 (Delta Quality), aiohttp 3.11.18, nest-asyncio 1.6.0, tenacity 8.5.0 (retry), PyYAML 6.0.2, typeguard 4.3.0, and databricks-sdk 0.46.0. Testing uses pytest 8.3.3 with pytest-asyncio, pytest-cov, pytest-mock, and aioresponses; code style is enforced by black, isort, and flake8 with pre-commit hooks; bandit provides security linting and diff-cover reports coverage diffs. The package version is 2.1.2.

### Data model

Inputs come from `data_source.incident_table` with fields such as `OR_Record_No`, `OR_Title` (mapped to `occurrence_title`), `OR_Description` (to `occurrence_details`), `Date_Reported`, `Date_of_Occurrence`, `Safety_Area` (the human ground-truth category), `Investigation_Team`, `Role_Name`, `Date_Modified` (for incremental processing), and `External_Authority`. Outputs flow through `safety_security_s.or_master_incident` (raw staging) and `safety_security_s.incident_master_llm` (analytics base table) into the gold tables: `incident_cat_pred`, `incident_risk_pred`, `incident_summary_pred`, the unified `incidents_llm_predictions`, plus the visualisation tables `categorisation_metrics`, `incident_category_confusion_matrix`, `incident_categories_counts`, and the `incident_metrics` view. The write-back formats a string into `PredefinedRisk` carrying predicted category, predicted priority, the summary, and the original description.

### Evaluation and data quality

Delta Quality rules enforce uniqueness and not-null on `record_no`, type validity (category in the allowed set, risk in one through five, confidence between 0 and 1), and a summary length bound of roughly four times max_tokens. Testing tolerances are differentiated: 0.15 for classification and risk, 0.20 for the more variable summaries, 0.35 for the combined final table, and 0.15 numerical with 0.005 count for model performance; non-deterministic columns such as raw outputs, load timestamps, and reasons are ignored, and text columns use similarity matching. The performance job builds the confusion matrix of predicted versus ground-truth category, computes precision, recall, and F1 via scikit-learn over recent predictions per category, and resolves multi-label ground truth by random single-label selection to avoid biasing metrics.

### Deployment and CICD

Deployment uses a Databricks Asset Bundle named `safety_security_classifier` with dev active (test and prod commented out), serverless compute, and a wheel artifact built by `scripts/databricks_package_build.sh`, deployed under `/databricks_bundles/safety_security_classifier/{target}`. The Azure DevOps pipeline in `cicd/` proceeds through setup (environment detection by branch via `set_up_env.sh`), build (unit tests, style checks, wheel build), test deployment and prod-staging integration on pull requests, and dev or prod release on the main and release branches. Environment variables bind dev to the `safety_security_d` catalog with the Llama endpoint and the `avadeunkvincclassifier` secret scope, test to `people_t`, and prod to `people_p` with the `avapeunkvincclassifier` scope. Jobs are invoked either through the `notebooks/run_job.py` notebook (with environment and job-name dropdowns and dynamic parameter inputs) or the `scripts/run_script.py` argparse CLI used in production.

### Notable implementation details

Incremental state is tracked by `datetime_reported` and `record_no`, with a full-refresh override available. The seventeen-rows-per-partition heuristic governs LLM repartitioning while 256 MB targets govern output partitioning. Determinism is guaranteed by temperature 0.0 and greedy decoding. Confidence scores are stored raw and uncalibrated. Data-quality failures raise `FailedTableInTest` and fail fast, isolating quarantine records. Every job logs START, END, and FAILURE events with Databricks context tags (job, task-run, and job-run identifiers) and durations to a monitoring task-execution-logs table. The recent serverless migration removed `.cache()` and `.persist()` calls that serverless does not support, and currently only the dev target is active, suggesting an in-progress migration phase.
