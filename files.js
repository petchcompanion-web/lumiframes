import { get } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let files = [];
    try {
      const blob = await get('files/metadata.json');
      if (blob) {
        const content = await blob.text();
        files = JSON.parse(content);
      }
    } catch (e) {}
    files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    res.status(200).json({ success: true, files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}