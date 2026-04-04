import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { initDatabase, queryOne, run } from './database';
import { authMiddleware, AuthRequest } from './middleware/auth';
import bcrypt from 'bcryptjs';
import authRoutes from './routes/authRoutes';
import clientRoutes from './routes/clientRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import exportRoutes from './routes/exportRoutes';
import kvkRoutes from './routes/kvkRoutes';
import offerteRoutes from './routes/offerteRoutes';

const PORT = process.env.PORT || 3001;
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => cb(null, `logo_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

async function createDemoAccount() {
  const existing = queryOne('SELECT id FROM users WHERE email = ?', ['test@numr.nl']);
  if (!existing) {
    const hash = await bcrypt.hash('Test1234!', 10);
    run(`INSERT INTO users (email, password_hash, company_name, company_address, company_postcode, company_city, kvk_number, btw_number, iban, phone, terms_accepted, subscription_type, subscription_end) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['test@numr.nl', hash, 'numr Demo BV', 'Keizersgracht 100', '1015 AA', 'Amsterdam', '12345678', 'NL123456789B01', 'NL91ABNA0417164300', '0612345678', '1', 'yearly', '2030-12-31']);
  } else {
    run(`UPDATE users SET terms_accepted = '1', subscription_type = 'yearly', subscription_end = '2030-12-31' WHERE email = ?`, ['test@numr.nl']);
  }
}

async function main() {
  await initDatabase();
  await createDemoAccount();

  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use('/uploads', express.static(UPLOADS_DIR));

  const PUBLIC_DIR = path.join(__dirname, '../public');
  const BUNDLED_CLIENT_DIR = path.join(__dirname, '../client-dist');
  const EXT_CLIENT_DIR = path.join(__dirname, '../../client/dist');
  const EFFECTIVE_CLIENT_DIR = fs.existsSync(path.join(BUNDLED_CLIENT_DIR, 'index.html')) ? BUNDLED_CLIENT_DIR : EXT_CLIENT_DIR;
  console.log('Client dir:', EFFECTIVE_CLIENT_DIR, 'exists:', fs.existsSync(path.join(EFFECTIVE_CLIENT_DIR, 'index.html')));

  app.get('/privacy', (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'privacy.html')));
  app.get('/terms', (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'terms.html')));
  app.get('/video', (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'video.html')));
  app.get('/site', (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));

  app.use(express.static(EFFECTIVE_CLIENT_DIR));

  app.use('/api/auth', authRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/invoices', invoiceRoutes);
  app.use('/api/export', exportRoutes);
  app.use('/api/kvk', kvkRoutes);
  app.use('/api/offertes', offerteRoutes);

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
    const clientIndex = path.join(EFFECTIVE_CLIENT_DIR, 'index.html');
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
