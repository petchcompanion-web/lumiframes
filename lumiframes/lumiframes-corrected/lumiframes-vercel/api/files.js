import { list } from '@vercel/blob';

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { blobs } = await list({ prefix: 'media/', limit: 1000 });

    const files = blobs.map(b => {
      // pathname example: media/voice/uuid.webm
      const parts = b.pathname.split('/');
      const type = parts[1] || 'file';
      const filename = parts[parts.length - 1] || '';
      const id = filename.split('.')[0];
      const format = filename.includes('.') ? filename.split('.').pop() : '';

      return {
        id,
        url: b.url,
        pathname: b.pathname,
        size: b.size,
        uploadedAt: b.uploadedAt,
        contentType: b.contentType,
        type,          // voice | music | pics | video
        title: filename,
        format,
        kind: type,
      };
    });

    return new Response(JSON.stringify({ files }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('List files error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Failed to list files', files: [] }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}
