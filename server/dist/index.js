"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const database_1 = require("./database");
const auth_1 = require("./middleware/auth");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const clientRoutes_1 = __importDefault(require("./routes/clientRoutes"));
const invoiceRoutes_1 = __importDefault(require("./routes/invoiceRoutes"));
const exportRoutes_1 = __importDefault(require("./routes/exportRoutes"));
const kvkRoutes_1 = __importDefault(require("./routes/kvkRoutes"));
const PORT = process.env.PORT || 3001;
const UPLOADS_DIR = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(UPLOADS_DIR))
    fs_1.default.mkdirSync(UPLOADS_DIR, { recursive: true });
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => cb(null, `logo_${Date.now()}${path_1.default.extname(file.originalname)}`),
});
const upload = (0, multer_1.default)({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
async function main() {
    await (0, database_1.initDatabase)();
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ origin: true, credentials: true }));
    app.use(express_1.default.json());
    app.use('/uploads', express_1.default.static(UPLOADS_DIR));
    const PUBLIC_DIR = path_1.default.join(__dirname, '../public');
    const BUNDLED_CLIENT_DIR = path_1.default.join(__dirname, '../client-dist');
    const EXT_CLIENT_DIR = path_1.default.join(__dirname, '../../client/dist');
    const EFFECTIVE_CLIENT_DIR = fs_1.default.existsSync(path_1.default.join(BUNDLED_CLIENT_DIR, 'index.html')) ? BUNDLED_CLIENT_DIR : EXT_CLIENT_DIR;
    console.log('Client dir:', EFFECTIVE_CLIENT_DIR, 'exists:', fs_1.default.existsSync(path_1.default.join(EFFECTIVE_CLIENT_DIR, 'index.html')));
    app.get('/privacy', (_req, res) => res.sendFile(path_1.default.join(PUBLIC_DIR, 'privacy.html')));
    app.get('/terms', (_req, res) => res.sendFile(path_1.default.join(PUBLIC_DIR, 'terms.html')));
    app.get('/video', (_req, res) => res.sendFile(path_1.default.join(PUBLIC_DIR, 'video.html')));
    app.get('/site', (_req, res) => res.sendFile(path_1.default.join(PUBLIC_DIR, 'index.html')));
    app.use(express_1.default.static(EFFECTIVE_CLIENT_DIR));
    app.use('/api/auth', authRoutes_1.default);
    app.use('/api/clients', clientRoutes_1.default);
    app.use('/api/invoices', invoiceRoutes_1.default);
    app.use('/api/export', exportRoutes_1.default);
    app.use('/api/kvk', kvkRoutes_1.default);
    app.post('/api/upload-logo', auth_1.authMiddleware, upload.single('logo'), (req, res) => {
        try {
            if (!req.file)
                return res.status(400).json({ error: 'No file uploaded' });
            const logoPath = `/uploads/${req.file.filename}`;
            (0, database_1.run)('UPDATE users SET logo_path = ? WHERE id = ?', [logoPath, req.userId]);
            res.json({ logo_path: logoPath });
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    app.get('*', (_req, res) => {
        const clientIndex = path_1.default.join(EFFECTIVE_CLIENT_DIR, 'index.html');
        if (fs_1.default.existsSync(clientIndex)) {
            res.sendFile(clientIndex);
        }
        else {
            res.sendFile(path_1.default.join(PUBLIC_DIR, 'index.html'));
        }
    });
    app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
}
main().catch(console.error);
//# sourceMappingURL=index.js.map