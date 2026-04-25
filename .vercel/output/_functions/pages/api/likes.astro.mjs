import { d as db, T as TextLike } from '../../chunks/_astro_db_kuGCxRgp.mjs';
import { eq, sql } from '@astrojs/db/dist/runtime/virtual.js';
export { renderers } from '../../renderers.mjs';

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
