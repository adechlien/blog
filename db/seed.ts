import { db, TextLike, eq } from "astro:db";

export default async function seed() {
  const existing = await db
    .select()
    .from(TextLike)
    .where(eq(TextLike.textId, "test-text-1"));

  if (existing.length > 0) {
    await db
      .update(TextLike)
      .set({ likes: 3 })
      .where(eq(TextLike.textId, "test-text-1"));

    return;
  }

  await db.insert(TextLike).values({
    textId: "test-text-1",
    likes: 3,
  });
}
