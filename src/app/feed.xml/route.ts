import { supabaseAdmin } from '@/lib/supabase-server';

const BASE_URL = 'https://pinghua.qzz.io';

export async function GET() {
  const { data: posts } = await supabaseAdmin
    .from('api_cache')
    .select('path, data, timestamp')
    .order('timestamp', { ascending: false })
    .limit(50);

  const itemsXml = (posts || [])
    .map((post) => {
      const cleanPath = post.path.replace(/^\/|\/$/g, '');
      const title = (post.data as any)?.title || 'Donghua Update';
      const description = (post.data as any)?.synopsis?.substring(0, 160) || `Nonton ${title} Subtitle Indonesia terbaru.`;
      
      return `
        <item>
          <title><![CDATA[${title} - Nonton Sub Indo]]></title>
          <link>${BASE_URL}/${cleanPath}</link>
          <guid>${BASE_URL}/${cleanPath}</guid>
          <pubDate>${new Date(post.timestamp || Date.now()).toUTCString()}</pubDate>
          <description><![CDATA[${description}]]></description>
        </item>
      `;
    })
    .join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>PingHua - Update Donghua Terbaru</title>
        <link>${BASE_URL}</link>
        <description>Streaming Donghua Subtitle Indonesia Terlengkap dan Tercepat</description>
        <language>id-id</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
        ${itemsXml}
      </channel>
    </rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=1200, stale-while-revalidate=600',
    },
  });
}
