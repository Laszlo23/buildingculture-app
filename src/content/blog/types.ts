import type { FC } from "react";

export type BlogTag = "rwa" | "ai-trading" | "strategies" | "risk" | "yield" | "club";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  tags: BlogTag[];
  featured: boolean;
  readingTimeMinutes: number;
  Body: FC;
};
