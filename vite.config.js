import { defineConfig } from 'vite';

export default defineConfig({
  root: './src', // Указывает, что корень проекта - текущая папка
  base: process.env.NODE_ENV === 'production' ? '/sites/resume-gen/' : '/', // Пути для продакшена
  build: {
    outDir: './../dist', // Папка для продакшен-сборки
    emptyOutDir: true, // Очищает dist перед сборкой
  },
  server: {
    port: 4173, // Локальный сервер будет работать на 3000 порту
    watch: {
      usePolling: true // Гарантирует работу на Windows и в Docker
    }
  },
  preview: {
    port: 4173, // Порт для предпросмотра продакшен-версии
    watch: {
      usePolling: true // Гарантирует работу на Windows и в Docker
    }
  },
});