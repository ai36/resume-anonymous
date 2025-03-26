import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    const { file = 'data-ru.json' } = req.query;
    const safeFile = file.replace(/[^a-z0-9.-]/gi, '_');
    
    // Два возможных пути для файлов
    const pathsToTry = [
      path.join(process.cwd(), 'public', safeFile),  // Vercel
      path.join(process.cwd(), 'dist', safeFile)    // Локальный preview
    ];
    
    let fileData;
    for (const filePath of pathsToTry) {
      try {
        fileData = await fs.readFile(filePath, 'utf8');
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!fileData) throw new Error('File not found in any location');
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(fileData);
  } catch (error) {
    res.status(404).json({ error: "Файл не найден", details: error.message });
  }
}