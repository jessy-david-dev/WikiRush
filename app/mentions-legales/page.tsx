import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales - WikiRush",
  description: "Mentions légales du site WikiRush.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-dvh bg-[#0f0f0f] text-[#f0f0f0] px-4 py-12 flex flex-col items-center">
      <div className="w-full max-w-xl flex flex-col gap-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                     bg-[#1f1f1f] border border-[#2e2e2e] text-[#e5e5e5]
                     hover:bg-[#2a2a2a] hover:border-[#3a3a3a] transition-all duration-200 self-start"
        >
          <span className="text-base">←</span>
          Retour
        </Link>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black">Mentions légales</h1>
          <p className="text-[#888] text-sm">
            Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance
            dans l&apos;économie numérique.
          </p>
        </div>

        <section className="flex flex-col gap-6">
          {/* Éditeur */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#555]">
              Éditeur du site
            </h2>
            <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4 flex flex-col gap-1.5 text-sm">
              <p>
                <span className="text-[#888]">
                  Responsable de publication :
                </span>{" "}
                DAVID Jessy
              </p>
              <p>
                <span className="text-[#888]">Contact :</span>{" "}
                <a
                  href="mailto:contact@jessy-david.dev"
                  className="text-[#7c3aed] hover:underline"
                >
                  contact@jessy-david.dev
                </a>
              </p>
            </div>
          </div>

          {/* Hébergeur */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#555]">
              Hébergeur
            </h2>
            <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4 flex flex-col gap-1.5 text-sm">
              <p>
                <span className="text-[#888]">Raison sociale :</span> SAS
                SAPINET
              </p>
              <p>
                <span className="text-[#888]">SIREN :</span> 899 483 457 (RCS
                de Nanterre)
              </p>
              <p>
                <span className="text-[#888]">Adresse :</span> 65 rue de la
                Croix, 92000 Nanterre
              </p>
              <p>
                <span className="text-[#888]">Contact :</span>{" "}
                <a
                  href="mailto:contact@sapi.net"
                  className="text-[#7c3aed] hover:underline"
                >
                  contact@sapi.net
                </a>
              </p>
              <p>
                <span className="text-[#888]">Site web :</span>{" "}
                <a
                  href="https://sapi.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7c3aed] hover:underline"
                >
                  sapi.net
                </a>
              </p>
            </div>
          </div>

          {/* Propriété intellectuelle */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#555]">
              Propriété intellectuelle
            </h2>
            <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4 text-sm text-[#aaa] leading-relaxed">
              <p>
                L&apos;ensemble du contenu de ce site (structure, textes, logos,
                visuels) est la propriété de DAVID Jessy, sauf mentions
                contraires. Toute reproduction, représentation ou diffusion, en
                tout ou partie, est interdite sans autorisation préalable.
              </p>
              <p className="mt-3">
                Les articles consultés durant les parties proviennent de{" "}
                <a
                  href="https://fr.wikipedia.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7c3aed] hover:underline"
                >
                  Wikipédia
                </a>{" "}
                et sont soumis à la licence{" "}
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7c3aed] hover:underline"
                >
                  CC BY-SA 4.0
                </a>
                .
              </p>
            </div>
          </div>

          {/* Données personnelles */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#555]">
              Données personnelles
            </h2>
            <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4 text-sm text-[#aaa] leading-relaxed">
              <p>
                Les données collectées (pseudo, email, historique de parties)
                sont utilisées uniquement pour le fonctionnement du service.
                Elles ne sont pas transmises à des tiers. Conformément au RGPD,
                vous disposez d&apos;un droit d&apos;accès, de rectification et
                de suppression de vos données.
              </p>
              <p className="mt-3">
                Pour exercer ces droits :{" "}
                <a
                  href="mailto:contact@jessy-david.dev"
                  className="text-[#7c3aed] hover:underline"
                >
                  contact@jessy-david.dev
                </a>
              </p>
              <p className="mt-3">
                Consulter notre{" "}
                <Link
                  href="/privacy"
                  className="text-[#7c3aed] hover:underline"
                >
                  politique de confidentialité
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
