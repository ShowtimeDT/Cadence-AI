import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: 'Cadence - AI-Powered Fantasy Football',
  description: 'The most intelligent fantasy football platform. AI-driven insights, real-time scoring, and industry-leading accessibility.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
