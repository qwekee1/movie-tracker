import { list } from '@vercel/blob';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { key } = req.query;
        if (!key) return res.status(400).json({ error: 'Missing sync key' });

        // Ищем файл, который начинается на "sync-КЛЮЧ_"
        const { blobs } = await list({ prefix: `sync-${key}_` });

        if (blobs.length === 0) {
            return res.status(404).json({ error: 'Key not found' });
        }

        // Берем первый найденный файл и читаем его по его настоящей ссылке
        const response = await fetch(blobs[0].url);
        const data = await response.json();

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
