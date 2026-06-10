const PAYLOAD_URL = import.meta.env.PAYLOAD_URL ?? "http://localhost:3000";

type PayloadListOptions = {
  status?: "published" | "draft";
  limit?: number;
  sort?: string;
  includeContent?: boolean;
};

type PayloadFigureOptions = {
  limit?: number;
  includeDetails?: boolean;
};

type PayloadVideoOptions = {
  limit?: number;
};

type PayloadSketchOptions = {
  status?: "published" | "draft";
  limit?: number;
};

function setSelectParams(url: URL, fields: string[]) {
  fields.forEach((field) => {
    url.searchParams.set(`select[${field}]`, "true");
  });
}

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

export async function getPayloadTexts(options: PayloadListOptions = {}) {
  const {
    status = "published",
    limit = 100,
    sort = "-pubDate",
    includeContent = true,
  } = options;
  const url = new URL("/api/texts", PAYLOAD_URL);

  url.searchParams.set("where[status][equals]", status);
  url.searchParams.set("sort", sort);
  url.searchParams.set("depth", "2");
  url.searchParams.set("limit", String(limit));

  if (!includeContent) {
    setSelectParams(url, [
      "numericId",
      "title",
      "legacySlug",
      "excerpt",
      "pubDate",
      "featured",
      "status",
      "collection",
      "cover",
    ]);
  }

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

export async function getPayloadFigures(options: PayloadFigureOptions = {}) {
  const { limit = 100, includeDetails = true } = options;
  const url = new URL('/api/figures', PAYLOAD_URL);

  url.searchParams.set("where[status][equals]", "published");
  url.searchParams.set('sort', 'order');
  url.searchParams.set('depth', '2');
  url.searchParams.set('limit', String(limit));

  if (!includeDetails) {
    setSelectParams(url, [
      "name",
      "slug",
      "kind",
      "backgroundColor",
      "order",
      "featured",
      "status",
      "cover",
    ]);
  }

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

export function normalizePayloadVideo(video: any) {
  return {
    id: video.id,
    title: video.title,
    youtubeUrl: video.youtubeUrl,
    description: video.description,
    order: video.order,
    featured: video.featured,
    status: video.status,

    thumbnail: {
      url: getMediaUrl(video.thumbnail),
      alt: video.thumbnail?.alt ?? video.title,
      width: video.thumbnail?.width,
      height: video.thumbnail?.height,
    },
  };
}

export async function getPayloadVideos(options: PayloadVideoOptions = {}) {
  const { limit = 100 } = options;
  const url = new URL('/api/videos', PAYLOAD_URL);

  url.searchParams.set("where[status][equals]", "published");
  url.searchParams.set('sort', 'order');
  url.searchParams.set('depth', '2');
  url.searchParams.set('limit', String(limit));
  setSelectParams(url, [
    "title",
    "youtubeUrl",
    "description",
    "order",
    "featured",
    "status",
    "thumbnail",
  ]);

  const response = await fetch(url.toString());

  if (response.status === 404) {
    return {
      docs: [],
    };
  }

  if (!response.ok) {
    throw new Error(`Error fetching videos from Payload: ${response.status}`);
  }

  const data = await response.json();

  return {
    ...data,
    docs: data.docs.map(normalizePayloadVideo),
  };
}

export function normalizePayloadSketch(sketch: any) {
  return {
    id: sketch.id,
    title: sketch.title,
    image: sketch.image,
    alt: sketch.alt,
    featured: sketch.featured,
    pubDate: sketch.pubDate,
    status: sketch.status,
  };
}

export async function getPayloadSketches(options: PayloadSketchOptions = {}) {
  const { status = "published", limit = 100 } = options;
  const url = new URL('/api/sketches', PAYLOAD_URL);

  url.searchParams.set("where[status][equals]", status);
  url.searchParams.set('sort', '-pubDate');
  url.searchParams.set('depth', '0');
  url.searchParams.set('limit', String(limit));
  setSelectParams(url, [
    "title",
    "image",
    "alt",
    "featured",
    "pubDate",
    "status",
  ]);

  const response = await fetch(url.toString());

  if (response.status === 404) {
    return {
      docs: [],
    };
  }

  if (!response.ok) {
    throw new Error(`Error fetching sketches from Payload: ${response.status}`);
  }

  const data = await response.json();

  return {
    ...data,
    docs: data.docs.map(normalizePayloadSketch),
  };
}

export async function getPayloadDraftTexts() {
  return getPayloadTexts({
    status: "draft",
    sort: "-updatedAt",
    limit: 4,
    includeContent: false,
  });
}
