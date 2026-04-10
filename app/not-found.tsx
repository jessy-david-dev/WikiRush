import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page introuvable - WikiRush",
  description: "Cette page n'existe pas.",
};

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-[#0f0f0f] text-[#f0f0f0] px-4 py-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-md flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col gap-2">
          <span className="text-7xl font-bold text-[#2e2e2e]">404</span>
          <h1 className="text-xl font-bold">Page introuvable</h1>
          <p className="text-[#888] text-sm leading-relaxed">
            Cet article n&apos;existe pas sur WikiRush.
            <br />
            Tu t&apos;es peut-être perdu en chemin ?
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                     bg-[#1f1f1f] border border-[#2e2e2e] text-[#e5e5e5]
                     hover:bg-[#2a2a2a] hover:border-[#3a3a3a]
                     transition-all duration-200"
        >
          <span className="text-base">←</span>
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
