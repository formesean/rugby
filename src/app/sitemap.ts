import type { MetadataRoute } from "next";
import { env } from "@/env/client";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_BASE_URL;
  return [
    { url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    {
      url: `${base}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
