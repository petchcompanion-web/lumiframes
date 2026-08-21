import { get, put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      let anime = [];
      try {
        const blob = await get('anime.json');
        if (blob) {
          const content = await blob.text();
          anime = JSON.parse(content);
        }
      } catch (e) {}
      res.status(200).json({ success: true, anime });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { anime } = req.body;
      if (!anime) return res.status(400).json({ error: 'Missing anime data' });
      await put('anime.json', JSON.stringify(anime), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
      });
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}