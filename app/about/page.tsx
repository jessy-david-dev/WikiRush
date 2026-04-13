import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  siNextdotjs,
  siReact,
  siTailwindcss,
  siPrisma,
  siSqlite,
  siWikipedia,
  siGithub,
} from "simple-icons";

export const metadata: Metadata = {
  title: "À propos - WikiRush",
  description: "WikiRush, le jeu de navigation Wikipedia.",
};

export default function AboutPage() {
  return (
    <div className="min-h-dvh bg-[#0f0f0f] text-[#f0f0f0] px-4 py-12 flex flex-col items-center">
      <div className="w-full max-w-xl flex flex-col gap-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                  bg-[#1f1f1f] border border-[#2e2e2e] text-[#e5e5e5]
                  hover:bg-[#2a2a2a] hover:border-[#3a3a3a]
                  transition-all duration-200"
        >
          <span className="text-base">←</span>
          Retour
        </Link>

        {/* Hero */}
        <div className="flex flex-col gap-2">
          <Image
            src="/wikirush.png"
            alt="WikiRush"
            width={120}
            height={120}
            className="w-24 h-auto mix-blend-screen"
          />

          <p className="text-[#888] text-sm sm:text-base leading-relaxed max-w-md">
            Le jeu de navigation Wikipedia. Pars d&apos;un article, atteins la
            cible en cliquant sur les liens. Simple en apparence, redoutablement
            stratégique.
          </p>
        </div>

        {/* Modes */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#555]">
            Modes de jeu
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                icon: "🎯",
                name: "Solo",
                desc: "À ton rythme, chrono et compteur de clics pour battre tes records.",
              },
              {
                icon: "⚔️",
                name: "Multijoueur",
                desc: "Affronte d'autres joueurs en temps réel. Le premier à la cible gagne.",
              },
              {
                icon: "🗓",
                name: "Défi du jour",
                desc: "Un puzzle identique pour tout le monde. Classement journalier.",
              },
              {
                icon: "⚡",
                name: "Mode Blitz",
                desc: "2 minutes pour atteindre la cible. Chaque seconde compte.",
              },
            ].map(({ icon, name, desc }) => (
              <div
                key={name}
                className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4 flex flex-col gap-2"
              >
                <div className="text-2xl">{icon}</div>
                <div className="font-bold text-sm">{name}</div>
                <div className="text-[#888] text-xs leading-relaxed">
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stack */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#555]">
            Technologies
          </h2>
          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4 flex flex-wrap gap-3">
            {[
              { si: siNextdotjs, name: "Next.js" },
              { si: siReact, name: "React" },
              { si: siTailwindcss, name: "Tailwind CSS" },
              { si: siPrisma, name: "Prisma" },
              { si: siSqlite, name: "SQLite" },
              { si: siWikipedia, name: "Wikipedia" },
            ].map(({ si, name }) => (
              <div
                key={name}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#242424] border border-[#2e2e2e]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 shrink-0"
                  style={{ fill: `#${si.hex}` }}
                  aria-hidden="true"
                >
                  <path d={si.path} />
                </svg>
                <span className="text-xs font-medium text-[#aaa]">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#555]">
            Badges
          </h2>
          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl divide-y divide-[#2e2e2e]">
            {[
              {
                file: "novice",
                name: "Novice",
                label: "Moins de 5 victoires",
                range: "< 5",
              },
              {
                file: "apprenti",
                name: "Apprenti",
                label: "5 victoires et plus",
                range: "5+",
              },
              {
                file: "initié",
                name: "Initié",
                label: "20 victoires et plus",
                range: "20+",
              },
              {
                file: "adepte",
                name: "Adepte",
                label: "50 victoires et plus",
                range: "50+",
              },
              {
                file: "expert",
                name: "Expert",
                label: "150 victoires et plus",
                range: "150+",
              },
              {
                file: "maître",
                name: "Maître",
                label: "500 victoires et plus",
                range: "500+",
              },
              {
                file: "légende",
                name: "Légende",
                label: "1 000 victoires et plus",
                range: "1 000+",
              },
              {
                file: "mythique",
                name: "Mythique",
                label: "2 500 victoires et plus",
                range: "2 500+",
              },
              {
                file: "transcendant",
                name: "Transcendant",
                label: "5 000 victoires et plus",
                range: "5 000+",
              },
              {
                file: "omniscient",
                name: "Omniscient",
                label: "10 000 victoires et plus",
                range: "10 000+",
              },
            ].map(({ file, name, label, range }) => (
              <div key={file} className="flex items-center gap-3 px-4 py-2.5">
                <Image
                  src={`/badges/${file}.Png`}
                  alt={name}
                  width={28}
                  height={28}
                  className="shrink-0"
                />
                <span className="text-sm font-semibold text-[#f0f0f0] w-28 shrink-0">
                  {name}
                </span>
                <span className="text-sm text-[#888] flex-1 text-center">
                  {label}
                </span>
                <span className="text-xs font-mono text-[#555] w-16 text-right shrink-0">
                  {range}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#555]">
            Contact
          </h2>
          <a
            href="https://github.com/jessy-david-dev/WikiRush"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#1a1a1a] border border-[#2e2e2e] hover:border-[#3a3a3a] hover:bg-[#222] transition-colors rounded-xl px-4 py-3 text-sm font-medium text-[#f0f0f0]"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 shrink-0"
              style={{ fill: `#${siGithub.hex}` }}
              aria-hidden="true"
            >
              <path d={siGithub.path} />
            </svg>
            jessy-david-dev/WikiRush
            <span className="ml-auto text-[#555] text-xs">GitHub →</span>
          </a>
          <p className="text-[#888] text-xs leading-relaxed">
            Une idée, un bug, une suggestion ? Ouvre une issue sur le dépôt.
          </p>
        </div>
      </div>
    </div>
  );
}
