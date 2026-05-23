import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('texts');
  return rss({
    title: "Leggiamo",
    description: "Bienvenido a Leggiamo",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title, // Título del texto
      pubDate: post.data.pubDate, // Fecha de publicación
      // link: `/${post.data.type}/${post.slug}/`, // URL corregida
    })),
  });
}