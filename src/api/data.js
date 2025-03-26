// src/api/data.js
import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    // Получаем имя файла из query-параметров
    const { file = 'data-o3.json' } = req.query;
    
    // Защита от directory traversal
    const safeFile = file.replace(/[^a-z0-9.-]/gi, '_');
    
    // Путь к файлу относительно корня проекта
    const filePath = path.join(process.cwd(), 'public', safeFile);
    
    // Чтение файла
    const data = await fs.readFile(filePath, 'utf8');
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(data);
  } catch (error) {
    res.status(404).json({ error: "Файл не найден" });
  }
}