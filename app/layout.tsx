import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "GovSignal AI — AI Policy Monitoring",
    template: "%s | GovSignal AI",
  },
  description:
    "Track EU and US AI regulation with daily briefings tailored to your AI product. Monitor policy changes, get impact analysis, and stay compliant.",
  keywords: [
    "AI regulation",
    "EU AI Act",
    "AI policy monitoring",
    "compliance",
    "NIST AI",
    "AI governance",
  ],
  openGraph: {
    title: "GovSignal AI — AI Policy Monitoring",
    description:
      "Track AI policy before it hits your business. Monitor EU & US AI regulation with instant, role-specific briefings.",
    url: "https://govsignal.ai",
    siteName: "GovSignal AI",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "GovSignal AI — AI Policy Monitoring",
    description:
      "Track AI policy before it hits your business. Daily briefings on EU & US AI regulation.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-white text-gray-900`}>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
