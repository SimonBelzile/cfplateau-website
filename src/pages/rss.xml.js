import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => +new Date(b.data.pubDate) - +new Date(a.data.pubDate));
  return rss({
    title: 'Abattoir CrossFit — Blog',
    description: 'Derniers articles',
    site: context.site,
    items: posts.map((p) => ({
      link: `/blog/${p.slug}/`,
      title: p.data.title,
      pubDate: p.data.pubDate,
      description: p.data.description
    })),
  });
}
