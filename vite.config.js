import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'fs';
import path from 'path';

// Plugin to serve single audio folder directly during dev without duplicating assets
const serveAudioPlugin = () => ({
  name: 'serve-audio',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const parsedUrl = req.url ? req.url.split('?')[0] : '';
      if (parsedUrl.startsWith('/audio/')) {
        const fileName = parsedUrl.replace('/audio/', '');
        const filePath = path.resolve(__dirname, 'audio', fileName);
        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', fileName.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav');
          res.setHeader('Access-Control-Allow-Origin', '*');
          return fs.createReadStream(filePath).pipe(res);
        }
      }
      next();
    });
  }
});

// Serverless standalone & zero-server configuration
export default defineConfig({
  plugins: [react(), viteSingleFile(), serveAudioPlugin()],
  base: './',
  server: {
    port: 3000,
    open: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
