import Link from "next/link";

export const metadata = {
  title: "Politique de confidentialité - WikiRush",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-[#0f0f0f] text-[#f0f0f0]">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#888] hover:text-[#f0f0f0] mb-8 transition-colors"
        >
          ← Retour
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black mb-2">
          Politique de confidentialité
        </h1>
        <p className="text-sm text-[#888] mb-10">
          Dernière mise à jour : avril 2026
        </p>

        <div className="flex flex-col gap-8 text-sm sm:text-base leading-relaxed text-[#ccc]">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#f0f0f0]">
              1. Présentation
            </h2>
            <p>
              WikiRush est un jeu de navigation Wikipedia jouable en solo et en
              multijoueur. Cette politique explique quelles données sont
              collectées, pourquoi, et comment elles sont protégées.
            </p>
            <p>
              Responsable du traitement :{" "}
              <span className="text-[#f0f0f0] font-semibold">DAVID Jessy</span>{" "}
              -{" "}
              <a
                href="mailto:contact@jessy-david.dev"
                className="text-[#7c3aed] hover:underline"
              >
                contact@jessy-david.dev
              </a>
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#f0f0f0]">
              2. Données collectées
            </h2>
            <p>Lors de la création d&apos;un compte, nous collectons :</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-[#ccc]">
              <li>
                <span className="text-[#f0f0f0] font-semibold">Pseudo</span> -
                affiché dans les parties et le classement.
              </li>
              <li>
                <span className="text-[#f0f0f0] font-semibold">
                  Adresse e-mail
                </span>{" "}
                - utilisée uniquement pour l&apos;authentification. Elle
                n&apos;est jamais affichée publiquement.
              </li>
              <li>
                <span className="text-[#f0f0f0] font-semibold">
                  Mot de passe
                </span>{" "}
                - stocké sous forme hachée (bcrypt). Nous n&apos;avons jamais
                accès à votre mot de passe en clair.
              </li>
            </ul>
            <p>Pour chaque partie jouée, nous enregistrons :</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-[#ccc]">
              <li>Mode de jeu (solo / multijoueur / blitz / défi du jour)</li>
              <li>Articles de départ et cible</li>
              <li>Chemin parcouru, nombre de clics, temps</li>
              <li>Résultat (victoire / abandon)</li>
              <li>Date et heure de la partie</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#f0f0f0]">
              3. Finalités et bases légales
            </h2>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>
                <span className="text-[#f0f0f0] font-semibold">
                  Gestion du compte
                </span>{" "}
                - base légale : exécution du contrat (Art. 6.1.b RGPD).
              </li>
              <li>
                <span className="text-[#f0f0f0] font-semibold">
                  Historique de parties et classement
                </span>{" "}
                - base légale : exécution du contrat (Art. 6.1.b RGPD).
              </li>
              <li>
                <span className="text-[#f0f0f0] font-semibold">
                  Session de connexion
                </span>{" "}
                - base légale : intérêt légitime (Art. 6.1.f RGPD) - nécessaire
                au fonctionnement du service.
              </li>
            </ul>
            <p>
              Aucune donnée n&apos;est vendue, partagée ou utilisée à des fins
              commerciales ou publicitaires.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#f0f0f0]">
              4. Durées de conservation
            </h2>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>
                Les données de compte (pseudo, email) sont conservées
                jusqu&apos;à la suppression du compte.
              </li>
              <li>
                Les données de parties sont liées au compte et supprimées avec
                lui.
              </li>
              <li>
                Aucune archive n&apos;est conservée après suppression du compte.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#f0f0f0]">
              5. Stockage et sécurité
            </h2>
            <p>
              Les données sont stockées dans une base SQLite hébergée sur le
              serveur de l&apos;application. Les mots de passe sont hachés avec
              bcrypt avant tout stockage. Les sessions sont gérées via JWT (JSON
              Web Token) et ne contiennent pas d&apos;informations sensibles.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#f0f0f0]">
              6. Hébergement et transferts
            </h2>
            <p>
              WikiRush est hébergé par{" "}
              <span className="text-[#f0f0f0] font-semibold">
                QuantumCraft Studios
              </span>{" "}
              (58 Rue de Monceau, 75008 Paris). L&apos;infrastructure de
              déploiement peut faire appel à des prestataires établis hors UE.
              Dans ce cas, les transferts sont encadrés par des clauses
              contractuelles types (SCC) conformes au RGPD.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#f0f0f0]">
              7. Données de navigation
            </h2>
            <p>
              WikiRush n&apos;utilise pas de cookies tiers, de trackers
              analytiques (Google Analytics, etc.) ni de réseaux publicitaires.
              La session de connexion est stockée dans un cookie HTTP sécurisé
              et httpOnly, nécessaire au fonctionnement de
              l&apos;authentification.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#f0f0f0]">
              8. Vos droits
            </h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>
                <span className="text-[#f0f0f0] font-semibold">Accès</span> -
                consulter vos données via votre page de profil.
              </li>
              <li>
                <span className="text-[#f0f0f0] font-semibold">
                  Portabilité
                </span>{" "}
                - télécharger l&apos;intégralité de vos données au format JSON
                depuis votre profil (bouton &laquo;&nbsp;Télécharger mes
                données&nbsp;&raquo;).
              </li>
              <li>
                <span className="text-[#f0f0f0] font-semibold">
                  Rectification
                </span>{" "}
                - corriger des données inexactes en nous contactant.
              </li>
              <li>
                <span className="text-[#f0f0f0] font-semibold">
                  Suppression
                </span>{" "}
                - supprimer votre compte depuis votre profil, rubrique{" "}
                <span className="italic">Zone dangereuse</span>. Cette action
                supprime immédiatement et définitivement votre compte ainsi que
                l&apos;intégralité de vos données.
              </li>
              <li>
                <span className="text-[#f0f0f0] font-semibold">Opposition</span>{" "}
                - vous opposer à un traitement en nous contactant.
              </li>
            </ul>
            <p>
              Pour exercer ces droits :{" "}
              <a
                href="mailto:contact@jessy-david.dev"
                className="text-[#7c3aed] hover:underline"
              >
                contact@jessy-david.dev
              </a>
            </p>
            <p>
              Vous pouvez également introduire une réclamation auprès de la{" "}
              <a
                href="https://www.cnil.fr/fr/plaintes"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7c3aed] hover:underline"
              >
                CNIL
              </a>
              .
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#f0f0f0]">
              9. Contact
            </h2>
            <p>
              Pour toute question relative à vos données personnelles :{" "}
              <a
                href="mailto:contact@jessy-david.dev"
                className="text-[#7c3aed] hover:underline"
              >
                contact@jessy-david.dev
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
