import type { Metadata } from "next";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Playful — An AI-Powered Game Engine",
  description:
    "Turn your ideas into playable games with a single prompt. Playful uses AI to generate game mechanics, code, assets, scenes, and interactive experiences, helping creators build, iterate, and launch games faster than ever.",
  metadataBase: new URL("https://playful-virid.vercel.app"),
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Playful — An AI-Powered Game Engine",
    description:
      "Turn your ideas into playable games with a single prompt. Playful uses AI to generate game mechanics, code, assets, scenes, and interactive experiences, helping creators build, iterate, and launch games faster than ever.",
    url: "https://playful-virid.vercel.app",
    siteName: "Playful",
    images: [
      {
        url: "/icon.png",
        width: 1024,
        height: 1024,
        alt: "Playful logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Playful — An AI-Powered Game Engine",
    description:
      "Turn your ideas into playable games with a single prompt.",
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-white">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
