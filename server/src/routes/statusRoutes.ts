import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { queryAll, queryOne, run } from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const UPLOADS_DIR = path.join(__dirname, '../../../uploads/videos');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => cb(null, `vid_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

router.get('/videos', (_req, res) => {
  try {
    const videos = queryAll(
      `SELECT sv.*, u.company_name FROM status_videos sv LEFT JOIN users u ON sv.user_id = u.id ORDER BY sv.created_at DESC`
    );
    res.json(videos);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/videos/me', authMiddleware, (req: AuthRequest, res) => {
  try {
    const videos = queryAll('SELECT * FROM status_videos WHERE user_id = ? ORDER BY created_at DESC', [req.userId!]);
    res.json(videos);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/videos', authMiddleware, upload.single('video'), (req: AuthRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No video uploaded' });
    const { category, description, location } = req.body;
    const user = queryOne('SELECT company_name FROM users WHERE id = ?', [req.userId!]);
    const videoPath = `/uploads/videos/${req.file.filename}`;
    run(
      `INSERT INTO status_videos (user_id, category, description, video_path, company_name, location) VALUES (?, ?, ?, ?, ?, ?)`,
      [req.userId!, category || '', description || '', videoPath, user?.company_name || '', location || '']
    );
    const video = queryOne('SELECT * FROM status_videos WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.userId!]);
    res.status(201).json(video);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/videos/:id', authMiddleware, (req: AuthRequest, res) => {
  try {
    const video = queryOne('SELECT * FROM status_videos WHERE id = ? AND user_id = ?', [Number(req.params.id), req.userId!]);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    run('DELETE FROM status_videos WHERE id = ?', [video.id]);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
