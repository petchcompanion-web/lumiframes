import { put, list, head } from '@vercel/blob';

const ANIME_PATH = 'meta/anime.json';

async function getAnime() {
  try {
    // Try to find the anime.json blob
    const { blobs } = await list({ prefix: 'meta/', limit: 20 });
    const meta = blobs.find(b => b.pathname === ANIME_PATH || b.pathname.endsWith('anime.json'));
    if (!meta) return [];
    const res = await fetch(meta.url);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.anime || []);
  } catch (e) {
    console.error('getAnime error:', e);
    return [];
  }
}

export default async function handler(req) {
  // CORS for safety
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    if (req.method === 'GET') {
      const anime = await getAnime();
      return new Response(JSON.stringify({ anime }), {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const anime = body.anime || [];
      if (!Array.isArray(anime)) {
        return new Response(JSON.stringify({ error: 'anime must be an array' }), {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      // Store as public JSON so every client can read it
      const blob = await put(ANIME_PATH, JSON.stringify(anime), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
      });

      return new Response(JSON.stringify({ ok: true, url: blob.url, count: anime.length }), {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}
