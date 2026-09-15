import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400, headers });
    }

    // Compatibility endpoint for small legacy requests. New frontend code uses
    // /api/upload-token + direct client upload so large files never hit this limit.
    if (file.size > 4 * 1024 * 1024) {
      return new Response(JSON.stringify({
        error: 'This legacy upload endpoint accepts files up to 4 MB. Please use the current frontend upload flow.'
      }), { status: 413, headers });
    }

    const type = String(form.get('type') || 'file');
    const title = String(form.get('title') || file.name || 'untitled');
    const desc = String(form.get('desc') || '');
    const id = randomUUID();
    const ext = (file.name || '').split('.').pop() || 'bin';
    const pathname = `media/${type}/${id}.${ext}`;

    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.type || 'application/octet-stream',
    });

    return new Response(JSON.stringify({ file: {
      id,
      url: blob.url,
      pathname: blob.pathname,
      downloadUrl: blob.downloadUrl || blob.url,
      contentType: blob.contentType || file.type,
      size: file.size,
      title,
      desc,
      type,
      name: title || file.name,
      format: ext,
      kind: type,
    }}), { status: 200, headers });
  } catch (err) {
    console.error('Legacy upload error:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Upload failed' }), { status: 500, headers });
  }
}
