"use client";

import { useState } from "react";
import SectionHead from "./SectionHead";
import { useReveal } from "@/lib/useReveal";

/**
 * T2 logo marquee. A single row of client marks that loops like a train,
 * on a full-bleed light strip under the section head. Marks are alpha masks
 * tinted by the panel tokens, so they stay dark on the strip in any theme.
 *
 * Continuous motion needs a way to stop it (WCAG 2.2.2): it pauses on hover
 * and keyboard focus, has an explicit Pause button, and falls back to a
 * static wrapped row under prefers-reduced-motion.
 */

// w/h are the processed mask sizes in public/logos/bw (ink-cropped, 192px tall).
const clients = [
  { name: "UK Power Networks", logo: "/logos/bw/ukpn.png", w: 433, h: 192 },
  { name: "Virgin Atlantic", logo: "/logos/bw/virgin.png", w: 783, h: 192 },
  { name: "Greene King", logo: "/logos/bw/gk.png", w: 357, h: 192 },
  { name: "Northumbrian Water", logo: "/logos/bw/nwg.png", w: 760, h: 192 },
  { name: "CK Delta", logo: "/logos/bw/ckd.png", w: 153, h: 192 },
  { name: "CK Hutchison", logo: "/logos/bw/ckhh.png", w: 960, h: 86 },
  { name: "Civitas Social Housing", logo: "/logos/bw/civitas.png", w: 230, h: 192 },
  { name: "Invicara", logo: "/logos/bw/invicara.png", w: 908, h: 192 },
  { name: "Circana", logo: "/logos/bw/circana.png", w: 642, h: 192 },
  { name: "The NPD Group", logo: "/logos/bw/npd.png", w: 192, h: 192 },
];

/**
 * Optical sizing: every mark gets the same visual area (rem²), so a square
 * crest and an 11:1 wordmark read as equal weight. Width is capped so the
 * longest wordmark doesn't stretch a gap in the train.
 */
const LOGO_AREA = 15;
const LOGO_MAX_H = 3.25;
const LOGO_MAX_W = 13;
const LOGO_SCALE = 1.15 * 1.25;
function logoSize(w: number, h: number) {
  const ratio = w / h;
  let height = Math.min(Math.sqrt(LOGO_AREA / ratio), LOGO_MAX_H);
  if (height * ratio > LOGO_MAX_W) height = LOGO_MAX_W / ratio;
  height *= LOGO_SCALE;
  return { width: `${height * ratio}rem`, height: `${height}rem` };
}

function LogoRow({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="logo-marquee__row" aria-hidden={hidden || undefined}>
      {clients.map((client) => (
        <li key={client.name} className="logo-marquee__item">
          <span
            role={hidden ? undefined : "img"}
            aria-label={hidden ? undefined : client.name}
            className="logo-marquee__mark"
            style={{
              ...logoSize(client.w, client.h),
              maskImage: `url(${client.logo})`,
              WebkitMaskImage: `url(${client.logo})`,
            }}
          />
        </li>
      ))}
    </ul>
  );
}

export default function Clients() {
  const wallRef = useReveal<HTMLDivElement>();
  const [paused, setPaused] = useState(false);

  return (
    <section id="clients" className="section section--continues">
      <div
        className="grid grid-cols-1 lg:grid-cols-12 items-end"
        style={{ gap: "var(--space-xl)" }}
      >
        <SectionHead
          className="lg:col-span-7"
          title="Who we build for"
          lede="Energy and water networks, aviation, hospitality, social housing and consumer-data platforms. Places where a wrong answer reaches a regulator, or an engineer standing in front of a pump."
        />
        <div className="lg:col-span-5 flex lg:justify-end">
          <button
            type="button"
            className="logo-marquee__toggle"
            aria-pressed={paused}
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? "Play" : "Pause"}
          </button>
        </div>
      </div>

      <div
        ref={wallRef}
        className="reveal logo-marquee"
        data-paused={paused || undefined}
        style={{ marginBlockStart: "var(--space-2xl)" }}
      >
        <div className="logo-marquee__viewport">
          <div className="logo-marquee__track">
            <LogoRow />
            <LogoRow hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
