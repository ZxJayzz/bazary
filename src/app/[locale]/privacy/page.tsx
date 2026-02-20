"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export default function PrivacyPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "fr";

  const lastUpdated = "20 fevrier 2026";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href={`/${locale}`} className="hover:text-primary transition-colors">
              {t("common.siteName")}
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-600">
              {locale === "mg" ? "Politikan'ny tsiambaratelo" : "Politique de confidentialite"}
            </span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === "mg"
              ? "Politikan'ny Tsiambaratelo"
              : "Politique de Confidentialite"}
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

            {/* Introduction */}
            <section>
              <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
                <div className="flex gap-3">
                  <svg className="w-6 h-6 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    <p className="font-semibold mb-1">
                      {locale === "mg"
                        ? "Ny tsiambaratelon'ny angon-datanao dia zava-dehibe aminay."
                        : "La protection de vos donnees personnelles est notre priorite."}
                    </p>
                    <p>
                      {locale === "mg"
                        ? "Ity politika ity dia manazava ny fomba fanangonana, fitahirizana ary fampiasana ny angon-datanao manokana rehefa mampiasa ny sehatra Bazary ianao."
                        : "Cette politique explique comment nous collectons, stockons et utilisons vos donnees personnelles lorsque vous utilisez la plateforme Bazary."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Table of Contents */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                {locale === "mg" ? "Votoatiny" : "Sommaire"}
              </h2>
              <ol className="space-y-1.5 text-sm">
                {[
                  locale === "mg" ? "Ny tompon'andraikitry ny fanodinana" : "Responsable du traitement",
                  locale === "mg" ? "Angon-daty voaangona" : "Donnees collectees",
                  locale === "mg" ? "Tanjon'ny fanangonana" : "Finalites de la collecte",
                  locale === "mg" ? "Fizarana ny angon-daty" : "Partage des donnees",
                  locale === "mg" ? "Fitahirizana ny angon-daty" : "Conservation des donnees",
                  locale === "mg" ? "Fiarovana ny angon-daty" : "Securite des donnees",
                  locale === "mg" ? "Ny zonao" : "Vos droits",
                  locale === "mg" ? "Cookies" : "Cookies",
                  locale === "mg" ? "Famindrana any ivelany" : "Transferts internationaux",
                  locale === "mg" ? "Fanovana ny politika" : "Modifications de la politique",
                ].map((title, idx) => (
                  <li key={idx}>
                    <a
                      href={`#privacy-${idx + 1}`}
                      className="text-gray-600 hover:text-primary transition-colors"
                    >
                      {idx + 1}. {title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>

            {/* Article 1 - Responsable du traitement */}
            <section id="privacy-1">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-accent/10 rounded-lg flex items-center justify-center text-accent text-sm font-bold">1</span>
                {locale === "mg" ? "Ny tompon'andraikitry ny fanodinana" : "Responsable du traitement"}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  {locale === "mg"
                    ? "Ny angon-datanao manokana dia voaangona sy voakarakara amin'ny:"
                    : "Vos donnees personnelles sont collectees et traitees par :"}
                </p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="font-semibold text-gray-800">Bazary</p>
                  <p>Antananarivo, Madagascar</p>
                  <p>Email : contact@bazary.mg</p>
                  <p>
                    {locale === "mg" ? "Telefaonina" : "Telephone"} : +261 34 00 000 00
                  </p>
                </div>
              </div>
            </section>

            {/* Article 2 - Donnees collectees */}
            <section id="privacy-2">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-accent/10 rounded-lg flex items-center justify-center text-accent text-sm font-bold">2</span>
                {locale === "mg" ? "Angon-daty voaangona" : "Donnees collectees"}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-4">
                <p>
                  {locale === "mg"
                    ? "Manangona ireto karazana angon-daty ireto izahay:"
                    : "Nous collectons les categories de donnees suivantes :"}
                </p>

                {/* Data categories */}
                {[
                  {
                    titleFr: "Donnees d'identification",
                    titleMg: "Angon-daty famantarana",
                    itemsFr: ["Nom complet", "Adresse email", "Numero de telephone", "Photo de profil (optionnel)"],
                    itemsMg: ["Anarana feno", "Adiresy mailaka", "Nomeraon'ny telefaonina", "Sarin'ny profil (tsy voatery)"],
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ),
                  },
                  {
                    titleFr: "Donnees de localisation",
                    titleMg: "Angon-daty momba ny toerana",
                    itemsFr: ["Ville", "Quartier/District", "Localisation approximative (si autorisee)"],
                    itemsMg: ["Tanana", "Fokontany", "Toerana akaiky (raha nahazoana alalana)"],
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ),
                  },
                  {
                    titleFr: "Donnees d'annonces",
                    titleMg: "Angon-daty momba ny filazana",
                    itemsFr: ["Titres et descriptions", "Photos des articles", "Prix", "Categorie et statut"],
                    itemsMg: ["Lohateny sy fanazavana", "Sarin'ny entana", "Vidiny", "Sokajy sy sata"],
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    ),
                  },
                  {
                    titleFr: "Donnees de communication",
                    titleMg: "Angon-daty momba ny fifandraisana",
                    itemsFr: ["Messages echanges via la messagerie", "Historique des conversations"],
                    itemsMg: ["Hafatra nifanakalozana tamin'ny alalan'ny messagerie", "Tantaran'ny resadresaka"],
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    ),
                  },
                  {
                    titleFr: "Donnees techniques",
                    titleMg: "Angon-daty ara-teknika",
                    itemsFr: ["Adresse IP", "Type de navigateur et appareil", "Pages visitees et duree de visite", "Cookies et identifiants de session"],
                    itemsMg: ["Adiresy IP", "Karazana navigateur sy fitaovana", "Pejy notsidihana sy faharetan'ny fitsidihana", "Cookies sy ID session"],
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    ),
                  },
                ].map((category, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-accent">
                      {category.icon}
                      <h3 className="font-semibold text-gray-800">
                        {locale === "mg" ? category.titleMg : category.titleFr}
                      </h3>
                    </div>
                    <ul className="space-y-1 ml-7">
                      {(locale === "mg" ? category.itemsMg : category.itemsFr).map((item, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-gray-300">-</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Article 3 - Finalites */}
            <section id="privacy-3">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-accent/10 rounded-lg flex items-center justify-center text-accent text-sm font-bold">3</span>
                {locale === "mg" ? "Tanjon'ny fanangonana" : "Finalites de la collecte"}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  {locale === "mg"
                    ? "Ny angon-datanao dia ampiasaina ho an'ireto tanjona ireto:"
                    : "Vos donnees sont utilisees pour les finalites suivantes :"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(locale === "mg"
                    ? [
                        { title: "Fitantanana ny kaonty", desc: "Famoronana sy fitantanana ny kaontinao" },
                        { title: "Fandrosoana filazana", desc: "Hahafahanao mamorona sy mitantana filazana" },
                        { title: "Fifandraisana", desc: "Hahafahanao mifandray amin'ny mpampiasa hafa" },
                        { title: "Fanatsarana ny serivisy", desc: "Fanatsarana ny traikefa sy ny serivisy" },
                        { title: "Fiarovana", desc: "Fiadiana amin'ny hosoka sy fiarovana ny mpampiasa" },
                        { title: "Fifandraisana aminao", desc: "Fandefasana fampahafantarana sy vaovao" },
                      ]
                    : [
                        { title: "Gestion du compte", desc: "Creation et administration de votre compte" },
                        { title: "Publication d'annonces", desc: "Vous permettre de creer et gerer vos annonces" },
                        { title: "Messagerie", desc: "Faciliter la communication entre utilisateurs" },
                        { title: "Amelioration du service", desc: "Ameliorer l'experience et les services proposes" },
                        { title: "Securite", desc: "Lutter contre la fraude et proteger les utilisateurs" },
                        { title: "Communication", desc: "Envoyer des notifications et informations utiles" },
                      ]
                  ).map((item, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="font-medium text-gray-800 text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Article 4 - Partage */}
            <section id="privacy-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-accent/10 rounded-lg flex items-center justify-center text-accent text-sm font-bold">4</span>
                {locale === "mg" ? "Fizarana ny angon-daty" : "Partage des donnees"}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  {locale === "mg"
                    ? "Tsy mivarotra na mifampizara ny angon-datanao manokana amin'ny olon-kafa izahay, afa-tsy amin'ireto tranga ireto:"
                    : "Nous ne vendons ni ne partageons vos donnees personnelles avec des tiers, sauf dans les cas suivants :"}
                </p>
                <ul className="space-y-2 ml-4">
                  {(locale === "mg"
                    ? [
                        "Mpampiasa hafa: Ny anaranao, ny tanananao ary ny filazanao dia hita amin'ny mpampiasa hafa ao amin'ny sehatra",
                        "Mpiara-miasa ara-teknika: Mpiara-miasa natao hampandeha ny sehatra (hosting, email, sns.) izay voafehin'ny fifanarahana tsiambaratelo",
                        "Fangatahan'ny lalana: Raha takian'ny lalana na ny fahefana malagasy",
                        "Fiarovana ny zonay: Mba hiarovana ny zon'ny Bazary sy ny mpampiasa",
                      ]
                    : [
                        "Autres utilisateurs : Votre nom, ville et annonces sont visibles par les autres utilisateurs de la plateforme",
                        "Prestataires techniques : Partenaires necessaires au fonctionnement de la plateforme (hebergement, email, etc.) lies par des accords de confidentialite",
                        "Obligations legales : En cas de demande des autorites malgaches conformement a la loi",
                        "Protection de nos droits : Pour proteger les droits de Bazary et de ses utilisateurs",
                      ]
                  ).map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <svg className="w-4 h-4 text-accent shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Article 5 - Conservation */}
            <section id="privacy-5">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-accent/10 rounded-lg flex items-center justify-center text-accent text-sm font-bold">5</span>
                {locale === "mg" ? "Fitahirizana ny angon-daty" : "Conservation des donnees"}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  {locale === "mg"
                    ? "Ny angon-datanao dia tehirizina mandritra ny fotoana ilaina ho an'ny tanjona nangonana azy:"
                    : "Vos donnees sont conservees pendant la duree necessaire aux finalites de leur collecte :"}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-3 font-semibold text-gray-700 border border-gray-200 rounded-tl-lg">
                          {locale === "mg" ? "Karazana angon-daty" : "Type de donnees"}
                        </th>
                        <th className="text-left p-3 font-semibold text-gray-700 border border-gray-200 rounded-tr-lg">
                          {locale === "mg" ? "Faharetan'ny fitahirizana" : "Duree de conservation"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(locale === "mg"
                        ? [
                            ["Angon-daty kaonty", "Mandra-panafoanan'ny mpampiasa ny kaontiny"],
                            ["Filazana", "6 volana aorian'ny daty farany"],
                            ["Hafatra", "12 volana aorian'ny fifandraisana farany"],
                            ["Angon-daty teknika", "12 volana"],
                            ["Angon-daty fitadiavana", "6 volana"],
                          ]
                        : [
                            ["Donnees de compte", "Jusqu'a la suppression du compte par l'utilisateur"],
                            ["Annonces", "6 mois apres expiration"],
                            ["Messages", "12 mois apres la derniere interaction"],
                            ["Donnees techniques", "12 mois"],
                            ["Donnees de recherche", "6 mois"],
                          ]
                      ).map(([type, duration], idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="p-3 border border-gray-200 text-gray-700">{type}</td>
                          <td className="p-3 border border-gray-200 text-gray-600">{duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Article 6 - Securite */}
            <section id="privacy-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-accent/10 rounded-lg flex items-center justify-center text-accent text-sm font-bold">6</span>
                {locale === "mg" ? "Fiarovana ny angon-daty" : "Securite des donnees"}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  {locale === "mg"
                    ? "Manao fepetra teknika sy ara-drafitra izahay mba hiarovana ny angon-datanao amin'ny fidirana, fampiasana na fanapotehana tsy nahazoana alalana:"
                    : "Nous mettons en place des mesures techniques et organisationnelles pour proteger vos donnees contre tout acces, utilisation ou destruction non autorise :"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(locale === "mg"
                    ? [
                        { icon: "🔒", title: "Encryption SSL/TLS", desc: "Ny fifandraisana rehetra dia voaaro amin'ny encryption" },
                        { icon: "🔑", title: "Tenimiafina voaaro", desc: "Ny tenimiafina dia voatahiry amin'ny hash" },
                        { icon: "🛡️", title: "Firewall", desc: "Fiarovana amin'ny fanafihana ara-informatika" },
                        { icon: "📋", title: "Fanaraha-maso", desc: "Fanaraha-maso tsy tapaka ny fiarovana" },
                      ]
                    : [
                        { icon: "🔒", title: "Chiffrement SSL/TLS", desc: "Toutes les communications sont chiffrees" },
                        { icon: "🔑", title: "Mots de passe securises", desc: "Les mots de passe sont stockes de maniere hashee" },
                        { icon: "🛡️", title: "Pare-feu", desc: "Protection contre les attaques informatiques" },
                        { icon: "📋", title: "Surveillance", desc: "Monitoring continu de la securite" },
                      ]
                  ).map((item, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Article 7 - Droits */}
            <section id="privacy-7">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-accent/10 rounded-lg flex items-center justify-center text-accent text-sm font-bold">7</span>
                {locale === "mg" ? "Ny zonao" : "Vos droits"}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  {locale === "mg"
                    ? "Araka ny lalana velona eto Madagasikara, manana zo ianao:"
                    : "Conformement a la legislation en vigueur a Madagascar, vous disposez des droits suivants :"}
                </p>
                <div className="space-y-2">
                  {(locale === "mg"
                    ? [
                        { title: "Zo hahazo", desc: "Hahazo ny angon-datanao manokana voaangona" },
                        { title: "Zo hanova", desc: "Hanitsiana ny angon-datanao tsy marina na tsy feno" },
                        { title: "Zo hamafa", desc: "Hangataka ny fafana ny angon-datanao" },
                        { title: "Zo hanohitra", desc: "Hanohitra ny fanodinana ny angon-datanao noho ny antony ara-dalana" },
                        { title: "Zo handray", desc: "Handray ny angon-datanao amin'ny endrika azo ampiasaina" },
                      ]
                    : [
                        { title: "Droit d'acces", desc: "Obtenir une copie de vos donnees personnelles collectees" },
                        { title: "Droit de rectification", desc: "Corriger vos donnees inexactes ou incompletes" },
                        { title: "Droit de suppression", desc: "Demander l'effacement de vos donnees" },
                        { title: "Droit d'opposition", desc: "Vous opposer au traitement de vos donnees pour motifs legitimes" },
                        { title: "Droit de portabilite", desc: "Recevoir vos donnees dans un format exploitable" },
                      ]
                  ).map((right, idx) => (
                    <div key={idx} className="flex gap-3 p-3 border border-gray-100 rounded-lg">
                      <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{right.title}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{right.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-accent/5 rounded-xl p-4 border border-accent/10 mt-4">
                  <p className="text-sm">
                    {locale === "mg"
                      ? "Mba hampiharana ireo zo ireo, mifandraisa aminay amin'ny: "
                      : "Pour exercer ces droits, contactez-nous a : "}
                    <a href="mailto:contact@bazary.mg" className="text-primary font-medium hover:underline">
                      contact@bazary.mg
                    </a>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {locale === "mg"
                      ? "Hamaly anao ao anatin'ny 30 andro izahay."
                      : "Nous vous repondrons dans un delai de 30 jours."}
                  </p>
                </div>
              </div>
            </section>

            {/* Article 8 - Cookies */}
            <section id="privacy-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-accent/10 rounded-lg flex items-center justify-center text-accent text-sm font-bold">8</span>
                Cookies
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  {locale === "mg"
                    ? "Ny Bazary dia mampiasa cookies mba hanatsarana ny traikefanao. Ny cookies dia rakitra kely tehirizina ao amin'ny navigateur-nao."
                    : "Bazary utilise des cookies pour ameliorer votre experience. Les cookies sont de petits fichiers stockes dans votre navigateur."}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-3 font-semibold text-gray-700 border border-gray-200">
                          {locale === "mg" ? "Karazana" : "Type"}
                        </th>
                        <th className="text-left p-3 font-semibold text-gray-700 border border-gray-200">
                          {locale === "mg" ? "Tanjona" : "Finalite"}
                        </th>
                        <th className="text-left p-3 font-semibold text-gray-700 border border-gray-200">
                          {locale === "mg" ? "Faharetany" : "Duree"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(locale === "mg"
                        ? [
                            ["Ilaina", "Fampandehana ny sehatra (session, fiteny)", "Session"],
                            ["Fanarenana", "Fitahirizana ny safidinao", "12 volana"],
                            ["Antontan'isa", "Fahafantarana ny fampiasana ny sehatra", "12 volana"],
                          ]
                        : [
                            ["Essentiels", "Fonctionnement de la plateforme (session, langue)", "Session"],
                            ["Fonctionnels", "Memorisation de vos preferences", "12 mois"],
                            ["Analytiques", "Comprendre l'utilisation de la plateforme", "12 mois"],
                          ]
                      ).map(([type, purpose, duration], idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="p-3 border border-gray-200 font-medium text-gray-700">{type}</td>
                          <td className="p-3 border border-gray-200">{purpose}</td>
                          <td className="p-3 border border-gray-200">{duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>
                  {locale === "mg"
                    ? "Afaka mitantana ny cookies ianao amin'ny alalan'ny fanovana ny parametry ny navigateur-nao."
                    : "Vous pouvez gerer les cookies en modifiant les parametres de votre navigateur."}
                </p>
              </div>
            </section>

            {/* Article 9 - Transferts */}
            <section id="privacy-9">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-accent/10 rounded-lg flex items-center justify-center text-accent text-sm font-bold">9</span>
                {locale === "mg" ? "Famindrana any ivelany" : "Transferts internationaux"}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  {locale === "mg"
                    ? "Ny angon-datanao dia mety hovoatahiry amin'ny server any ivelan'i Madagasikara (indrindra ho an'ny hosting). Amin'izany tranga izany, miantoka izahay fa ny fiarovana ny angon-datanao dia mifanaraka amin'ny fepetra voalaza ato amin'ity politika ity."
                    : "Vos donnees peuvent etre stockees sur des serveurs situes en dehors de Madagascar (notamment pour l'hebergement). Dans ce cas, nous veillons a ce que la protection de vos donnees soit conforme aux conditions decrites dans la presente politique."}
                </p>
              </div>
            </section>

            {/* Article 10 - Modifications */}
            <section id="privacy-10">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-accent/10 rounded-lg flex items-center justify-center text-accent text-sm font-bold">10</span>
                {locale === "mg" ? "Fanovana ny politika" : "Modifications de la politique"}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  {locale === "mg"
                    ? "Mety hanova ity politika ity izahay amin'ny fotoana rehetra. Ny fiovana rehetra dia ampahafantarina amin'ny alalan'ny fampahafantarana ao amin'ny sehatra. Ny fitohizan'ny fampiasana ny Sehatra aorian'ny fanovana dia midika fanekena ny politika vaovao."
                    : "Nous pouvons modifier cette politique a tout moment. Toute modification sera communiquee via une notification sur la plateforme. La poursuite de l'utilisation de la Plateforme apres modification vaut acceptation de la nouvelle politique."}
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {locale === "mg" ? "DPO - Mpiambina ny angon-daty" : "DPO - Delegue a la protection des donnees"}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  {locale === "mg"
                    ? "Raha manana fanontaniana momba ny angon-datanao ianao:"
                    : "Pour toute question relative a vos donnees personnelles :"}
                </p>
                <p className="font-medium">Email : dpo@bazary.mg</p>
                <p className="font-medium">
                  {locale === "mg" ? "Na" : "Ou"} : contact@bazary.mg
                </p>
                <p>Antananarivo, Madagascar</p>
              </div>
            </section>

          </div>
        </div>

        {/* Back to terms link */}
        <div className="mt-6 text-center">
          <Link
            href={`/${locale}/terms`}
            className="text-sm text-primary hover:underline"
          >
            {locale === "mg"
              ? "Jereo koa ny Fepetra Fampiasana"
              : "Voir egalement les Conditions Generales d'Utilisation"}
          </Link>
        </div>
      </div>
    </div>
  );
}
