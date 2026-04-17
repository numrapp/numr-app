"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const database_1 = require("../database");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const UPLOADS_DIR = path_1.default.join(__dirname, '../../../uploads/videos');
if (!fs_1.default.existsSync(UPLOADS_DIR))
    fs_1.default.mkdirSync(UPLOADS_DIR, { recursive: true });
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => cb(null, `vid_${Date.now()}${path_1.default.extname(file.originalname)}`),
});
const upload = (0, multer_1.default)({ storage, limits: { fileSize: 100 * 1024 * 1024 } });
router.get('/videos', (_req, res) => {
    try {
        const videos = (0, database_1.queryAll)(`SELECT sv.*, u.company_name FROM status_videos sv LEFT JOIN users u ON sv.user_id = u.id ORDER BY sv.created_at DESC`);
        res.json(videos);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/videos/me', auth_1.authMiddleware, (req, res) => {
    try {
        const videos = (0, database_1.queryAll)('SELECT * FROM status_videos WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);
        res.json(videos);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/videos', auth_1.authMiddleware, upload.single('video'), (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: 'No video uploaded' });
        const { category, description, location } = req.body;
        const user = (0, database_1.queryOne)('SELECT company_name FROM users WHERE id = ?', [req.userId]);
        const videoPath = `/uploads/videos/${req.file.filename}`;
        (0, database_1.run)(`INSERT INTO status_videos (user_id, category, description, video_path, company_name, location) VALUES (?, ?, ?, ?, ?, ?)`, [req.userId, category || '', description || '', videoPath, user?.company_name || '', location || '']);
        const video = (0, database_1.queryOne)('SELECT * FROM status_videos WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.userId]);
        res.status(201).json(video);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete('/videos/:id', auth_1.authMiddleware, (req, res) => {
    try {
        const video = (0, database_1.queryOne)('SELECT * FROM status_videos WHERE id = ? AND user_id = ?', [Number(req.params.id), req.userId]);
        if (!video)
            return res.status(404).json({ error: 'Video not found' });
        (0, database_1.run)('DELETE FROM status_videos WHERE id = ?', [video.id]);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=statusRoutes.js.map