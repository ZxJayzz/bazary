"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export default function TermsPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "fr";

  const lastUpdated = "20 fevrier 2026";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href={`/${locale}`} className="hover:text-primary transition-colors">
              {t("common.siteName")}
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-600">
              {locale === "mg" ? "Fepetra fampiasana" : "Conditions d'utilisation"}
            </span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === "mg"
              ? "Fepetra Fampiasana"
              : "Conditions Generales d'Utilisation"}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {locale === "mg"
              ? `Novaina farany tamin'ny ${lastUpdated}`
              : `Derniere mise a jour : ${lastUpdated}`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8 space-y-8">

            {/* Table of Contents */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                {locale === "mg" ? "Votoatiny" : "Sommaire"}
              </h2>
              <ol className="space-y-1.5 text-sm">
                {[
                  locale === "mg" ? "Fampidirana" : "Preambule",
                  locale === "mg" ? "Famaritana" : "Definitions",
                  locale === "mg" ? "Fanadihadiana ny serivisy" : "Objet du service",
                  locale === "mg" ? "Fisoratana anarana" : "Inscription et compte utilisateur",
                  locale === "mg" ? "Fandrosoana filazana" : "Publication d'annonces",
                  locale === "mg" ? "Adidy sy andraikitry ny mpampiasa" : "Obligations des utilisateurs",
                  locale === "mg" ? "Entana tsy azo arotsaka" : "Contenus interdits",
                  locale === "mg" ? "Fifandraisana eo amin'ny mpampiasa" : "Transactions entre utilisateurs",
                  locale === "mg" ? "Fananana ara-tsaina" : "Propriete intellectuelle",
                  locale === "mg" ? "Famerana andraikitra" : "Limitation de responsabilite",
                  locale === "mg" ? "Fanafoahana" : "Resiliation",
                  locale === "mg" ? "Lalana ampiharina" : "Droit applicable",
                ].map((title, idx) => (
                  <li key={idx}>
                    <a
                      href={`#article-${idx + 1}`}
                      className="text-gray-600 hover:text-primary transition-colors"
                    >
                      {idx + 1}. {title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>

            {/* Article 1 - Preambule */}
            <section id="article-1">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">1</span>
                {locale === "mg" ? "Fampidirana" : "Preambule"}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  {locale === "mg"
                    ? "Ity fepetra fampiasana ity dia mifehy ny fampiasana ny sehatra Bazary (www.bazary.mg), serivisy entana an-tserasera natao ho an'ny mponin'i Madagasikara. Ny fampiasana ny sehatra dia midika fanekena tanteraka ity fepetra ity."
                    : "Les presentes Conditions Generales d'Utilisation (ci-apres \"CGU\") regissent l'utilisation de la plateforme Bazary (www.bazary.mg), un service de petites annonces en ligne destine aux residents de Madagascar. L'utilisation de la plateforme implique l'acceptation pleine et entiere des presentes CGU."}
                </p>
                <p>
                  {locale === "mg"
                    ? "Ny Bazary dia sehatra fifandraisana mampifandray ny mpampiasa te hivarotra sy hividy entana eo an-toerana. Ny Bazary dia tsy mpandrindra ny varotra ary tsy miantoka ny fifanarahana eo amin'ny mpampiasa."
                    : "Bazary est une plateforme de mise en relation entre utilisateurs souhaitant vendre et acheter des biens localement. Bazary n'est pas partie prenante dans les transactions et ne garantit pas les accords entre utilisateurs."}
                </p>
              </div>
            </section>

            {/* Article 2 - Definitions */}
            <section id="article-2">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">2</span>
                {locale === "mg" ? "Famaritana" : "Definitions"}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">-</span>
                    <span>
                      <strong>{locale === "mg" ? "\"Sehatra\"" : "\"Plateforme\""}</strong>{" "}
                      {locale === "mg"
                        ? ": ny tranokala sy ny rindranasa Bazary."
                        : ": designe le site web et l'application Bazary."}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">-</span>
                    <span>
                      <strong>{locale === "mg" ? "\"Mpampiasa\"" : "\"Utilisateur\""}</strong>{" "}
                      {locale === "mg"
                        ? ": ny olon-drehetra misoratra anarana sy mampiasa ny Sehatra."
                        : ": designe toute personne inscrite et utilisant la Plateforme."}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">-</span>
                    <span>
                      <strong>{locale === "mg" ? "\"Filazana\"" : "\"Annonce\""}</strong>{" "}
                      {locale === "mg"
                        ? ": ny entana na serivisy arotsaky ny Mpampiasa ao amin'ny Sehatra."
                        : ": designe toute offre de bien ou service publiee par un Utilisateur sur la Plateforme."}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">-</span>
                    <span>
                      <strong>{locale === "mg" ? "\"Serivisy\"" : "\"Service\""}</strong>{" "}
                      {locale === "mg"
                        ? ": ny fitaovana rehetra omen'ny Bazary amin'ny Mpampiasa."
                        : ": designe l'ensemble des fonctionnalites proposees par Bazary aux Utilisateurs."}
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Article 3 - Objet du service */}
            <section id="article-3">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">3</span>
                {locale === "mg" ? "Fanadihadiana ny serivisy" : "Objet du service"}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  {locale === "mg"
                    ? "Ny Bazary dia manome sehatra maimaim-poana ahafahan'ny mpampiasa:"
                    : "Bazary fournit une plateforme gratuite permettant aux utilisateurs de :"}
                </p>
                <ul className="space-y-2 ml-4">
                  {(locale === "mg"
                    ? [
                        "Mamorona filazana hivarotra entana efa nampiasaina na vaovao",
                        "Mitady sy mandinika filazana",
                        "Mifandray mivantana amin'ny mpivarotra sy ny mpividy",
                        "Manao lisitry ny entana tiany (Tia)",
                      ]
                    : [
                        "Publier des annonces pour vendre des biens neufs ou d'occasion",
                        "Rechercher et consulter des annonces",
                        "Communiquer directement avec les vendeurs et acheteurs via la messagerie",
                        "Sauvegarder des annonces en favoris",
                      ]
                  ).map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <svg className="w-4 h-4 text-accent shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Article 4 - Inscription */}
            <section id="article-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">4</span>
                {locale === "mg" ? "Fisoratana anarana" : "Inscription et compte utilisateur"}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  {locale === "mg"
                    ? "Ny fidirana amin'ny Serivisy dia mitaky fisoratana anarana maimaim-poana. Ny Mpampiasa dia tsy maintsy manome vaovao marina sy mifanaraka amin'ny tena izy."
                    : "L'acces au Service necessite une inscription gratuite. L'Utilisateur doit fournir des informations exactes et conformes a la realite."}
                </p>
                <p>
                  {locale === "mg"
                    ? "Ny Mpampiasa tsirairay dia tompon'andraikitra amin'ny fitahirizana ny tsiambaratelon'ny kaontiny. Ny fampiasana tsy nahazoana alalana ny kaonty dia tsy andraikitry ny Bazary."
                    : "Chaque Utilisateur est responsable de la confidentialite de son compte. Toute utilisation non autorisee du compte ne saurait engager la responsabilite de Bazary."}
                </p>
                <p>
                  {locale === "mg"
                    ? "Ny taona ambaniny ahafahana misoratra anarana dia 18 taona. Ny Mpampiasa dia manamafy fa efa ampy taona izy amin'ny fisoratana anarana."
                    : "L'age minimum requis pour s'inscrire est de 18 ans. L'Utilisateur certifie avoir l'age legal requis lors de son inscription."}
                </p>
              </div>
            </section>

            {/* Article 5 - Publication */}
            <section id="article-5">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">5</span>
                {locale === "mg" ? "Fandrosoana filazana" : "Publication d'annonces"}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  {locale === "mg"
                    ? "Ny Mpampiasa dia afaka mandefa filazana maimaim-poana. Ny filazana tsirairay dia tsy maintsy:"
                    : "L'Utilisateur peut publier des annonces gratuitement. Chaque annonce doit :"}
                </p>
                <ul className="space-y-2 ml-4">
                  {(locale === "mg"
                    ? [
                        "Mamaritra mazava ny entana na serivisy arotsaka",
                        "Manana sary marina mifanaraka amin'ny entana (5 sary farafahabetsany)",
                        "Manondro vidiny mazava amin'ny Ariary Malagasy (MGA)",
                        "Manondro ny toerana (tanana sy fokontany) misy ny entana",
                        "Mifanaraka amin'ny lalana velona eto Madagasikara",
                      ]
                    : [
                        "Decrire clairement le bien ou service propose",
                        "Contenir des photos authentiques correspondant au bien (5 photos maximum)",
                        "Indiquer un prix clair en Ariary Malgache (MGA)",
                        "Preciser la localisation (ville et quartier) du bien",
                        "Etre conforme a la legislation en vigueur a Madagascar",
                      ]
                  ).map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <svg className="w-4 h-4 text-accent shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p>
                  {locale === "mg"
                    ? "Ny Bazary dia afaka manaisotra ny filazana tsy mifanaraka amin'ireo fepetra ireo tsy mila fampilazana mialoha."
                    : "Bazary se reserve le droit de supprimer toute annonce ne respectant pas ces conditions sans preavis."}
                </p>
              </div>
            </section>

            {/* Article 6 - Obligations */}
            <section id="article-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">6</span>
                {locale === "mg" ? "Adidy sy andraikitry ny mpampiasa" : "Obligations des utilisateurs"}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  {locale === "mg"
                    ? "Ny Mpampiasa dia manaiky ny:"
                    : "L'Utilisateur s'engage a :"}
                </p>
                <ul className="space-y-2 ml-4">
                  {(locale === "mg"
                    ? [
                        "Tsy mampiasa ny Sehatra amin'ny fomba tsy ara-dalana",
                        "Manaja ny mpampiasa hafa sy ny fahamendrehany",
                        "Tsy mandefa hafatra spam na varotra mandainga",
                        "Tsy mampiasa kaonty maro ho an'ny tanjona tsy mety",
                        "Mametraka ny filazany ho \"Lafo\" rehefa vita ny varotra",
                      ]
                    : [
                        "Ne pas utiliser la Plateforme a des fins illegales",
                        "Respecter les autres utilisateurs et leur dignite",
                        "Ne pas envoyer de messages non sollicites (spam) ou fausses annonces",
                        "Ne pas utiliser plusieurs comptes a des fins abusives",
                        "Marquer ses annonces comme \"Vendu\" une fois la transaction effectuee",
                      ]
                  ).map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-primary font-bold">-</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Article 7 - Contenus interdits */}
            <section id="article-7">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">7</span>
                {locale === "mg" ? "Entana tsy azo arotsaka" : "Contenus interdits"}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  {locale === "mg"
                    ? "Ireto entana sy serivisy manaraka ireto dia tsy azo arotsaka amin'ny Sehatra:"
                    : "Les biens et services suivants sont strictement interdits sur la Plateforme :"}
                </p>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <ul className="space-y-2">
                    {(locale === "mg"
                      ? [
                          "Zava-mahadomelina sy zava-pisotro misy alikaola (afa-tsy araka ny lalana)",
                          "Fitaovam-piadiana sy bala",
                          "Entana halatra na azo tamin'ny fomba tsy ara-dalana",
                          "Entana sandoka na kopia tsy nahazoana alalana",
                          "Biby voaaro na vokatra avy amin'ireo",
                          "Entana misy fiantraikany amin'ny fahasalamana (fanafody tsy ara-dalana, sns.)",
                          "Votoaty mampirisika herisetra, fanavakavahana na mifanohitra amin'ny fomba amam-panao tsara",
                          "Entana rehetra manohitra ny lalana Malagasy",
                        ]
                      : [
                          "Drogues et substances illicites, alcool (sauf cadre legal)",
                          "Armes et munitions",
                          "Biens voles ou obtenus illegalement",
                          "Contrefacons et copies non autorisees",
                          "Animaux proteges ou produits derives",
                          "Produits dangereux pour la sante (medicaments non autorises, etc.)",
                          "Contenus incitant a la violence, a la discrimination ou contraires aux bonnes moeurs",
                          "Tout bien contraire a la legislation malgache",
                        ]
                    ).map((item, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-red-700">
                        <svg className="w-4 h-4 text-secondary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Article 8 - Transactions */}
            <section id="article-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">8</span>
                {locale === "mg" ? "Fifandraisana eo amin'ny mpampiasa" : "Transactions entre utilisateurs"}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  {locale === "mg"
                    ? "Ny varotra dia atao mivantana eo amin'ny mpampiasa roa. Ny Bazary dia tsy mandray anjara amin'ny varotra ary tsy miantoka:"
                    : "Les transactions sont effectuees directement entre utilisateurs. Bazary n'intervient pas dans les transactions et ne garantit pas :"}
                </p>
                <ul className="space-y-2 ml-4">
                  {(locale === "mg"
                    ? [
                        "Ny kalitaon'ny entana na ny maha-marina ny filazana",
                        "Ny fahatanterahan'ny varotra",
                        "Ny fandoavam-bola na ny famerenana vola",
                        "Ny fahamarinan'ny vaovao nomen'ny mpampiasa",
                      ]
                    : [
                        "La qualite des biens ou la veracite des annonces",
                        "La bonne execution des transactions",
                        "Le paiement ou le remboursement",
                        "L'exactitude des informations fournies par les utilisateurs",
                      ]
                  ).map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-primary font-bold">-</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-orange-800">
                  <p className="font-medium mb-1">
                    {locale === "mg" ? "Torohevitra:" : "Conseil :"}
                  </p>
                  <p>
                    {locale === "mg"
                      ? "Mifanehatra amin'ny toerana iombonana sy azo antoka ary jereo tsara ny entana alohan'ny hividianana."
                      : "Privilegiez les rencontres dans des lieux publics et securises et verifiez bien l'article avant tout achat."}
                  </p>
                </div>
              </div>
            </section>

            {/* Article 9 - Propriete intellectuelle */}
            <section id="article-9">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">9</span>
                {locale === "mg" ? "Fananana ara-tsaina" : "Propriete intellectuelle"}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  {locale === "mg"
                    ? "Ny Sehatra sy ny votoatiny rehetra ao (logo, endrika, rindranasa) dia fananan'ny Bazary. Ny kopia, ny fandraisana na ny fitsinjarana tsy nahazoana alalana dia voarara."
                    : "La Plateforme et l'ensemble de son contenu (logo, design, logiciels) sont la propriete exclusive de Bazary. Toute reproduction, extraction ou diffusion non autorisee est interdite."}
                </p>
                <p>
                  {locale === "mg"
                    ? "Amin'ny fandrosoana filazana, ny Mpampiasa dia manome ny Bazary alalana tsy misy fepetra hampiasa ny sary sy ny votoatiny ao anatin'ny serivisy."
                    : "En publiant une annonce, l'Utilisateur accorde a Bazary une licence non exclusive d'utilisation des images et contenus dans le cadre du Service."}
                </p>
              </div>
            </section>

            {/* Article 10 - Limitation de responsabilite */}
            <section id="article-10">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">10</span>
                {locale === "mg" ? "Famerana andraikitra" : "Limitation de responsabilite"}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  {locale === "mg"
                    ? "Ny Bazary dia manao izay rehetra azo atao mba hiantohana ny fahazoana ny Sehatra, kanefa tsy afaka miantoka ny tsy fisian'ny olana ara-teknika."
                    : "Bazary met tout en oeuvre pour assurer la disponibilite de la Plateforme, mais ne peut garantir l'absence de dysfonctionnements techniques."}
                </p>
                <p>
                  {locale === "mg"
                    ? "Ny Bazary dia tsy tompon'andraikitra amin'ny:"
                    : "Bazary ne saurait etre tenu responsable :"}
                </p>
                <ul className="space-y-2 ml-4">
                  {(locale === "mg"
                    ? [
                        "Ny varotra tsy nahomby eo amin'ny mpampiasa",
                        "Ny fatiantoka vokatry ny fampiasana ny Sehatra",
                        "Ny votoatiny narotsaky ny mpampiasa",
                        "Ny fanapahana ny serivisy noho ny antony teknika",
                      ]
                    : [
                        "Des transactions echouees entre utilisateurs",
                        "Des dommages resultant de l'utilisation de la Plateforme",
                        "Du contenu publie par les utilisateurs",
                        "Des interruptions de service pour raisons techniques",
                      ]
                  ).map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-primary font-bold">-</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Article 11 - Resiliation */}
            <section id="article-11">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">11</span>
                {locale === "mg" ? "Fanafoahana" : "Resiliation"}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  {locale === "mg"
                    ? "Ny Mpampiasa dia afaka mamafa ny kaontiny amin'ny fotoana rehetra. Ny Bazary dia afaka manafoana na manakana ny kaonty amin'ny antony maro:"
                    : "L'Utilisateur peut supprimer son compte a tout moment. Bazary peut suspendre ou supprimer un compte pour les motifs suivants :"}
                </p>
                <ul className="space-y-2 ml-4">
                  {(locale === "mg"
                    ? [
                        "Tsy fanajana ny Fepetra Fampiasana",
                        "Fihetsika mamitaka na manao hosoka",
                        "Fandrosoana filazana tsy azo ekena im-betsaka",
                        "Fitarainana maro avy amin'ny mpampiasa hafa",
                      ]
                    : [
                        "Non-respect des presentes CGU",
                        "Comportement frauduleux ou trompeur",
                        "Publication repetee d'annonces non conformes",
                        "Signalements multiples de la part d'autres utilisateurs",
                      ]
                  ).map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-primary font-bold">-</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Article 12 - Droit applicable */}
            <section id="article-12">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">12</span>
                {locale === "mg" ? "Lalana ampiharina" : "Droit applicable"}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  {locale === "mg"
                    ? "Ity Fepetra Fampiasana ity dia fehezin'ny lalana Malagasy. Ny fifandirana rehetra mifandray amin'ny fampiasana ny Sehatra dia handaminana aloha amin'ny alalan'ny fifampiraharahana. Raha tsy vita izany, dia ny Fitsarana kompetanta ao Antananarivo no hanapaka."
                    : "Les presentes CGU sont regies par le droit malgache. Tout litige relatif a l'utilisation de la Plateforme sera d'abord soumis a une tentative de resolution amiable. A defaut d'accord, les tribunaux competents d'Antananarivo seront seuls competents."}
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {locale === "mg" ? "Mifandraisa aminay" : "Nous contacter"}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  {locale === "mg"
                    ? "Raha manana fanontaniana momba ireto fepetra ireto ianao:"
                    : "Pour toute question relative aux presentes conditions :"}
                </p>
                <p className="font-medium">Email : contact@bazary.mg</p>
                <p className="font-medium">
                  {locale === "mg" ? "Telefaonina" : "Telephone"} : +261 34 00 000 00
                </p>
                <p>Antananarivo, Madagascar</p>
              </div>
            </section>

          </div>
        </div>

        {/* Back to privacy link */}
        <div className="mt-6 text-center">
          <Link
            href={`/${locale}/privacy`}
            className="text-sm text-primary hover:underline"
          >
            {locale === "mg"
              ? "Jereo koa ny Politikan'ny tsiambaratelo"
              : "Voir egalement la Politique de confidentialite"}
          </Link>
        </div>
      </div>
    </div>
  );
}
