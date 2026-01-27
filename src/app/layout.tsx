import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KANUNI AI - Document Analysis",
  description: "Advanced governance and compliance intelligence analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#020617]">
        {children}
      </body>
    </html>
  );
}
