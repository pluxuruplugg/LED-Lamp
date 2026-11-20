export const siteTitle = "Аварійна LED-лампа FAE-3920 20 Вт — купити за 299 грн";
export const siteDescription = "Аварійна LED-лампа FAE-3920 з акумулятором 5000 мА·год. Потужність 20 Вт, цоколь E27, автономна робота 6–8 годин. Ціна 299 грн.";

export function getSiteUrl(): URL | undefined {
  const value = process.env.SITE_URL?.trim();
  if (!value) return undefined;
  const url = new URL(value);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("SITE_URL must be an absolute http(s) origin without a path, credentials, query or fragment.");
  }
  return new URL(url.origin);
}

export function productStructuredData() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Аварійна LED-лампа FAE-3920",
    model: "FAE-3920",
    description: siteDescription,
    ...(siteUrl ? { image: [new URL("/images/land8.jpg", siteUrl).href], url: siteUrl.href } : {}),
    additionalProperty: [
      ["Потужність", "20 Вт"], ["Акумулятор", "5000 мА·год"], ["Цоколь", "E27"],
      ["Колірна температура", "6500 К"], ["Живлення", "AC 85–265 В"], ["Заявлена автономна робота", "6–8 годин"],
    ].map(([name, value]) => ({ "@type": "PropertyValue", name, value })),
    offers: { "@type": "Offer", price: "299", priceCurrency: "UAH", ...(siteUrl ? { url: siteUrl.href } : {}) },
  };
}
