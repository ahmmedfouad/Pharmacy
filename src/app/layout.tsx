import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedScan - Medical Ai Assistant",
  description: "MedScan is an AI-powered medical assistant designed to help users understand and manage their health. It provides personalized insights, answers medical questions, and offers guidance on various health topics. With MedScan, you can easily access reliable medical information and support for a healthier lifestyle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
