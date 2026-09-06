import type { APIRoute } from "astro";

export const prerender = false;

const DIRECTUS_URL = import.meta.env.DIRECTUS_URL;
const DIRECTUS_TOKEN = import.meta.env.DIRECTUS_TOKEN;

function directusLikesUrl(textId: string) {
  return new URL(`/likes/${encodeURIComponent(textId)}`, DIRECTUS_URL);
}

async function requestLikes(textId: string, init?: RequestInit) {
  if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
    throw new Error("Missing Directus likes configuration");
  }

  const response = await fetch(directusLikesUrl(textId), {
    ...init,
    headers: {
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Directus likes request failed with ${response.status}`);
  }

  return response.json();
}

export const GET: APIRoute = async ({ url }) => {
  const textId = url.searchParams.get("textId");

  if (!textId) {
    return Response.json(
      { error: "Missing textId" },
      { status: 400 }
    );
  }

  try {
    return Response.json(await requestLikes(textId));
  } catch {
    return Response.json({ error: "Likes service unavailable" }, { status: 503 });
  }
};

export const POST: APIRoute = async ({ request }) => {
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

    return Response.json(
      await requestLikes(textId, {
        method: "POST",
        body: JSON.stringify({ action }),
      }),
    );
  } catch {
    return Response.json(
      { error: "Likes service unavailable" },
      { status: 503 }
    );
  }
};
