import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/providers/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/providers/ThemeProvider";

// 2+1: Space Grotesk carries display and the wordmark, Geist carries prose,
// JetBrains Mono is the outlier and tags exactly one role — metadata labels.
const display = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const body = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

const SITE_URL = "https://swotlabs.com";

const DESCRIPTION =
  "SwotLabs AGI Limited is an Ireland-based AI services company. We build agentic systems for enterprises in energy, water, aviation and retail across the UK and Europe: multimodal RAG, document pipelines and email triage.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "SwotLabs AGI Limited | Enterprise AI Services",
  description: DESCRIPTION,
  keywords: [
    "AI services",
    "enterprise AI",
    "machine learning",
    "generative AI",
    "MLOps",
    "AI consulting",
    "Ireland",
  ],
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: SITE_URL,
    siteName: "SwotLabs AGI Limited",
    title: "SwotLabs AGI Limited | Enterprise AI Services",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "SwotLabs AGI Limited | Enterprise AI Services",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  // sRGB approximation of --color-paper, oklch(14% 0.012 130).
  themeColor: "#0b0e08",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Apply the saved accent ramp before first paint to avoid a flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SmoothScroll>
          <ThemeProvider>
            <ScrollProgress />
            <div className="grain-overlay" aria-hidden="true" />
            {children}
          </ThemeProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
