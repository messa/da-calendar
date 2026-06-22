import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kalendář akcí a kurzů | Daily Adventures",
  description: "Přehled outdoorových akcí, kurzů a dobrodružství od Daily Adventures. Lezení, skialpinismus, via ferraty a další.",
  keywords: "kalendář, kurzy, akce, outdoor, dobrodružství, lezení, skialpinismus, via ferrata, Daily Adventures",
  authors: [{ name: "Daily Adventures" }],
  openGraph: {
    title: "Kalendář akcí a kurzů | Daily Adventures",
    description: "Přehled outdoorových akcí, kurzů a dobrodružství od Daily Adventures",
    type: "website",
    locale: "cs_CZ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body style={{ 
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        margin: 0,
        padding: 0,
      }}>
        {children}
      </body>
    </html>
  );
}
