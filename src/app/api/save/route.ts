import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { path, data } = await request.json();

    if (!path || !data) {
      return NextResponse.json({ error: 'Missing path or data' }, { status: 400 });
    }

    const cleanPath = path.replace(/^\/|\/$/g, '');

    await supabaseAdmin.from('api_cache').upsert({
      path: cleanPath,
      data: data,
      timestamp: Date.now()
    });

    return NextResponse.json({ status: 'saved' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
