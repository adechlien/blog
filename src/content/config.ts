import { defineCollection, z } from "astro:content";

const texts = defineCollection({
  type: "content",
  schema: z.object({
    id: z.string(),
    legacySlug: z.string().optional(),
    title: z.string(),
    type: z.string(),
    heroImage: z.string().optional(),
    pubDate: z.coerce.date(),
    color: z.string().optional(),
    featured: z.boolean().optional(),
  }),
});

const soon = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    type: z.string(),
    heroImage: z.string().optional(),
    pubDate: z.coerce.date(),
    color: z.string().optional(),
    featured: z.boolean().optional(),
  }),
});

const writers = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    photo: z.string(),
    description: z.string(),
    lifeSpan: z.string().optional(),
    color: z.string().optional(),
    phrases: z.array(
      z.object({
        text: z.string(),
        source: z.string(),
      })
    ).optional(),
  }),
});

export const collections = { texts, soon, writers };
