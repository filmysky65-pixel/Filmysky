import type { Config, Context } from '@netlify/functions';

const CONTENT_REST_URL = 'https://filmysky-3454b-default-rtdb.firebaseio.com/filmysky/content.json';

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toIsoDate = (value?: string | number) => {
  if (!value) return undefined;
  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : new Date(parsed).toISOString();
};

export default async (req: Request, context: Context) => {
  const baseUrl = context.site?.url || new URL(req.url).origin;

  let data: Record<string, { updatedAt?: string | number; createdAt?: string | number }> = {};
  try {
    const response = await fetch(CONTENT_REST_URL, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      return new Response('Failed to load sitemap content.', { status: 502 });
    }
    data = (await response.json()) || {};
  } catch (error) {
    return new Response('Failed to load sitemap content.', { status: 502 });
  }

  const urls = Object.entries(data).map(([id, item]) => {
    const loc = `${baseUrl}/#/detail/${encodeURIComponent(id)}`;
    const lastmod = toIsoDate(item.updatedAt) || toIsoDate(item.createdAt);
    const lastmodTag = lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : '';
    return `<url><loc>${escapeXml(loc)}</loc>${lastmodTag}</url>`;
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
  ].join('');

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};

export const config: Config = {
  path: '/sitemap.xml',
};
