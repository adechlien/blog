const PAYLOAD_URL = import.meta.env.PAYLOAD_URL ?? "http://localhost:3000";

export function getMediaUrl(media: any) {
  if (!media?.url) return "";

  const url = String(media.url);

  // Si ya es una URL externa válida de Blob u otro storage, déjala igual.
  if (
    url.startsWith("http") &&
    !url.startsWith("http://localhost:3000") &&
    !url.startsWith("https://localhost:3000")
  ) {
    return url;
  }

  // Si Payload guardó localhost en la DB, reemplázalo por PAYLOAD_URL.
  if (
    url.startsWith("http://localhost:3000") ||
    url.startsWith("https://localhost:3000")
  ) {
    const parsedUrl = new URL(url);
    return `${PAYLOAD_URL}${parsedUrl.pathname}`;
  }

  // Si viene como /api/media/file/archivo.webp
  return `${PAYLOAD_URL}${url}`;
}

export function normalizePayloadText(text: any) {
  return {
    id: text.numericId,
    numericId: text.numericId,
    title: text.title,
    legacySlug: text.legacySlug,
    excerpt: text.excerpt,
    content: text.content,
    pubDate: text.pubDate,
    featured: text.featured,
    status: text.status,

    collection: {
      id: text.collection?.id,
      name: text.collection?.name,
      slug: text.collection?.slug,
      color: text.collection?.color,
      description: text.collection?.description,
      icon: getMediaUrl(text.collection?.icon),
    },

    cover: {
      url: getMediaUrl(text.cover),
      alt: text.cover?.alt ?? text.title,
      width: text.cover?.width,
      height: text.cover?.height,
    },
  };
}

export async function getPayloadTexts() {
  const url = new URL("/api/texts", PAYLOAD_URL);

  url.searchParams.set("where[status][equals]", "published");
  url.searchParams.set("sort", "-pubDate");
  url.searchParams.set("depth", "2");
  url.searchParams.set("limit", "100");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Error fetching texts from Payload: ${response.status}`);
  }

  const data = await response.json();

  return {
    ...data,
    docs: data.docs.map(normalizePayloadText),
  };
}

export async function getPayloadTextByNumericId(numericId: string) {
  const url = new URL("/api/texts", PAYLOAD_URL);

  url.searchParams.set("where[numericId][equals]", numericId);
  url.searchParams.set("where[status][equals]", "published");
  url.searchParams.set("depth", "2");
  url.searchParams.set("limit", "1");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Error fetching text from Payload: ${response.status}`);
  }

  const data = await response.json();
  const text = data.docs?.[0];

  return text ? normalizePayloadText(text) : null;
}

export function normalizePayloadFigure(figure: any) {
  return {
    id: figure.id,
    name: figure.name,
    slug: figure.slug,
    kind: figure.kind,
    birthDate: figure.birthDate,
    deathDate: figure.deathDate,
    lifeSpanLabel: figure.lifeSpanLabel,
    isFictional: figure.isFictional,
    fictionalNotice: figure.fictionalNotice,
    biography: figure.biography,
    backgroundColor: figure.backgroundColor ?? '#080809',
    order: figure.order,
    featured: figure.featured,
    status: figure.status,
    contributions: figure.contributions ?? [],

    cover: {
      url: getMediaUrl(figure.cover),
      alt: figure.cover?.alt ?? figure.name,
      width: figure.cover?.width,
      height: figure.cover?.height,
    },
  };
}

export async function getPayloadFigures() {
  const url = new URL('/api/figures', PAYLOAD_URL);

  url.searchParams.set("where[status][equals]", "published");
  url.searchParams.set('sort', 'order');
  url.searchParams.set('depth', '2');
  url.searchParams.set('limit', '100');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Error fetching figures from Payload: ${response.status}`);
  }

  const data = await response.json();

  return {
    ...data,
    docs: data.docs.map(normalizePayloadFigure),
  };
}

export async function getPayloadFigureBySlug(slug: string) {
  const url = new URL('/api/figures', PAYLOAD_URL);

  url.searchParams.set('where[slug][equals]', slug);
  url.searchParams.set('where[status][equals]', 'published');
  url.searchParams.set('depth', '2');
  url.searchParams.set('limit', '1');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Error fetching figure from Payload: ${response.status}`);
  }

  const data = await response.json();
  const figure = data.docs?.[0];

  return figure ? normalizePayloadFigure(figure) : null;
}

export async function getPayloadDraftTexts() {
  const url = new URL("/api/texts", PAYLOAD_URL);

  url.searchParams.set("where[status][equals]", "draft");
  url.searchParams.set("sort", "-updatedAt");
  url.searchParams.set("depth", "2");
  url.searchParams.set("limit", "4");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Error fetching draft texts from Payload: ${response.status}`);
  }

  const data = await response.json();

  return {
    ...data,
    docs: data.docs.map(normalizePayloadText),
  };
}
