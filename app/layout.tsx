import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WikiRush - Jeu de navigation Wikipedia",
  description:
    "Navigue entre les articles Wikipedia pour atteindre la cible en premier !",
  metadataBase: new URL("https://wikirush.xyz"),
  openGraph: {
    title: "WikiRush",
    description:
      "Navigue entre les articles Wikipedia pour atteindre la cible en premier !",
    url: "https://wikirush.xyz",
    siteName: "WikiRush",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ background: "#0f0f0f", color: "#f0f0f0" }}
      >
        <Providers>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-[#2e2e2e] py-4 px-4 flex items-center justify-center gap-4 text-xs text-[#555]">
            <span>© {new Date().getFullYear()} WikiRush</span>
            <span>·</span>
            <a href="/privacy" className="hover:text-[#888] transition-colors">
              Politique de confidentialité
            </a>
            <span>·</span>
            <a
              href="/mentions-legales"
              className="hover:text-[#888] transition-colors"
            >
              Mentions légales
            </a>
            <span>·</span>
            <a href="/about" className="hover:text-[#888] transition-colors">
              À propos
            </a>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
