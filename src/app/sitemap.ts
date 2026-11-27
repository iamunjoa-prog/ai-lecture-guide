import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteUrl();
  return [
    { url: `${site}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${site}/diagnosis`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site}/practice`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${site}/glossary`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site}/skills`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
