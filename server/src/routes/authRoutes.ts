import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryOne, run, getLastInsertId, queryAll } from '../database';
import { JWT_SECRET, authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, company_name, company_address, company_postcode, company_city, kvk_number, btw_number, iban, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existing = queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    run(
      `INSERT INTO users (email, password_hash, company_name, company_address, company_postcode, company_city, kvk_number, btw_number, iban, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, password_hash, company_name || '', company_address || '', company_postcode || '', company_city || '', kvk_number || '', btw_number || '', iban || '', phone || '']
    );

    const newUser = queryOne('SELECT id FROM users WHERE email = ?', [email]);
    const userId = newUser.id;
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, userId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = queryOne('SELECT id, password_hash FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, userId: user.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/profile', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = queryOne(
      'SELECT id, email, company_name, company_address, company_postcode, company_city, kvk_number, btw_number, iban, phone, logo_path, smtp_host, smtp_port, smtp_user, smtp_pass, default_payment_days, invoice_prefix, next_invoice_number, deepl_api_key, terms_accepted, subscription_type, subscription_end FROM users WHERE id = ?',
      [req.userId!]
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/accept-terms', authMiddleware, (req: AuthRequest, res) => {
  try {
    run('UPDATE users SET terms_accepted = 1 WHERE id = ?', [req.userId!]);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/subscribe', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { type } = req.body;
    const start = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    if (type === 'yearly') endDate.setFullYear(endDate.getFullYear() + 1);
    else if (type === 'trial') endDate.setDate(endDate.getDate() + 3);
    else endDate.setMonth(endDate.getMonth() + 1);
    const end = endDate.toISOString().split('T')[0];
    run('UPDATE users SET subscription_type = ?, subscription_start = ?, subscription_end = ? WHERE id = ?', [type, start, end, req.userId!]);
    res.json({ success: true, subscription_type: type, subscription_end: end });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const user = queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (user) {
      const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const expires = new Date(Date.now() + 3600000).toISOString();
      run('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?', [token, expires, user.id]);
    }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put('/profile', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { company_name, company_address, company_postcode, company_city, kvk_number, btw_number, iban, phone, smtp_host, smtp_port, smtp_user, smtp_pass, default_payment_days, invoice_prefix, deepl_api_key } = req.body;

    run(
      `UPDATE users SET company_name=?, company_address=?, company_postcode=?, company_city=?, kvk_number=?, btw_number=?, iban=?, phone=?, smtp_host=?, smtp_port=?, smtp_user=?, smtp_pass=?, default_payment_days=?, invoice_prefix=?, deepl_api_key=? WHERE id=?`,
      [company_name, company_address, company_postcode, company_city, kvk_number, btw_number, iban, phone, smtp_host || '', smtp_port || 587, smtp_user || '', smtp_pass || '', default_payment_days || 30, invoice_prefix || 'INV', deepl_api_key || '', req.userId!]
    );

    const user = queryOne(
      'SELECT id, email, company_name, company_address, company_postcode, company_city, kvk_number, btw_number, iban, phone, logo_path, smtp_host, smtp_port, smtp_user, smtp_pass, default_payment_days, invoice_prefix, next_invoice_number, deepl_api_key FROM users WHERE id = ?',
      [req.userId!]
    );

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/account', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const invoices = queryAll('SELECT id FROM invoices WHERE user_id = ?', [userId]);
    for (const inv of invoices) { run('DELETE FROM invoice_items WHERE invoice_id = ?', [inv.id]); }
    run('DELETE FROM invoices WHERE user_id = ?', [userId]);
    const offertes = queryAll('SELECT id FROM offertes WHERE user_id = ?', [userId]);
    for (const off of offertes) { run('DELETE FROM offerte_items WHERE offerte_id = ?', [off.id]); }
    run('DELETE FROM offertes WHERE user_id = ?', [userId]);
    run('DELETE FROM clients WHERE user_id = ?', [userId]);
    run('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
