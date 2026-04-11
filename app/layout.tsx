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

const siteUrl = "https://wikirush.xyz";
const siteName = "WikiRush";
const defaultTitle = "WikiRush - Jeu Wikipédia en ligne rapide et multijoueur";
const description =
  "Joue à WikiRush, le jeu Wikipédia en ligne où tu dois naviguer d'article en article pour atteindre la page cible le plus vite possible. Solo, duel, score et fun immédiat.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: defaultTitle,
    template: "%s | WikiRush",
  },

  description,

  applicationName: siteName,
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  category: "games",
  referrer: "origin-when-cross-origin",

  keywords: [
    "WikiRush",
    "jeu Wikipédia",
    "jeu Wikipedia",
    "wikipedia game",
    "wiki game",
    "jeu de navigation Wikipédia",
    "course Wikipédia",
    "jeu navigateur",
    "jeu en ligne",
    "jeu multijoueur",
    "culture générale",
    "jeu gratuit",
    "navigation Wikipedia",
  ],

  alternates: {
    canonical: "/",
    languages: {
      "fr-FR": "/",
    },
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName,
    title: defaultTitle,
    description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WikiRush - Jeu Wikipédia en ligne rapide et multijoueur",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description,
    images: ["/og-image.png"],
    creator: "@wikirush",
    site: "@wikirush",
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon.ico"],
  },

  manifest: "/site.webmanifest",

  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: "default",
  },

  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },

  other: {
    "theme-color": "#0f0f0f",
    "color-scheme": "dark",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      description,
      inLanguage: "fr-FR",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/wikirush.png`,
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: "contact@jessy-david.dev",
        contactType: "customer support",
        availableLanguage: "French",
      },
    },
    {
      "@type": "VideoGame",
      "@id": `${siteUrl}/#game`,
      name: siteName,
      description,
      url: siteUrl,
      image: `${siteUrl}/og-image.png`,
      inLanguage: "fr-FR",
      applicationCategory: "Game",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
      },
      gamePlatform: "Web Browser",
      genre: ["Trivia", "Educational", "Multiplayer"],
      author: {
        "@type": "Person",
        name: "DAVID Jessy",
        url: "https://jessy-david.dev",
      },
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      url: siteUrl,
      name: defaultTitle,
      isPartOf: { "@id": `${siteUrl}/#website` },
      about: { "@id": `${siteUrl}/#game` },
      inLanguage: "fr-FR",
    },
  ],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
