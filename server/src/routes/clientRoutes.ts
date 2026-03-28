import { Router } from 'express';
import { queryAll, queryOne, run } from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', (req: AuthRequest, res) => {
  try {
    const clients = queryAll('SELECT * FROM clients WHERE user_id = ? ORDER BY company_name', [req.userId!]);
    res.json(clients);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req: AuthRequest, res) => {
  try {
    const client = queryOne('SELECT * FROM clients WHERE id = ? AND user_id = ?', [Number(req.params.id), req.userId!]);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req: AuthRequest, res) => {
  try {
    const { company_name, contact_name, email, address, postcode, city, country, kvk_number, btw_number } = req.body;

    if (!company_name) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    if (kvk_number && kvk_number.trim()) {
      const dup = queryOne('SELECT * FROM clients WHERE kvk_number = ? AND user_id = ?', [kvk_number.trim(), req.userId!]);
      if (dup) return res.status(409).json({ error: 'Bedrijf met dit KVK nummer bestaat al' });
    } else {
      const dup = queryOne('SELECT * FROM clients WHERE company_name = ? AND user_id = ?', [company_name.trim(), req.userId!]);
      if (dup) return res.status(409).json({ error: 'Bedrijf bestaat al' });
    }

    run(
      `INSERT INTO clients (user_id, company_name, contact_name, email, address, postcode, city, country, kvk_number, btw_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId!, company_name, contact_name || '', email || '', address || '', postcode || '', city || '', country || 'Nederland', kvk_number || '', btw_number || '']
    );

    const client = queryOne('SELECT * FROM clients WHERE user_id = ? AND company_name = ? ORDER BY id DESC LIMIT 1', [req.userId!, company_name]);
    res.status(201).json(client);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req: AuthRequest, res) => {
  try {
    const { company_name, contact_name, email, address, postcode, city, country, kvk_number, btw_number } = req.body;

    const existing = queryOne('SELECT * FROM clients WHERE id = ? AND user_id = ?', [Number(req.params.id), req.userId!]);
    if (!existing) return res.status(404).json({ error: 'Client not found' });

    run(
      `UPDATE clients SET company_name=?, contact_name=?, email=?, address=?, postcode=?, city=?, country=?, kvk_number=?, btw_number=? WHERE id=? AND user_id=?`,
      [company_name, contact_name || '', email || '', address || '', postcode || '', city || '', country || 'Nederland', kvk_number || '', btw_number || '', Number(req.params.id), req.userId!]
    );

    const client = queryOne('SELECT * FROM clients WHERE id = ?', [Number(req.params.id)]);
    res.json(client);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req: AuthRequest, res) => {
  try {
    const existing = queryOne('SELECT * FROM clients WHERE id = ? AND user_id = ?', [Number(req.params.id), req.userId!]);
    if (!existing) return res.status(404).json({ error: 'Client not found' });

    run('DELETE FROM clients WHERE id = ? AND user_id = ?', [Number(req.params.id), req.userId!]);
    res.json({ message: 'Client deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
