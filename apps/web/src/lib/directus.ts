const DIRECTUS_URL = import.meta.env.DIRECTUS_URL ?? 'http://localhost:8055'
const DIRECTUS_TOKEN = import.meta.env.DIRECTUS_TOKEN

function directusFetch(input: URL | string) {
  return fetch(input, {
    headers: DIRECTUS_TOKEN
      ? { Authorization: `Bearer ${DIRECTUS_TOKEN}` }
      : undefined,
  })
}

type DirectusVideo = {
  id: number
  title: string
  youtube_url: string
}

type DirectusMovie = {
  id: number
  letterboxd_url: string
  cover_url: string
}

type DirectusAlbum = {
  id: number
  apple_music_url: string
  cover_url: string
}

type DirectusRun = {
  id: number
  strava_url: string
  cover: {
    id: string
    filename_download?: string
  } | null
}

type DirectusCollection = {
  id: number
  name: string
  slug: string
  description: string | null
  color: string
  icon: string
  order: number
}

type DirectusFile = {
  id: string
  filename_download?: string
  title?: string
  width?: number
  height?: number
}

type DirectusText = {
  id: number
  numeric_id: string
  title: string
  legacy_slug: string | null
  excerpt: string | null
  content?: string
  pub_date: string
  featured: boolean
  status: 'draft' | 'published'
  collection: DirectusCollection
  cover: DirectusFile | null
}

type DirectusFigure = {
  id: number
  name: string
  slug: string
  kind: string
  life_span: string | null
  biography?: string
  background_color: string
  status: 'draft' | 'published'
  cover: DirectusFile | null
}

type DirectusFigureQuote = {
  id: number
  figure: number
  text: string
  source: string | null
  sort: number
}

type DirectusTextOptions = {
  status?: 'draft' | 'published'
  limit?: number
  includeContent?: boolean
}

function getAssetUrl(file: DirectusFile | null, width = 1200) {
  if (!file?.id) return ''

  return new URL(`/assets/${file.id}?width=${width}&format=webp&quality=85`, DIRECTUS_URL).toString()
}

function normalizeDirectusCollection(collection: DirectusCollection) {
  return {
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    description: collection.description ?? '',
    color: collection.color,
    icon: collection.icon,
    order: collection.order,
  }
}

function normalizeDirectusText(text: DirectusText) {
  return {
    id: text.numeric_id,
    numericId: text.numeric_id,
    title: text.title,
    legacySlug: text.legacy_slug,
    excerpt: text.excerpt ?? '',
    content: text.content ?? '',
    pubDate: text.pub_date,
    featured: text.featured,
    status: text.status,
    collection: normalizeDirectusCollection(text.collection),
    cover: {
      url: getAssetUrl(text.cover),
      alt: text.cover?.title ?? text.cover?.filename_download ?? text.title,
      width: text.cover?.width,
      height: text.cover?.height,
    },
  }
}

export async function getDirectusCollections() {
  const url = new URL('/items/collections', DIRECTUS_URL)
  url.searchParams.set('sort', 'order')
  url.searchParams.set('limit', '-1')
  url.searchParams.set('fields', 'id,name,slug,description,color,icon,order')

  const response = await directusFetch(url)
  if (!response.ok) throw new Error(`Error fetching collections from Directus: ${response.status}`)

  const result = (await response.json()) as { data?: DirectusCollection[] }
  return { docs: (result.data ?? []).map(normalizeDirectusCollection) }
}

export async function getDirectusTexts(options: DirectusTextOptions = {}) {
  const { status = 'published', limit = 100, includeContent = true } = options
  const url = new URL('/items/texts', DIRECTUS_URL)
  url.searchParams.set('filter[status][_eq]', status)
  url.searchParams.set('sort', '-pub_date')
  url.searchParams.set('limit', String(limit))

  const fields = [
    'id', 'numeric_id', 'title', 'legacy_slug', 'excerpt', 'pub_date', 'featured', 'status',
    'collection.id', 'collection.name', 'collection.slug', 'collection.description',
    'collection.color', 'collection.icon', 'collection.order',
    'cover.id', 'cover.filename_download', 'cover.title', 'cover.width', 'cover.height',
  ]
  if (includeContent) fields.push('content')
  url.searchParams.set('fields', fields.join(','))

  const response = await directusFetch(url)
  if (!response.ok) throw new Error(`Error fetching texts from Directus: ${response.status}`)

  const result = (await response.json()) as { data?: DirectusText[] }
  return { docs: (result.data ?? []).map(normalizeDirectusText) }
}

export async function getDirectusTextByNumericId(numericId: string) {
  const url = new URL('/items/texts', DIRECTUS_URL)
  url.searchParams.set('filter[numeric_id][_eq]', numericId)
  url.searchParams.set('filter[status][_eq]', 'published')
  url.searchParams.set('limit', '1')
  url.searchParams.set('fields', 'id,numeric_id,title,legacy_slug,excerpt,content,pub_date,featured,status,collection.id,collection.name,collection.slug,collection.description,collection.color,collection.icon,collection.order,cover.id,cover.filename_download,cover.title,cover.width,cover.height')

  const response = await directusFetch(url)
  if (!response.ok) throw new Error(`Error fetching text from Directus: ${response.status}`)

  const result = (await response.json()) as { data?: DirectusText[] }
  return result.data?.[0] ? normalizeDirectusText(result.data[0]) : null
}

export async function getDirectusFigures() {
  const figuresUrl = new URL('/items/figures', DIRECTUS_URL)
  figuresUrl.searchParams.set('sort', 'id')
  figuresUrl.searchParams.set('limit', '-1')
  figuresUrl.searchParams.set('filter[status][_eq]', 'published')
  figuresUrl.searchParams.set('fields', 'id,name,slug,kind,life_span,biography,background_color,status,cover.id,cover.filename_download,cover.title,cover.width,cover.height')

  const quotesUrl = new URL('/items/figure_quotes', DIRECTUS_URL)
  quotesUrl.searchParams.set('sort', 'sort')
  quotesUrl.searchParams.set('limit', '-1')
  quotesUrl.searchParams.set('fields', 'id,figure,text,source,sort')

  const [figuresResponse, quotesResponse] = await Promise.all([
    directusFetch(figuresUrl),
    directusFetch(quotesUrl),
  ])
  if (!figuresResponse.ok) throw new Error(`Error fetching figures from Directus: ${figuresResponse.status}`)
  if (!quotesResponse.ok) throw new Error(`Error fetching figure quotes from Directus: ${quotesResponse.status}`)

  const figuresResult = (await figuresResponse.json()) as { data?: DirectusFigure[] }
  const quotesResult = (await quotesResponse.json()) as { data?: DirectusFigureQuote[] }

  return {
    docs: (figuresResult.data ?? []).map((figure) => ({
      id: figure.id,
      name: figure.name,
      slug: figure.slug,
      kind: figure.kind,
      lifeSpanLabel: figure.life_span,
      biography: figure.biography ?? '',
      backgroundColor: figure.background_color,
      featured: true,
      contributions: (quotesResult.data ?? [])
        .filter((quote) => quote.figure === figure.id)
        .map((quote) => ({ ...quote, blockType: 'quote' })),
      cover: {
        url: getAssetUrl(figure.cover),
        alt: figure.cover?.title ?? figure.cover?.filename_download ?? figure.name,
        width: figure.cover?.width,
        height: figure.cover?.height,
      },
    })),
  }
}

function getYouTubeVideoId(value: string) {
  try {
    const url = new URL(value)

    if (url.hostname === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] ?? ''
    }

    if (url.hostname.endsWith('youtube.com')) {
      if (url.pathname === '/watch') return url.searchParams.get('v') ?? ''

      const [, route, id] = url.pathname.split('/')
      if (route === 'shorts' || route === 'embed' || route === 'live') return id ?? ''
    }
  } catch {
    return ''
  }

  return ''
}

function normalizeDirectusVideo(video: DirectusVideo) {
  const videoId = getYouTubeVideoId(video.youtube_url)

  return {
    id: video.id,
    title: video.title,
    youtubeUrl: video.youtube_url,
    thumbnail: {
      url: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '',
      alt: video.title,
    },
  }
}

export async function getDirectusVideos() {
  const url = new URL('/items/videos', DIRECTUS_URL)
  url.searchParams.set('sort', '-id')
  url.searchParams.set('limit', '6')
  url.searchParams.set('fields', 'id,title,youtube_url')

  const response = await directusFetch(url)
  if (!response.ok) throw new Error(`Error fetching videos from Directus: ${response.status}`)

  const result = (await response.json()) as { data?: DirectusVideo[] }

  return {
    docs: (result.data ?? []).map(normalizeDirectusVideo),
  }
}

export async function getDirectusMovies() {
  const url = new URL('/items/movies', DIRECTUS_URL)
  url.searchParams.set('sort', 'id')
  url.searchParams.set('limit', '4')
  url.searchParams.set('fields', 'id,letterboxd_url,cover_url')

  const response = await directusFetch(url)
  if (!response.ok) throw new Error(`Error fetching movies from Directus: ${response.status}`)

  const result = (await response.json()) as { data?: DirectusMovie[] }

  return {
    docs: (result.data ?? []).map((movie) => ({
      id: movie.id,
      letterboxdUrl: movie.letterboxd_url,
      poster: {
        url: movie.cover_url,
      },
    })),
  }
}

export async function getDirectusAlbums() {
  const url = new URL('/items/albums', DIRECTUS_URL)
  url.searchParams.set('sort', 'id')
  url.searchParams.set('limit', '4')
  url.searchParams.set('fields', 'id,apple_music_url,cover_url')

  const response = await directusFetch(url)
  if (!response.ok) throw new Error(`Error fetching albums from Directus: ${response.status}`)

  const result = (await response.json()) as { data?: DirectusAlbum[] }

  return {
    docs: result.data ?? [],
  }
}

export async function getDirectusRuns() {
  const url = new URL('/items/runs', DIRECTUS_URL)
  url.searchParams.set('sort', '-id')
  url.searchParams.set('fields', 'id,strava_url,cover.id,cover.filename_download')

  const response = await directusFetch(url)
  if (!response.ok) throw new Error(`Error fetching runs from Directus: ${response.status}`)

  const result = (await response.json()) as { data?: DirectusRun[] }

  return {
    docs: (result.data ?? []).map((run) => ({
      id: run.id,
      stravaUrl: run.strava_url,
      coverUrl: run.cover?.id
        ? new URL(`/assets/${run.cover.id}?width=600&height=800&fit=cover&format=webp&quality=80`, DIRECTUS_URL).toString()
        : '',
      coverAlt: run.cover?.filename_download ?? 'Cover de actividad en Strava',
    })),
  }
}
