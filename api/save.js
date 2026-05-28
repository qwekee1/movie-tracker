import { put } from '@vercel/blob';

export default async function handler(req, res) {
    // Настраиваем CORS-заголовки, чтобы браузер не блокировал запросы к бэкенду
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Если это предварительный запрос (OPTIONS) от браузера, просто отвечаем "ОК"
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Разрешаем только POST-запросы для сохранения данных
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { key, boardData, deletedMovies } = req.body;

        // Проверяем, передал ли клиент ключ синхронизации
        if (!key) {
            return res.status(400).json({ error: 'Missing sync key' });
        }

        // Формируем структуру JSON для хранения
        const payload = JSON.stringify({ boardData, deletedMovies });

        // Загружаем данные в Vercel Blob как обычный .json файл.
        // Параметр addRandomSuffix: false критически важен — он отключает 
        // добавление случайных букв к имени, чтобы имя файла всегда было строго фиксированным.
        await put(`sync-${key}.json`, payload, {
            access: 'public',
            addRandomSuffix: false,
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
