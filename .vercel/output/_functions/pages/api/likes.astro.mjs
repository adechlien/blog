import { asDrizzleTable } from '@astrojs/db/runtime';
import { createClient } from '@astrojs/db/db-client/libsql-node.js';
import { eq, sql } from '@astrojs/db/dist/runtime/virtual.js';
export { renderers } from '../../renderers.mjs';

const db = await createClient({
  url: "libsql://blog-adechlien.aws-us-east-2.turso.io",
  token: process.env.ASTRO_DB_APP_TOKEN ?? "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzcxNTY2ODIsImlkIjoiMDE5ZGM2YzktOTEwMS03MzU1LWI1MzItODcxMjY2YTI5OTNmIiwicmlkIjoiNTg0YzExYmItMWJmNS00ZThjLWJjZmYtZDI4NmI0YTdmNzE3In0.PXI8R9SWMyhFJlfo4dwVmNZUCm6FaRG7J3T5aDY1xTs-faMWNxfDEGffhoCJT_DY2_WA47vIcjMpbsRyqJkbCA"
});
const TextLike = asDrizzleTable("TextLike", { "columns": { "textId": { "type": "text", "schema": { "unique": false, "deprecated": false, "name": "textId", "collection": "TextLike", "primaryKey": true } }, "likes": { "type": "number", "schema": { "unique": false, "deprecated": false, "name": "likes", "collection": "TextLike", "primaryKey": false, "optional": false } } }, "deprecated": false, "indexes": {} }, false);

const prerender = false;
const GET = async ({ url }) => {
  const textId = url.searchParams.get("textId");
  if (!textId) {
    return Response.json(
      { error: "Missing textId" },
      { status: 400 }
    );
  }
  const rows = await db.select().from(TextLike).where(eq(TextLike.textId, textId));
  return Response.json({
    textId,
    likes: rows[0]?.likes ?? 0
  });
};
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const textId = String(body.textId ?? "");
    const action = String(body.action ?? "like");
    if (!textId) {
      return Response.json(
        { error: "Missing textId" },
        { status: 400 }
      );
    }
    const rows = await db.select().from(TextLike).where(eq(TextLike.textId, textId));
    const current = rows[0];
    if (action === "unlike") {
      if (!current) {
        return Response.json({
          textId,
          likes: 0
        });
      }
      const nextLikes = Math.max(0, current.likes - 1);
      await db.update(TextLike).set({ likes: nextLikes }).where(eq(TextLike.textId, textId));
      return Response.json({
        textId,
        likes: nextLikes
      });
    }
    if (!current) {
      await db.insert(TextLike).values({
        textId,
        likes: 1
      });
      return Response.json({
        textId,
        likes: 1
      });
    }
    await db.update(TextLike).set({
      likes: sql`${TextLike.likes} + 1`
    }).where(eq(TextLike.textId, textId));
    return Response.json({
      textId,
      likes: current.likes + 1
    });
  } catch {
    return Response.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
