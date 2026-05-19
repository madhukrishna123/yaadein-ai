import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yaadein AI | Restore memories lost in time",
  description:
    "Send an old photo on WhatsApp. Yaadein AI restores it into a beautiful HD memory with a free watermarked preview."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
