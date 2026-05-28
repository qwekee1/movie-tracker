import { put } from '@vercel/blob';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { key, userName, boardData, deletedMovies } = req.body;
        if (!key) return res.status(400).json({ error: 'Missing sync key' });

        // Чистим имя от спецсимволов для безопасного названия файла
        const safeName = userName ? userName.replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '') : 'User';
        
        // Файл будет называться, например: sync-50S4L_Ivan.json
        const fileName = `sync-${key}_${safeName}.json`;

        // Внутрь файла тоже положим имя, чтобы при загрузке с телефона фронтенд его вспомнил
        const payload = JSON.stringify({ boardData, deletedMovies, userName: safeName });

        await put(fileName, payload, {
            access: 'public',
            addRandomSuffix: false, // Отключаем добавление случайных цифр к имени
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
