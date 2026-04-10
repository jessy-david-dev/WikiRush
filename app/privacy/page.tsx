export const metadata = {
  title: "Politique de confidentialité — WikiRush",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-[#0f0f0f] text-[#f0f0f0]">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-[#888] hover:text-[#f0f0f0] mb-8 transition-colors">
          ← Retour
        </a>

        <h1 className="text-3xl sm:text-4xl font-black mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-[#888] mb-10">Dernière mise à jour : avril 2025</p>

        <div className="flex flex-col gap-8 text-sm sm:text-base leading-relaxed text-[#ccc]">

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#f0f0f0]">1. Présentation</h2>
            <p>
              WikiRush est un jeu de navigation Wikipedia jouable en solo et en multijoueur.
              Cette politique explique quelles données sont collectées, pourquoi, et comment elles sont protégées.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#f0f0f0]">2. Données collectées</h2>
            <p>Lors de la création d&apos;un compte, nous collectons :</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-[#ccc]">
              <li><span className="text-[#f0f0f0] font-semibold">Pseudo</span> — affiché dans les parties et le classement.</li>
              <li><span className="text-[#f0f0f0] font-semibold">Adresse e-mail</span> — utilisée uniquement pour l&apos;authentification. Elle n&apos;est jamais affichée publiquement.</li>
              <li><span className="text-[#f0f0f0] font-semibold">Mot de passe</span> — stocké sous forme hachée (bcrypt). Nous n&apos;avons jamais accès à votre mot de passe en clair.</li>
            </ul>
            <p>Pour chaque partie jouée, nous enregistrons :</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-[#ccc]">
              <li>Mode de jeu (solo / multijoueur)</li>
              <li>Articles de départ et cible</li>
              <li>Chemin parcouru, nombre de clics, temps</li>
              <li>Résultat (victoire / abandon)</li>
              <li>Date et heure de la partie</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#f0f0f0]">3. Utilisation des données</h2>
            <p>Les données collectées servent exclusivement à :</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>Afficher votre historique de parties dans votre profil.</li>
              <li>Alimenter le classement global (pseudo + statistiques uniquement).</li>
              <li>Maintenir votre session de connexion.</li>
            </ul>
            <p>Aucune donnée n&apos;est vendue, partagée ou utilisée à des fins commerciales ou publicitaires.</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#f0f0f0]">4. Stockage et sécurité</h2>
            <p>
              Les données sont stockées dans une base SQLite hébergée localement sur le serveur de l&apos;application.
              Les mots de passe sont hachés avec bcrypt avant tout stockage.
              Les sessions sont gérées via JWT (JSON Web Token) et ne contiennent pas d&apos;informations sensibles.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#f0f0f0]">5. Données de navigation</h2>
            <p>
              WikiRush n&apos;utilise pas de cookies tiers, de trackers analytiques (Google Analytics, etc.) ni de réseaux publicitaires.
              La session de connexion est stockée dans un cookie HTTP sécurisé et httpOnly, nécessaire au fonctionnement de l&apos;authentification.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#f0f0f0]">6. Vos droits</h2>
            <p>Vous pouvez à tout moment :</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li><span className="text-[#f0f0f0] font-semibold">Consulter</span> vos données via votre page de profil.</li>
              <li>
                <span className="text-[#f0f0f0] font-semibold">Supprimer</span> votre compte directement depuis votre profil,
                rubrique <span className="italic">Zone dangereuse</span>. Cette action supprime immédiatement et définitivement
                votre compte ainsi que l&apos;intégralité de vos parties enregistrées.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#f0f0f0]">7. Contact</h2>
            <p>
              Pour toute question relative à vos données personnelles, contactez-nous via la page GitHub du projet.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
