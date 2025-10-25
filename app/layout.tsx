import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shared Moments",
  description: "Track experiences you want to share with your partner",
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
