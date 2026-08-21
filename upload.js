import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const type = formData.get('type') || 'file';
    const title = formData.get('title') || 'Untitled';

    if (!file) return res.status(400).json({ error: 'No file provided' });
    if (file.size > 20 * 1024 * 1024) return res.status(400).json({ error: 'File too large (max 20MB)' });

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop() || 'bin';
    const filename = `${uuidv4()}.${ext}`;
    const path = `uploads/${type}/${filename}`;

    const blob = await put(path, buffer, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false,
    });

    const metadata = {
      id: uuidv4(),
      filename: file.name,
      url: blob.url,
      type: type,
      title: title,
      size: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      path: path,
    };

    let allFiles = [];
    try {
      const existing = await get('files/metadata.json');
      if (existing) {
        const content = await existing.text();
        allFiles = JSON.parse(content);
      }
    } catch (e) {}
    allFiles.unshift(metadata);
    await put('files/metadata.json', JSON.stringify(allFiles), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });

    res.status(201).json({ success: true, file: metadata });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}