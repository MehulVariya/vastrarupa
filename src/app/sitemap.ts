import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://vastrarupa.vercel.app";

  const staticPages = [
    { url: `${baseUrl}`, lastModified: new Date() },
    { url: `${baseUrl}/shop`, lastModified: new Date() },
  ];

  const commonProductSlugs = [
    "ivory-chikankari-embroidered-kurti",
    "crimson-anarkali-georgette-kurti",
    "emerald-silk-brocade-kurta-set",
  ];

  const productPages = commonProductSlugs.map((slug) => ({
    url: `${baseUrl}/product/${slug}`,
    lastModified: new Date(),
  }));

  return [...staticPages, ...productPages];
}
