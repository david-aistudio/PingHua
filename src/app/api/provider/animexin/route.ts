import { NextResponse } from 'next/server';
import { animexin } from '@/lib/animexin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, query, url } = body;

    if (action === 'search') {
        const data = await animexin.search(query || '');
        return NextResponse.json({ status: 'success', data: data.data }, {
            headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=59' }
        });
    }

    if (action === 'detail' && url) {
        const data = await animexin.getDetail(url);
        return NextResponse.json({ status: 'success', data }, {
            headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=59' }
        });
    }

    if (action === 'episode' && url) {
        // Extract slug dari URL
        const slug = url.replace('https://animexin.dev', '').replace(/^\/|\/$/g, '');
        const data = await animexin.getEpisode(slug);
        // Episode cache lebih pendek biar kalau ada server rusak cepet ketauan
        return NextResponse.json({ status: 'success', data }, {
            headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=59' }
        });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}