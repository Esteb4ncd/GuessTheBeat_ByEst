import { Geist, Geist_Mono, Londrina_Sketch } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const londrinaSketch = Londrina_Sketch({
  weight: "400",
  variable: "--font-londrina-sketch",
  subsets: ["latin"],
});

export const metadata = {
  title: "Guess The Beat by EST",
  description: "Test your music knowledge by guessing songs from 5-second previews!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${londrinaSketch.variable}`}>
        {children}
      </body>
    </html>
  );
}
