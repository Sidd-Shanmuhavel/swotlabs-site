# Civitas — Automated Lease Extraction and Rent Review Calculation Platform

## Part One — Business Overview (for all readers)

This platform reads commercial property leases and works out what rent a tenant owes in a given year. Most UK commercial leases carry a "rent review" clause, which means the rent moves over the life of the lease. It rises, and in some leases falls, with inflation, measured against a government index: CPI, RPI, or CPIH, which includes owner-occupiers' housing costs. Each lease spells out its own mechanism in legal prose, and those leases run to hundreds of pages, decades old, scanned, with handwriting over the print in places.

A surveyor or paralegal used to do this by hand. They read the lease, found the clauses, worked out the mechanism (which index, which months to compare, whether a floor or a ceiling caps the movement), looked up the inflation figures and did the arithmetic for every review year since the rent commenced. A landlord holding thousands of leases pays for months of that work, and someone will transpose a figure.

The platform runs that process as a pipeline. You give it the scanned leases. It extracts the dates, the rent and the review mechanism, writes a calculation recipe for each lease, pulls the official inflation series, and produces a spreadsheet of revised rents by property and year. Months of expert work compress into a run you can repeat, a legacy portfolio becomes analysable at its full size, and every figure traces back to the clause and the index value behind it.

The pipeline states what it does not know. Where a lease is silent, or the scan is too damaged to read a value, it writes a blank and flags the lease for a person to check, rather than filling the gap with a plausible number. It keeps failed calculations too, so nothing drops out of the record between runs.

## Part Two — How It Works End to End (for semi-technical readers)

The pipeline runs in three stages. Each one takes the output of the stage before it and adds structure, ending at the rent figures.

**Extraction** comes first. The input is a set of JSON files from Google Document AI, the OCR service that has already scanned the lease PDFs and split them into text chunks. The first stage cleans those files, then has a language model write a title and summary for every chunk, which gives it an index of the document. A chunk-selection agent uses that index to pick the chunks it needs for each category of question, so it stops re-reading a 300-page lease to answer one thing. It pulls three families of fact: the term dates, meaning when the lease and the rent begin; the rent detail, meaning how much, how often, in advance or arrears; and the review detail, meaning the review dates, the index, the comparison months and any floor or ceiling. Out of that comes a table with one row per property.

**Formula generation** follows, because the facts alone do not give you the arithmetic. An agent re-reads the relevant chunks and writes an executable recipe for that one lease. The recipe finds the base index value and the review index value, applies a floor or ceiling if the clause has one, and returns the revised rent for a given year. The agent runs its own recipe against mock data in a sandbox before it accepts it, which catches the recipes that are broken or that misread the mechanism, and it refines those.

**Rent review calculation** finishes the job. The last stage loads the monthly CPI, RPI and CPIH series and runs each lease's recipe for every review year between rent commencement and today. For each year it records the revised rent and the evidence behind it: the months compared, the index values, the floor or ceiling that applied. The output expands to one row per property per year, joins to a property reference table where one exists, and exports to an Excel workbook.

A Databricks notebook orchestrates the pipeline, and each run writes to its own timestamped folder. You can restart from any stage, so re-running formula generation does not mean paying for extraction again. Swapping the underlying model is a dropdown, not a code change.

## Part Three — Deep Technical Reference (for engineers)

### Domain and overall shape

Civitas digitises and monetises legacy commercial-property lease analysis. It exists as three coexisting pipeline implementations under `pipeline/` (original/legacy), `updated_pipeline/` (current production), and `updated_pipeline_v2/` (experimental, adds verification). Each is structured around a Databricks notebook `orchestrator.py` plus supporting modules. The production architecture introduced LangGraph agents for chunk selection, cumulative retry, multi-document property merging, cost tracking, and multi-provider LLM support — capabilities the legacy version lacked.

### Stage one: extraction (`updated_pipeline/extraction.py`)

The extraction module performs, in order: document classification, raw JSON cleaning, chunk summarisation, intelligent chunk selection, and three-phase field extraction.

`classify_documents()` inspects the first chunks and the first-page text to determine `doc_type` (one of lease, deed of variation, side letter), `doc_date`, `landlord`, `tenant`, and `property_address`. The document type matters because a single property can be governed by a lease plus later amendments, which must be merged.

`clean_raw_jsons()` strips the Document AI `documentLayout`, retaining only chunks with `chunkId` and `content`, plus extracted `first_page_text`. The raw input structure contains a `chunkedDocument.chunks` array and a `documentLayout.blocks` array carrying page spans and text blocks.

`summarize_chunks()` runs LLM summarisation in parallel via a `ThreadPoolExecutor` (five workers) with exponential backoff on rate limits, producing for each chunk a `title` (up to eight words) and a two-to-four sentence `summary` focused on rent-related terms. Output is a per-document JSON with `first_page_text`, `total_chunks`, and a `summarized_chunks` array.

`create_chunk_selection_agent()` builds a LangGraph agent whose tools include `lookup_chunks()` (retrieve content by `chunkId`, with optional `EXTENDED_SEARCH` to include adjacent chunks n−1 and n+1 for context). The agent iteratively selects chunks for the term, rent, and review field categories, guided by `CHUNK_SELECTION_SYSTEM_PROMPT`, which instructs it to prioritise chunks containing target-field keywords, always include annotation chunks (where the OCR layer flagged handwritten edits or corrections between `__START_OF_ANNOTATION__` and `__END_OF_ANNOTATION__` markers), pair annotation chunks with adjacent context, exclude table-of-contents chunks, and stop when coverage is complete.

Three extraction functions — `extract_term_fields()`, `extract_rent_fields()`, `extract_review_fields()` — issue direct Azure OpenAI calls (temperature 1, JSON response format). They resolve relative date references to absolute dates: "the date of this Lease" resolves to the Date of Lease value; "the nth anniversary of [date]" resolves to that date plus n years; "X months/weeks after [date]" applies the offset; "the quarter day next following [date]" resolves to the next of 25 March, 24 June, 29 September, or 25 December; and if the anchor is unknown the field is null rather than guessed.

`merge_extraction_by_property()` groups documents by `property_id` (via a Spark mapping table `civitas_dev.webterrier.sl_mapping`), merges a lease and its amendments into a single row, marks `is_final=True` for the last lease version and `is_final=False` for amendments. `run_extraction()` is the entry point returning the extraction CSV path and DataFrame. A cumulative retry mechanism (up to `MAX_RETRIES`, typically 4) lets the agent fetch additional chunks and re-extract when fields are missing; after exhaustion it proceeds with nulls rather than skipping.

### Extracted fields in detail

Term fields are Date of Lease, Term Commencement Date, and Rent Commencement Date, each emitted as a structured date object with separate `year`, `month`, and `day` string fields (any of which may be null — missing parts are never inferred). Rent fields are Initial Rent (a structured object of `currency`, `amount` as float, and `frequency`), Usual Rent Payment Date (a recurring day pattern, not an absolute date), a payment-cadence enum distinguishing monthly, four-weekly, and quarterly (inferred from instalment counts — twelve instalments imply monthly, thirteen imply four-weekly), and an arrears/advance enum. Review fields are First Rent Review Date, Rent Review Date (a recurrence pattern), the index enum (CPI, RPI, or CPIH), Base Month, Review Date Month, Collar/Minimum (a float floor such as 0.0 or 0.02, or null if absent), and Cap/Maximum (a float ceiling such as 0.05, or null if absent).

### Supporting modules

`schemas.py` defines the Pydantic validation models: `DateField`, `RentField`, the `TermExtractionResult`, `RentExtractionResult`, and `ReviewExtractionResult` (aliasing CSV column names), `RentReviewFormulaResult` (the nine-to-eleven-key output of a formula), and `FormulaGenerationOutput`.

`prompts.py` holds all templates: `ANNOTATION_CONTEXT` (handling OCR errors and marginalia), `DATE_VALUE_RULES`, `SUMMARIZATION_SYSTEM_PROMPT` and `SUMMARIZATION_PROMPT`, `CHUNK_SELECTION_SYSTEM_PROMPT`, and the field-specific `term_fields_prompt()`, `rent_fields_prompt()`, `rent_review_fields_prompt()`, plus `FORMULA_GENERATION_PROMPT`.

`utils.py` provides the operational core: `get_index_value()` supporting two lookup modes — `MONTH_LOOKUP` (direct key access by a "YYYY-MM-01" string or a year/month tuple) and `RELEASE_DATE_LOOKUP` (latest entry whose release date is on or before a trigger date, handling publication lag); `exec_code_safe()`, a restricted-namespace sandbox that executes generated formula code with only a curated set of names available (`get_index_value`, `datetime`, `math`, `decimal`, `json`, `pandas`, `numpy`, `relativedelta`, and an optional `extra_namespace` for injecting the CPI/RPI/CPH dictionaries); `create_llm_client()` and `create_azure_openai_client()` factories; and run-management helpers `generate_run_id()`, `create_run_folders()`, and `get_latest_run_id()`.

### Stage two: formula generation (`updated_pipeline/formula_generation.py`)

The `LeaseFormulaAgent` is a LangGraph agent with tools `retrieve_chunks()`, `retrieve_all_chunks()`, `search_chunks_by_keyword()` (keyword search with snippet extraction over terms like CPI, RPI, base month, review date, collar, cap, anniversary, percentage), `test_exec_code()` (syntax validation in the sandbox), and `test_rent_review_code()` (functional execution against mock CPI/RPI/CPH data validating the output dictionary structure). The agent runs a tool-calling loop to search, draft, test, and refine.

The generated function has the signature taking `date_lease`, `rent_initial_date`, `initial_rent`, `review_year`, and the three index dictionaries `CPI`, `RPI`, `CPH`. A vital semantic point: `review_year` is the calendar year (for example 2022), not a sequential review number — this prevents a class of bugs where an implementation might add a lease year to a review ordinal or iterate over thousands of spurious years. The returned dictionary carries `base_index_month`, `review_index_month`, `lease_review_date`, `index_name`, `base_index_mode`, `review_index_mode`, `base_index`, `review_index`, `collar`, `cap`, and `revised_rent`.

`_extract_code_from_response()` pulls Python from the LLM response after a `*** Code ***` marker or a fenced block, with a fallback that scans backwards through tool calls for the last tested function. Cost tracking records input and output tokens per model and computes a dollar estimate from per-million-token rates (for example databricks-claude-opus-4-7 at five dollars input and twenty-five output; gpt-5.3-chat at roughly 1.52 and 12.16; gpt-5.4 at 2.50 and 15).

### Stage three: rent review calculation (`updated_pipeline/rent_review.py`)

`convert_date_field_to_iso()` normalises a structured date object or string to ISO format; `convert_rent_to_float()` extracts the numeric amount from a rent object or string; `apply_review_formula()` executes a lease's formula across all review years and returns a list of per-year result dictionaries; `run_rent_review()` loads the extraction and formula CSVs, executes, and writes the final results CSV.

The calculation logic, per lease and per review year from the first review year to the current year plus one, computes the lease review date for that calendar year, resolves the base and review months using the lease's stated rules combined with the rent commencement date, fetches `base_index` and `review_index`, computes `revised_rent = initial_rent * (review_index / base_index)`, applies the collar as a lower bound (`max(revised, initial_rent * (1 + collar))`) and the cap as an upper bound (`min(revised, initial_rent * (1 + cap))`), and returns the full evidence dictionary. Review dates are derived for fixed annual dates, anniversaries of the rent commencement date (using `relativedelta`), or relative weekdays such as "first Monday in April". Missing index data raises a caught `KeyError`, producing a null `revised_rent` for that year while preserving the row for audit; a zero base index is similarly guarded.

### Data formats

Inflation files are monthly CSVs with `year`, `month`, `month_num`, `value`, and `published_date`, covering roughly 1988 to 2026, processed into dictionaries keyed by "YYYY-MM-01" strings carrying value and release date. The extraction CSV carries `source_file` plus the structured term, rent, and review fields as JSON strings or nulls. The formula CSV carries `source_file`, `formula_code`, `ai_explanation`, token counts, and cost. The final results CSV carries `source_file`, optional `PropertyReference`, `review_year`, `revised_rent`, `index_name`, the base and review month keys, the index values, and the applied collar and cap.

### Models, libraries, and providers

Extraction primarily uses Azure OpenAI (gpt-5.4 and gpt-5.3-chat, API version 2024-12-01-preview, temperature 1, JSON response format) via direct `openai.AzureOpenAI` clients and `langchain-openai`'s `AzureChatOpenAI`. Formula generation and the v2 verifier favour Databricks-served models (databricks-claude-opus-4-7, and a databricks-gpt-4 alternative). The agentic loops use `langgraph` (`StateGraph`, `END`, `ToolNode`) and `langchain-core` message and tool primitives. Supporting libraries include `pydantic`, `pandas`, `numpy`, `dateutil` (`relativedelta`), `tenacity` (retry with exponential backoff), `concurrent.futures`, and the standard `re`, `json`, `ast`, `logging`, and `pathlib`.

### Orchestration, runs, and configuration

The orchestrator supports a `START_FROM_STEP` parameter (1 for full pipeline, 1.5 to begin at the property merge, 2 to begin at formula generation, 3 to begin at rent review only) and a `RESUME_RUN_ID` for loading completed steps from an existing run folder. Run identifiers follow `run_YYYYMMDD_HHMMSS`, and each run folder contains `cleaned_chunked/`, `summarized/`, `extraction/`, `formulas/`, and `results/` subfolders. Execution is on Databricks (Python 3.12+), with widgets for model selection, `dbutils` for context and library restart, Spark for the property mapping join, Workspace paths for notebooks, and Unity Catalog Volume paths (`civitas_dev`/`webterrier`) for data. A known weakness is that the Azure API key is currently hardcoded and should be migrated to `dbutils.secrets.get`.

### Versions and the verification experiment

The legacy `pipeline/` used simple direct LLM calls over full text with no chunk selection. `updated_pipeline/` is the production version with agents, retry, merging, cost tracking, multi-provider support, and resumable runs. `updated_pipeline_v2/` adds a `LeaseVerifierAgent` (a second, independent LLM — typically Claude Opus 4.7 — that re-reads chunks and returns a per-field verdict of correct, incorrect, or unknown) plus placeholder `formula_verifier.py` and `rent_calculation_verifier.py` modules not yet wired into the main orchestrator.

### Edge cases worth knowing

OCR annotations are treated as the source of truth over nearby machine-read text. Rent-free periods are handled by separating term commencement from rent commencement and driving formulas off the latter. Multi-document properties are merged into a single final row. Some leases use different base months for the first review versus subsequent reviews, which the Base Month field and formula must encode. Index data outside the roughly 1988–2026 coverage produces caught lookups and null rents. Ambiguous review dates such as "first Monday in April" must be resolved by surrounding lease context. After retry exhaustion, null fields are retained and marked for manual review rather than dropped.
