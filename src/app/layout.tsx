import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KANUNI AI - Governance Intelligence, Decision Certainty",
  description: "AI-powered governance and compliance intelligence platform for Africa",
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
