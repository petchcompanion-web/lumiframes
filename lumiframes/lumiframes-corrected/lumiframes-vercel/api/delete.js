import { del, list } from '@vercel/blob';

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== 'DELETE') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(req.url, 'http://localhost');
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Find the blob by id (we store as media/{type}/{id}.ext)
    const { blobs } = await list({ prefix: 'media/', limit: 1000 });
    const target = blobs.find(b => b.pathname.includes(`/${id}.`) || b.pathname.includes(`/${id}`));

    if (!target) {
      // Already gone – treat as success
      return new Response(JSON.stringify({ ok: true, deleted: false }), {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    await del(target.url);

    return new Response(JSON.stringify({ ok: true, deleted: true, pathname: target.pathname }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Delete error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Delete failed' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}
