import { defineCollection, z } from "astro:content";

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

const sketches = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.string(),
    pubDate: z.date(),
    image: z.string(),
    alt: z.string().optional(),
    note: z.string(),
  }),
});

export const collections = { writers, sketches };
