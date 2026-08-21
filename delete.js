import { del, get, put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'File ID required' });

    let files = [];
    try {
      const blob = await get('files/metadata.json');
      if (blob) {
        const content = await blob.text();
        files = JSON.parse(content);
      }
    } catch (e) { return res.status(404).json({ error: 'No files found' }); }

    const index = files.findIndex(f => f.id === id);
    if (index === -1) return res.status(404).json({ error: 'File not found' });

    const file = files[index];
    try { await del(file.path); } catch (e) {}

    files.splice(index, 1);
    await put('files/metadata.json', JSON.stringify(files), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });

    res.status(200).json({ success: true, message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}