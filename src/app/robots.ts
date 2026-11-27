import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    // /result는 사람마다 쿼리(진단 결과)가 달라 색인할 이유가 없다
    rules: [{ userAgent: "*", allow: "/", disallow: ["/result"] }],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
