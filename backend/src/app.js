import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { pool } from './db.js';
import contentRoutes from './routes/content.js';
import sectionRoutes from './routes/sections.js';
import iphoneRoutes from './routes/iphones.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

export const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', db: 'connected', time: new Date().toISOString() });
});

app.use('/api', contentRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/iphones', iphoneRoutes);

app.use(notFound);
app.use(errorHandler);
