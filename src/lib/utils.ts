export function formatPrice(price: number): string {
  if (price === 0) return "Gratuit";
  return new Intl.NumberFormat("fr-FR").format(price) + " Ar";
}

export function timeAgo(date: Date, locale: string = "fr"): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (locale === "mg") {
    if (minutes < 1) return "vao haingana";
    if (minutes < 60) return `${minutes} minitra lasa`;
    if (hours < 24) return `${hours} ora lasa`;
    if (days < 7) return `${days} andro lasa`;
    if (weeks < 4) return `${weeks} herinandro lasa`;
    return `${months} volana lasa`;
  }

  // French (default)
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  if (hours < 24) return `il y a ${hours} h`;
  if (days < 7) return `il y a ${days} j`;
  if (weeks < 4) return `il y a ${weeks} sem`;
  return `il y a ${months} mois`;
}

export function getImageUrls(imagesJson: string): string[] {
  try {
    return JSON.parse(imagesJson);
  } catch {
    return [];
  }
}

export function getCategoryLabel(
  categoryName: string,
  locale: string,
  categories: { name: string; nameFr: string; nameMg: string }[]
): string {
  const cat = categories.find((c) => c.name === categoryName);
  if (!cat) return categoryName;
  return locale === "mg" ? cat.nameMg : cat.nameFr;
}
