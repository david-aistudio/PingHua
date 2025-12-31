import { NextResponse } from 'next/server';
import { animexin } from '@/lib/animexin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, query, url } = body;

    if (action === 'search') {
        const data = await animexin.search(query || '');
        return NextResponse.json({ status: 'success', data: data.data });
    }

    if (action === 'detail' && url) {
        const data = await animexin.getDetail(url);
        return NextResponse.json({ status: 'success', data });
    }

    if (action === 'episode' && url) {
        // Extract slug dari URL
        const slug = url.replace('https://animexin.dev', '').replace(/^\/|\/$/g, '');
        const data = await animexin.getEpisode(slug);
        return NextResponse.json({ status: 'success', data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}