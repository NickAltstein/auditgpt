import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { CookieConsent } from "@/components/cookie-consent";
import { JsonLd, AuditGPTOrganizationSchema, AuditGPTSoftwareSchema } from "@/components/json-ld";

export const viewport: Viewport = {
  themeColor: "#ebeff5",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://auditgpt.ai"),
  title: "AuditGPT.ai — Adversarial Stress-Testing & CI/CD Gate for Autonomous AI Agents",
  description:
    "Snyk for Autonomous AI Agents. Run the open-source CLI (npx auditgpt) to catch recursive retry loops, destructive tool calls, prompt injections, and runaway token costs before merging to production.",
  alternates: {
    canonical: "https://auditgpt.ai",
  },
  keywords: [
    "AI agent stress testing",
    "Snyk for AI agents",
    "adversarial AI testing",
    "ASTI v1.1 standard",
    "autonomous agent CI/CD gate",
    "prompt injection defense",
    "token blowout protection",
    "agent observability",
    "npx auditgpt",
  ],
  authors: [{ name: "AuditGPT.ai" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    title: "AuditGPT.ai — Adversarial Stress-Testing & CI/CD Gate for Autonomous AI Agents",
    description:
      "Snyk for Autonomous AI Agents. Run the open-source CLI (npx auditgpt) to catch recursive retry loops, destructive tool calls, prompt injections, and runaway token costs before merging to production.",
    type: "website",
    siteName: "AuditGPT.ai",
    images: [{ url: "/logo-full.png", width: 1200, height: 285, alt: "AuditGPT.ai" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AuditGPT.ai — Adversarial Stress-Testing & CI/CD Gate for Autonomous AI Agents",
    description:
      "Snyk for Autonomous AI Agents. Catch recursive retry loops, prompt injections, and runaway token costs before merging to production.",
    images: ["/logo-full.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd type="Organization" data={AuditGPTOrganizationSchema} />
        <JsonLd type="SoftwareApplication" data={AuditGPTSoftwareSchema} />
      </head>
      <body className="min-h-screen overflow-x-clip bg-[#f4f6f9] text-[#111827] antialiased selection:bg-[#c8f135] selection:text-[#111827]">
        <Providers>
          {children}
          <CookieConsent />
          <SonnerToaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
