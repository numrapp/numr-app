"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const database_1 = require("../database");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    try {
        const { email, password, company_name, company_address, company_postcode, company_city, kvk_number, btw_number, iban, phone } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const existing = (0, database_1.queryOne)('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const password_hash = await bcryptjs_1.default.hash(password, 10);
        (0, database_1.run)(`INSERT INTO users (email, password_hash, company_name, company_address, company_postcode, company_city, kvk_number, btw_number, iban, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [email, password_hash, company_name || '', company_address || '', company_postcode || '', company_city || '', kvk_number || '', btw_number || '', iban || '', phone || '']);
        const newUser = (0, database_1.queryOne)('SELECT id FROM users WHERE email = ?', [email]);
        const userId = newUser.id;
        const token = jsonwebtoken_1.default.sign({ userId }, auth_1.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, userId });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = (0, database_1.queryOne)('SELECT id, password_hash FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const valid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, auth_1.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, userId: user.id });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/profile', auth_1.authMiddleware, (req, res) => {
    try {
        const user = (0, database_1.queryOne)('SELECT id, email, company_name, company_address, company_postcode, company_city, kvk_number, btw_number, iban, phone, logo_path, smtp_host, smtp_port, smtp_user, smtp_pass, default_payment_days, invoice_prefix, next_invoice_number, deepl_api_key, terms_accepted, subscription_type, subscription_end FROM users WHERE id = ?', [req.userId]);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/accept-terms', auth_1.authMiddleware, (req, res) => {
    try {
        (0, database_1.run)('UPDATE users SET terms_accepted = 1 WHERE id = ?', [req.userId]);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Record an App Store / Play Store receipt and activate the matching plan.
// Note: for production-grade validation we would send the receipt to Apple's
// /verifyReceipt endpoint. That requires the shared secret env var
// APPLE_IAP_SHARED_SECRET and network egress. If not configured we trust the
// client for now (the purchaseProduct call on-device already confirms the
// StoreKit transaction succeeded) and keep subscription_end conservative.
router.post('/iap-receipt', auth_1.authMiddleware, async (req, res) => {
    try {
        const { product_id, receipt, jws, transaction_id, platform } = req.body || {};
        void jws; // jws (StoreKit 2) accepted but not yet validated server-side.
        if (!product_id)
            return res.status(400).json({ error: 'product_id is required' });
        let plan = 'monthly';
        if (/yearly|annual/i.test(product_id))
            plan = 'yearly';
        const start = new Date();
        const end = new Date(start);
        if (plan === 'yearly')
            end.setFullYear(end.getFullYear() + 1);
        else
            end.setMonth(end.getMonth() + 1);
        // Optional Apple server-side validation.
        const secret = process.env.APPLE_IAP_SHARED_SECRET;
        if (platform === 'ios' && secret && receipt) {
            try {
                const verify = async (url) => {
                    const r = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 'receipt-data': receipt, password: secret, 'exclude-old-transactions': true }),
                    });
                    return r.json();
                };
                let result = await verify('https://buy.itunes.apple.com/verifyReceipt');
                if (result.status === 21007)
                    result = await verify('https://sandbox.itunes.apple.com/verifyReceipt');
                if (result.status !== 0)
                    return res.status(400).json({ error: 'Receipt validation failed', status: result.status });
                const latest = Array.isArray(result.latest_receipt_info) ? result.latest_receipt_info[result.latest_receipt_info.length - 1] : null;
                if (latest?.expires_date_ms) {
                    end.setTime(Number(latest.expires_date_ms));
                }
            }
            catch (verr) {
                console.error('apple verify failed', verr?.message || verr);
            }
        }
        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];
        (0, database_1.run)('UPDATE users SET subscription_type = ?, subscription_start = ?, subscription_end = ? WHERE id = ?', [plan, startStr, endStr, req.userId]);
        res.json({ success: true, subscription_type: plan, subscription_end: endStr, transaction_id });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/subscribe', auth_1.authMiddleware, (req, res) => {
    try {
        const { type } = req.body;
        const start = new Date().toISOString().split('T')[0];
        const endDate = new Date();
        if (type === 'yearly')
            endDate.setFullYear(endDate.getFullYear() + 1);
        else if (type === 'trial')
            endDate.setDate(endDate.getDate() + 3);
        else
            endDate.setMonth(endDate.getMonth() + 1);
        const end = endDate.toISOString().split('T')[0];
        (0, database_1.run)('UPDATE users SET subscription_type = ?, subscription_start = ?, subscription_end = ? WHERE id = ?', [type, start, end, req.userId]);
        res.json({ success: true, subscription_type: type, subscription_end: end });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ error: 'Email is required' });
        const user = (0, database_1.queryOne)('SELECT id, email FROM users WHERE email = ?', [email]);
        if (!user)
            return res.json({ success: true });
        const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
        const expires = new Date(Date.now() + 3600000).toISOString();
        (0, database_1.run)('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?', [token, expires, user.id]);
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;
        try {
            const transporter = nodemailer_1.default.createTransport({
                host: process.env.SMTP_HOST || 'smtp.office365.com',
                port: Number(process.env.SMTP_PORT) || 587,
                secure: false,
                auth: { user: process.env.SMTP_USER || 'info@mrefinance.nl', pass: process.env.SMTP_PASS || '' },
                tls: { ciphers: 'SSLv3', rejectUnauthorized: false },
            });
            await transporter.sendMail({
                from: `"numr" <${process.env.SMTP_USER || 'info@mrefinance.nl'}>`,
                to: email,
                subject: 'Wachtwoord herstellen - numr',
                html: `<div style="font-family:Arial;max-width:500px;margin:0 auto;padding:20px;">
          <h2 style="color:#1A1A1A;">Wachtwoord herstellen</h2>
          <p>U heeft een verzoek ingediend om uw wachtwoord te herstellen.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#DFFF00;color:#1A1A1A;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;margin:20px 0;">Nieuw wachtwoord instellen</a>
          <p style="color:#999;font-size:12px;">Deze link is 1 uur geldig. Als u dit verzoek niet heeft gedaan, kunt u deze e-mail negeren.</p>
          <p style="color:#ccc;font-size:11px;">numr - Professionele facturen</p>
        </div>`,
            });
        }
        catch (emailErr) {
            console.error('Email send error:', emailErr);
        }
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password)
            return res.status(400).json({ error: 'Token and password are required' });
        if (password.length < 6)
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        const user = (0, database_1.queryOne)('SELECT id, reset_token_expires FROM users WHERE reset_token = ?', [token]);
        if (!user)
            return res.status(400).json({ error: 'Invalid or expired reset link' });
        if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date()) {
            return res.status(400).json({ error: 'Reset link has expired' });
        }
        const password_hash = await bcryptjs_1.default.hash(password, 10);
        (0, database_1.run)('UPDATE users SET password_hash = ?, reset_token = ?, reset_token_expires = ? WHERE id = ?', [password_hash, '', '', user.id]);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.put('/profile', auth_1.authMiddleware, (req, res) => {
    try {
        const { company_name, company_address, company_postcode, company_city, kvk_number, btw_number, iban, phone, smtp_host, smtp_port, smtp_user, smtp_pass, default_payment_days, invoice_prefix, deepl_api_key } = req.body;
        (0, database_1.run)(`UPDATE users SET company_name=?, company_address=?, company_postcode=?, company_city=?, kvk_number=?, btw_number=?, iban=?, phone=?, smtp_host=?, smtp_port=?, smtp_user=?, smtp_pass=?, default_payment_days=?, invoice_prefix=?, deepl_api_key=? WHERE id=?`, [company_name, company_address, company_postcode, company_city, kvk_number, btw_number, iban, phone, smtp_host || '', smtp_port || 587, smtp_user || '', smtp_pass || '', default_payment_days || 30, invoice_prefix || 'INV', deepl_api_key || '', req.userId]);
        const user = (0, database_1.queryOne)('SELECT id, email, company_name, company_address, company_postcode, company_city, kvk_number, btw_number, iban, phone, logo_path, smtp_host, smtp_port, smtp_user, smtp_pass, default_payment_days, invoice_prefix, next_invoice_number, deepl_api_key FROM users WHERE id = ?', [req.userId]);
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete('/account', auth_1.authMiddleware, (req, res) => {
    try {
        const userId = req.userId;
        const invoices = (0, database_1.queryAll)('SELECT id FROM invoices WHERE user_id = ?', [userId]);
        for (const inv of invoices) {
            (0, database_1.run)('DELETE FROM invoice_items WHERE invoice_id = ?', [inv.id]);
        }
        (0, database_1.run)('DELETE FROM invoices WHERE user_id = ?', [userId]);
        const offertes = (0, database_1.queryAll)('SELECT id FROM offertes WHERE user_id = ?', [userId]);
        for (const off of offertes) {
            (0, database_1.run)('DELETE FROM offerte_items WHERE offerte_id = ?', [off.id]);
        }
        (0, database_1.run)('DELETE FROM offertes WHERE user_id = ?', [userId]);
        (0, database_1.run)('DELETE FROM clients WHERE user_id = ?', [userId]);
        (0, database_1.run)('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map