import { defineDb, defineTable, column } from "astro:db";

const TextLike = defineTable({
  columns: {
    textId: column.text({ primaryKey: true }),
    likes: column.number(),
  },
});

export default defineDb({
  tables: {
    TextLike,
  },
});
