import { head } from '@vercel/blob';

export default async function handler(req, res) {
    // Настраиваем CORS-заголовки, чтобы браузер не блокировал запросы к бэкенду
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    // Если это предварительный запрос (OPTIONS) от браузера, просто отвечаем "ОК"
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Разрешаем только GET-запросы для чтения данных
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { key } = req.query;

        // Проверяем, передал ли клиент ключ синхронизации
        if (!key) {
            return res.status(400).json({ error: 'Missing sync key' });
        }

        const fileName = `sync-${key}.json`;
        
        try {
            // Так как Vercel Blob выдает динамические уникальные URL-адреса для файлов,
            // метод head() позволяет нам найти актуальную прямую ссылку на файл по его имени.
            // (вместо 'https://fake-url.com/' подставится нужный путь внутри хранилища)
            const blobDetails = await head(`https://fake-url.com/${fileName}`); 
            
            // Закачиваем содержимое найденного файла
            const response = await fetch(blobDetails.url);
            const data = await response.json();
            
            // Возвращаем данные обратно в браузер
            return res.status(200).json(data);
        } catch (e) {
            // Если метод head() выбросил ошибку — значит файла с таким именем в облаке еще нет
            return res.status(404).json({ error: 'Key not found' });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
