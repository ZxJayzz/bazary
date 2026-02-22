// Banned keywords for product moderation
// Products containing these words in title or description will be blocked
// Categories: drugs, weapons, counterfeit, adult content, illegal services, stolen goods

const BANNED_KEYWORDS = [
  // Drugs / Zava-mahadomelina (FR + MG)
  "drogue", "cocaine", "héroïne", "heroine", "cannabis", "marijuana",
  "ecstasy", "méthamphétamine", "methamphetamine", "crack", "opium",
  "rongony", "toaka gasy", "zava-mahadomelina", "paraky", "jamba",
  "pilule", "amphétamine", "amphetamine",

  // Weapons / Fitaovam-piadiana (FR + MG)
  "arme à feu", "fusil", "pistolet", "munition", "explosif", "grenade",
  "basy", "bala", "fitaovam-piadiana", "bombe", "sabatra",
  "antsy be", "lefona", "tafondro",

  // Counterfeit / Hosoka (FR + MG)
  "faux billet", "fausse monnaie", "contrefaçon", "faux passeport",
  "fausse carte", "faux permis", "faux diplôme",
  "vola sandoka", "pasiporo sandoka", "diplaoma sandoka", "hosoka",
  "karapara sandoka", "taratasy sandoka",

  // Adult / Votoatiny (FR + MG)
  "pornographie", "escort", "prostitution",
  "votoatiny", "filan-dratsy", "mpivaro-tena",

  // Illegal services / Asa tsy ara-dalàna (FR + MG)
  "blanchiment", "piratage", "hacking", "faux documents",
  "trafic", "contrebande",
  "fanasan-karena", "fandrobana", "trafika", "an-tsokosoko",

  // Stolen goods / Entana voaangalatra (FR + MG)
  "volé", "volée", "halatra", "nangalatra", "voaangalatra", "mangalatra",
  "an-keriny", "babo",

  // Endangered species / Biby voaaro (FR + MG)
  "tortue radiée", "lémur", "sokake", "angonoka",
  "biby voaaro", "tany-ala voaaro", "fosa", "sifaka", "indri",
  "aye-aye", "radiated tortoise",
];

/**
 * Check if text contains any banned keywords.
 * Returns the first matched keyword or null.
 */
export function checkBannedKeywords(text: string): string | null {
  const lower = text.toLowerCase();
  for (const keyword of BANNED_KEYWORDS) {
    if (lower.includes(keyword.toLowerCase())) {
      return keyword;
    }
  }
  return null;
}
