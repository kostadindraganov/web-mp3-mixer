import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MP3 Audio Mixer",
  description: "Mix background music with voice overs using Cloudflare R2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
