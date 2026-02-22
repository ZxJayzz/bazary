"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export default function HelpPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "fr";

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
              {locale === "mg" ? "Foibe fanampiana" : "Centre d'aide"}
            </span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === "mg"
              ? "Foibe Fanampiana"
              : "Centre d'Aide"}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {locale === "mg"
              ? "Valiny amin'ny fanontaniana matetika apetraka"
              : "Reponses aux questions frequemment posees"}
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
                  locale === "mg" ? "Kaonty sy fisoratana anarana" : "Compte et inscription",
                  locale === "mg" ? "Mandefa filazana" : "Publier une annonce",
                  locale === "mg" ? "Fiarovana amin'ny varotra" : "Securite des transactions",
                  locale === "mg" ? "Fitarainana" : "Signalement",
                  locale === "mg" ? "Ny angon-datanao manokana" : "Vos donnees personnelles",
                  locale === "mg" ? "Famahana ny fifandirana" : "Resolution des litiges",
                  locale === "mg" ? "Mifandraisa aminay" : "Nous contacter",
                ].map((title, idx) => (
                  <li key={idx}>
                    <a
                      href={`#help-${idx + 1}`}
                      className="text-gray-600 hover:text-primary transition-colors"
                    >
                      {idx + 1}. {title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>

            {/* Section 1 - Compte et inscription */}
            <section id="help-1">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">1</span>
                {locale === "mg" ? "Kaonty sy fisoratana anarana" : "Compte et inscription"}
              </h2>
              <div className="space-y-4">
                {/* Q1 */}
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="flex gap-2 items-start mb-2">
                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {locale === "mg"
                        ? "Ahoana ny fomba hamoronana kaonty?"
                        : "Comment creer un compte ?"}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed ml-7">
                    <p>
                      {locale === "mg"
                        ? "Mba hamoronana kaonty ao amin'ny Bazary, tsindrio ny bokotra \"Hisoratra anarana\" ao amin'ny pejy fandraisana. Fenoy ny adiresy mailaka sy ny tenimiafina. Tsy maintsy 18 taona farafahakeliny ianao vao afaka misoratra anarana. Rehefa vita ny fisoratana anarana, hahazo mailaka fanamafisana ianao mba hanamarina ny kaontinao."
                        : "Pour creer un compte sur Bazary, cliquez sur le bouton \"S'inscrire\" sur la page d'accueil. Renseignez votre adresse email et choisissez un mot de passe. Vous devez avoir au minimum 18 ans pour vous inscrire. Une fois l'inscription terminee, vous recevrez un email de confirmation pour valider votre compte."}
                    </p>
                  </div>
                </div>
                {/* Q2 */}
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="flex gap-2 items-start mb-2">
                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {locale === "mg"
                        ? "Ahoana ny fanovana ny profil?"
                        : "Comment modifier mon profil ?"}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed ml-7">
                    <p>
                      {locale === "mg"
                        ? "Mandehana ao amin'ny \"Profil\" ary tsindrio \"Hanova ny profil\". Afaka manova ny anaranao, ny sarinao, ny nomeraon'ny telefaoninao ary ny tanananao ianao. Tsarovy ny mitahiry ny fanovana alohan'ny hivoahanao."
                        : "Rendez-vous dans la section \"Profil\" et cliquez sur \"Modifier le profil\". Vous pouvez modifier votre nom, votre photo, votre numero de telephone et votre ville. N'oubliez pas de sauvegarder vos modifications avant de quitter la page."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 - Publier une annonce */}
            <section id="help-2">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">2</span>
                {locale === "mg" ? "Mandefa filazana" : "Publier une annonce"}
              </h2>
              <div className="space-y-4">
                {/* Q1 */}
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="flex gap-2 items-start mb-2">
                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {locale === "mg"
                        ? "Ahoana ny fomba handefa filazana?"
                        : "Comment publier une annonce ?"}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed ml-7">
                    <p>
                      {locale === "mg"
                        ? "Tsindrio ny bokotra \"Hivarotra\" ao amin'ny pejy fandraisana. Fenoy ny antsipiriany momba ny entana: lohateny, fanazavana, sokajy ary toerana. Ampio sary (5 sary farafahabetsany) mba hampisehoana tsara ny entana. Fenoina ny vidiny amin'ny Ariary Malagasy (MGA). Rehefa vonona ianao, tsindrio \"Handefa\" mba hamoahana ny filazanao."
                        : "Cliquez sur le bouton \"Vendre\" sur la page d'accueil. Remplissez les details de votre article : titre, description, categorie et localisation. Ajoutez des photos (5 photos maximum) pour bien presenter votre article. Indiquez le prix en Ariary Malgache (MGA). Quand vous etes pret, cliquez sur \"Publier\" pour mettre en ligne votre annonce."}
                    </p>
                  </div>
                </div>
                {/* Q2 */}
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="flex gap-2 items-start mb-2">
                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {locale === "mg"
                        ? "Inona ny votoatiny voarara?"
                        : "Quels contenus sont interdits ?"}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed ml-7">
                    <p className="mb-2">
                      {locale === "mg"
                        ? "Araka ny Lalana 2014-006, ireto entana sy votoatiny ireto dia tsy azo arotsaka amin'ny sehatra:"
                        : "Conformement a la Loi 2014-006, les biens et contenus suivants sont strictement interdits sur la plateforme :"}
                    </p>
                    <ul className="space-y-1.5">
                      {(locale === "mg"
                        ? [
                            "Zava-mahadomelina sy rongony",
                            "Fitaovam-piadiana sy bala",
                            "Entana halatra na azo tamin'ny fomba tsy ara-dalana",
                            "Entana sandoka na kopia tsy nahazoana alalana",
                            "Biby voaaro na vokatra avy amin'ireo",
                          ]
                        : [
                            "Drogues et stupefiants",
                            "Armes et munitions",
                            "Biens voles ou obtenus illegalement",
                            "Contrefacons et copies non autorisees",
                            "Animaux proteges ou produits derives",
                          ]
                      ).map((item, idx) => (
                        <li key={idx} className="flex gap-2">
                          <svg className="w-4 h-4 text-secondary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 - Securite des transactions */}
            <section id="help-3">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">3</span>
                {locale === "mg" ? "Fiarovana amin'ny varotra" : "Securite des transactions"}
              </h2>
              <div className="space-y-4">
                {/* Q1 */}
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="flex gap-2 items-start mb-2">
                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {locale === "mg"
                        ? "Ahoana ny fomba hividianana am-pilaminana?"
                        : "Comment acheter en toute securite ?"}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed ml-7">
                    <p className="mb-2">
                      {locale === "mg"
                        ? "Ireto misy torohevitra mba hividianana am-pilaminana ao amin'ny Bazary:"
                        : "Voici nos conseils pour acheter en toute securite sur Bazary :"}
                    </p>
                    <ul className="space-y-1.5">
                      {(locale === "mg"
                        ? [
                            "Mifanehatra amin'ny toerana iombonana sy azo antoka (tsena, trano fivarotana, sns.)",
                            "Jereo tsara ny entana alohan'ny handoavana vola",
                            "Aza mandefa vola mialoha amin'ny olona tsy fantatrao",
                            "Ampiasao ny messagerie ao amin'ny Bazary mba hifandraisana amin'ny mpivarotra",
                          ]
                        : [
                            "Rencontrez le vendeur dans un lieu public et securise (marche, centre commercial, etc.)",
                            "Verifiez bien l'article avant de payer",
                            "Ne versez jamais d'argent a l'avance a une personne inconnue",
                            "Utilisez la messagerie de Bazary pour communiquer avec le vendeur",
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
                </div>
                {/* Q2 */}
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="flex gap-2 items-start mb-2">
                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {locale === "mg"
                        ? "Inona no atao raha voafitaka?"
                        : "Que faire en cas d'arnaque ?"}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed ml-7">
                    <p className="mb-2">
                      {locale === "mg"
                        ? "Raha mihevitra ianao fa voafitaka, ireto ny dingana tokony arahina:"
                        : "Si vous pensez avoir ete victime d'une arnaque, voici les etapes a suivre :"}
                    </p>
                    <ul className="space-y-1.5">
                      {(locale === "mg"
                        ? [
                            "Tatao ny mpampiasa ao amin'ny sehatra amin'ny alalan'ny bokotra \"Hitataina\"",
                            "Mifandraisa amin'ny ekipan'ny Bazary amin'ny contact@bazary.mg",
                            "Raha ilaina, mametraha fitarainana amin'ny manampahefana (polisy na zandarmaria)",
                          ]
                        : [
                            "Signalez l'utilisateur sur la plateforme via le bouton \"Signaler\"",
                            "Contactez l'equipe Bazary a contact@bazary.mg",
                            "Si necessaire, deposez une plainte aupres des autorites competentes (police ou gendarmerie)",
                          ]
                      ).map((item, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-primary font-bold">{idx + 1}.</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 - Signalement */}
            <section id="help-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">4</span>
                {locale === "mg" ? "Fitarainana" : "Signalement"}
              </h2>
              <div className="space-y-4">
                {/* Q1 */}
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="flex gap-2 items-start mb-2">
                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {locale === "mg"
                        ? "Ahoana ny fomba hitatainana votoatiny tsy ara-dalana?"
                        : "Comment signaler un contenu illicite ?"}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed ml-7">
                    <p>
                      {locale === "mg"
                        ? "Tsindrio ny bokotra \"Hitataina\" eo amin'ny filazana na ny profil'ny mpampiasa voakasika. Lazao mazava ny antony hitatainanao (votoatiny tsy ara-dalana, hosoka, fanafintohinana, sns.). Araka ny Lalana 2014-006, ny Bazary dia miara-miasa amin'ny manampahefana ho an'ny votoatiny tsy ara-dalana ary handray fepetra haingana rehefa voamarina ny fitarainana."
                        : "Cliquez sur le bouton \"Signaler\" present sur l'annonce ou le profil de l'utilisateur concerne. Decrivez clairement la raison de votre signalement (contenu illicite, fraude, harcelement, etc.). Conformement a la Loi 2014-006, Bazary coopere avec les autorites pour tout contenu illicite et prendra des mesures rapides une fois le signalement verifie."}
                    </p>
                  </div>
                </div>
                {/* Q2 */}
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="flex gap-2 items-start mb-2">
                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {locale === "mg"
                        ? "Inona no mitranga aorian'ny fitarainana?"
                        : "Que se passe-t-il apres un signalement ?"}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed ml-7">
                    <p>
                      {locale === "mg"
                        ? "Rehefa mandray fitarainana ny ekipan'ny Bazary, mandinika ny tranga ao anatin'ny 48 ora izahay. Raha voamarina ny fandikan-dalana, mety hanaisotra ny votoatiny izahay ary manakatona vonjimaika na mandimby ny kaontin'ny mpampiasa. Raha ilaina, ny tranga dia azo ampitaina amin'ny manampahefana."
                        : "Lorsque l'equipe Bazary recoit un signalement, nous examinons le cas dans un delai de 48 heures. Si l'infraction est confirmee, nous pouvons retirer le contenu et suspendre temporairement ou definitivement le compte de l'utilisateur concerne. Si necessaire, le cas peut etre transmis aux autorites competentes."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 - Vos donnees personnelles */}
            <section id="help-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">5</span>
                {locale === "mg" ? "Ny angon-datanao manokana" : "Vos donnees personnelles"}
              </h2>
              <div className="space-y-4">
                {/* Q1 */}
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="flex gap-2 items-start mb-2">
                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {locale === "mg"
                        ? "Inona ny angon-daty angoninareo?"
                        : "Quelles donnees collectez-vous ?"}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed ml-7">
                    <p className="mb-2">
                      {locale === "mg"
                        ? "Araka ny Lalana 2014-038 momba ny fiarovana ny angon-daty manokana, ny Bazary dia manangona ireto angon-daty ireto:"
                        : "Conformement a la Loi 2014-038 relative a la protection des donnees personnelles, Bazary collecte les donnees suivantes :"}
                    </p>
                    <ul className="space-y-1.5">
                      {(locale === "mg"
                        ? [
                            "Anarana feno",
                            "Adiresy mailaka",
                            "Nomeraon'ny telefaonina",
                            "Toerana (tanana)",
                            "Filazana narotsaka",
                            "Hafatra nifanakalozana",
                          ]
                        : [
                            "Nom complet",
                            "Adresse email",
                            "Numero de telephone",
                            "Localisation (ville)",
                            "Annonces publiees",
                            "Messages echanges",
                          ]
                      ).map((item, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-gray-300">-</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {/* Q2 */}
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="flex gap-2 items-start mb-2">
                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {locale === "mg"
                        ? "Ahoana ny fampiharana ny zoko?"
                        : "Comment exercer mes droits ?"}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed ml-7">
                    <p>
                      {locale === "mg"
                        ? "Manana zo hahazo, hanova ary hamafa ny angon-datanao manokana ianao. Mba hampiharana ireo zo ireo, mifandraisa amin'ny DPO (Mpiambina ny angon-daty) amin'ny "
                        : "Vous disposez d'un droit d'acces, de rectification et de suppression de vos donnees personnelles. Pour exercer ces droits, contactez notre DPO (Delegue a la Protection des Donnees) a "}
                      <a href="mailto:dpo@bazary.mg" className="text-primary font-medium hover:underline">
                        dpo@bazary.mg
                      </a>
                      {locale === "mg"
                        ? ". Hamaly anao ao anatin'ny 30 andro izahay. Manana zo hitaraina amin'ny CMIL koa ianao raha tsy afa-po amin'ny valin-teny."
                        : ". Nous vous repondrons dans un delai de 30 jours. Vous avez egalement le droit de deposer une reclamation aupres de l'CMIL si vous n'etes pas satisfait de notre reponse."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6 - Resolution des litiges */}
            <section id="help-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">6</span>
                {locale === "mg" ? "Famahana ny fifandirana" : "Resolution des litiges"}
              </h2>
              <div className="space-y-4">
                {/* Q1 */}
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="flex gap-2 items-start mb-2">
                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {locale === "mg"
                        ? "Ahoana ny famahana fifandirana amin'ny mpampiasa hafa?"
                        : "Comment resoudre un conflit avec un autre utilisateur ?"}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed ml-7">
                    <p className="mb-2">
                      {locale === "mg"
                        ? "Raha misy fifandirana amin'ny mpampiasa hafa, ireto ny dingana tokony arahina:"
                        : "En cas de conflit avec un autre utilisateur, voici les etapes a suivre :"}
                    </p>
                    <ul className="space-y-1.5">
                      {(locale === "mg"
                        ? [
                            "Andramo aloha ny mifampiresaka mivantana amin'ny mpampiasa iray mba hahitana vahaolana",
                            "Raha tsy mahomby izany, mifandraisa amin'ny ekipan'ny Bazary amin'ny contact@bazary.mg",
                            "Araka ny lalana Malagasy, ny famahana am-pilaminana no atao voalohany",
                            "Raha tsy misy fifanarahana, ny Fitsarana kompetanta ao Antananarivo no hanapaka",
                          ]
                        : [
                            "Essayez d'abord de communiquer directement avec l'autre utilisateur pour trouver une solution",
                            "Si cela echoue, contactez l'equipe de support Bazary a contact@bazary.mg",
                            "Conformement au droit malgache, la resolution amiable est privilegiee en premier lieu",
                            "En l'absence d'accord, les tribunaux competents d'Antananarivo seront seuls competents",
                          ]
                      ).map((item, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-primary font-bold">{idx + 1}.</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7 - Nous contacter */}
            <section id="help-7">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">7</span>
                {locale === "mg" ? "Mifandraisa aminay" : "Nous contacter"}
              </h2>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <p className="text-sm text-gray-600 mb-4">
                  {locale === "mg"
                    ? "Raha manana fanontaniana na mila fanampiana ianao, aza misalasala mifandray aminay:"
                    : "Si vous avez des questions ou besoin d'aide, n'hesitez pas a nous contacter :"}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-500">{locale === "mg" ? "Mailaka ankapobeny" : "Email general"}</p>
                      <a href="mailto:contact@bazary.mg" className="font-medium text-gray-800 hover:text-primary transition-colors">
                        contact@bazary.mg
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-500">{locale === "mg" ? "Mpiambina ny angon-daty (DPO)" : "Delegue a la Protection des Donnees (DPO)"}</p>
                      <a href="mailto:dpo@bazary.mg" className="font-medium text-gray-800 hover:text-primary transition-colors">
                        dpo@bazary.mg
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-500">{locale === "mg" ? "Telefaonina" : "Telephone"}</p>
                      <p className="font-medium text-gray-800">+261 34 00 000 00</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-500">{locale === "mg" ? "Adiresy" : "Adresse"}</p>
                      <p className="font-medium text-gray-800">Antananarivo, Madagascar</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Links to Terms and Privacy */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <Link
            href={`/${locale}/terms`}
            className="text-sm text-primary hover:underline"
          >
            {locale === "mg"
              ? "Jereo koa ny Fepetra Fampiasana"
              : "Voir egalement les Conditions Generales d'Utilisation"}
          </Link>
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
