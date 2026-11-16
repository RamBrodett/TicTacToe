import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wood & Gear · Tic-Tac-Toe",
  description:
    "A two-player tic-tac-toe with oak planks and rusty gears. Play Classic, or Shifting, where your oldest piece vanishes.",
};

export const viewport: Viewport = {
  themeColor: "#0f1214",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable} antialiased`}>
      <body className="min-h-svh">{children}</body>
    </html>
  );
}
