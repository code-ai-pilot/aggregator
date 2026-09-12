import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import jobRoutes from './server/jobRoutes';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API Routes - Backend Isolation
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'wfh-ai-jobs-aggregator',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Safe client configuration endpoint - Only returns non-secret public metadata
  app.get('/api/config', (_req: Request, res: Response) => {
    res.json({
      appName: 'WFH AI Jobs Aggregator',
      version: '0.1.0-mvp',
      categories: [
        'IMAGE_ANNOTATION',
        'IMAGE_CATEGORIZATION',
        'DATA_LABELING',
        'TEXT_ANNOTATION',
        'AI_RESPONSE_EVALUATION',
        'SEARCH_EVALUATION',
        'CONTENT_EVALUATION',
        'DATA_VERIFICATION',
        'TRANSCRIPTION',
        'CONTENT_MODERATION',
        'LANGUAGE_EVALUATION',
        'AI_TRAINING',
        'OTHER_RELEVANT',
      ],
    });
  });

  // Mount read-only Job API endpoints (/api/jobs, /api/jobs/:id, /api/jobs/search, /api/categories, /api/sources)
  app.use('/api', jobRoutes);

  // Frontend Serving / Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] WFH AI Jobs Aggregator running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Error] Failed to start server:', err);
  process.exit(1);
});
