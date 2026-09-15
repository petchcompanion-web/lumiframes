import { handleUpload } from '@vercel/blob/client';

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers,
    });
  }

  try {
    const body = await req.json();
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // The original LumiFrames upload flow did not require authentication.
        // Keep that behavior while moving the file bytes directly to Blob so
        // Vercel's 4.5 MB Function request limit is bypassed.
        const allowedContentTypes = [
          'image/*',
          'audio/*',
          'video/*',
          'application/octet-stream',
        ];

        return {
          allowedContentTypes,
          addRandomSuffix: false,
          tokenPayload: clientPayload || '',
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('LumiFrames client upload completed:', blob.pathname);
      },
    });

    return new Response(JSON.stringify(jsonResponse), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error('Client upload token error:', err);
    return new Response(JSON.stringify({
      error: err?.message || 'Unable to prepare upload',
    }), {
      status: 400,
      headers,
    });
  }
}
