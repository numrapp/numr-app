import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { initDatabase, queryOne, run } from './database';
import { authMiddleware, AuthRequest } from './middleware/auth';
import authRoutes from './routes/authRoutes';
import clientRoutes from './routes/clientRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import exportRoutes from './routes/exportRoutes';
import kvkRoutes from './routes/kvkRoutes';

const PORT = process.env.PORT || 3001;
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => cb(null, `logo_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

async function main() {
  await initDatabase();

  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use('/uploads', express.static(UPLOADS_DIR));

  const PUBLIC_DIR = path.join(__dirname, '../public');
  const CLIENT_DIR = path.join(__dirname, '../../client/dist');

  app.get('/privacy', (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'privacy.html')));
  app.get('/terms', (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'terms.html')));
  app.get('/video', (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'video.html')));
  app.get('/site', (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));

  app.use(express.static(CLIENT_DIR));

  app.use('/api/auth', authRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/invoices', invoiceRoutes);
  app.use('/api/export', exportRoutes);
  app.use('/api/kvk', kvkRoutes);

  app.post('/api/upload-logo', authMiddleware, upload.single('logo'), (req: AuthRequest, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const logoPath = `/uploads/${req.file.filename}`;
      run('UPDATE users SET logo_path = ? WHERE id = ?', [logoPath, req.userId!]);
      res.json({ logo_path: logoPath });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('*', (_req, res) => {
    const clientIndex = path.join(CLIENT_DIR, 'index.html');
    if (fs.existsSync(clientIndex)) {
      res.sendFile(clientIndex);
    } else {
      res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
    }
  });

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

main().catch(console.error);
