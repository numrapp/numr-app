import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/:nummer', authMiddleware, async (req, res) => {
  try {
    const nummer = String(req.params.nummer).replace(/\D/g, '');
    if (nummer.length !== 8) return res.status(400).json({ error: 'KVK nummer moet 8 cijfers zijn' });

    const response = await fetch(`https://openkvk.nl/api/v1/query/${nummer}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      return res.status(404).json({ error: 'KVK niet gevonden' });
    }

    const data: any = await response.json();
    const results = data?.results || data?.resultaten_pagina || [];

    if (Array.isArray(results) && results.length > 0) {
      const first = results[0];
      return res.json({
        company_name: first.handelsnaam || first.naam || '',
        address: first.straat ? `${first.straat} ${first.huisnummer || ''}`.trim() : '',
        postcode: first.postcode || '',
        city: first.plaats || '',
      });
    }

    const r2 = await fetch(`https://api.kvk.nl/api/v1/zoeken?kvkNummer=${nummer}`, {
      headers: { 'Accept': 'application/json' },
    }).catch(() => null);

    if (r2 && r2.ok) {
      const d2: any = await r2.json();
      const items = d2?.resultaten || [];
      if (items.length > 0) {
        const it = items[0];
        return res.json({
          company_name: it.handelsnaam || it.naam || '',
          address: it.adres?.binnenlandsAdres?.straatnaam ? `${it.adres.binnenlandsAdres.straatnaam} ${it.adres.binnenlandsAdres.huisnummer || ''}`.trim() : '',
          postcode: it.adres?.binnenlandsAdres?.postcode || '',
          city: it.adres?.binnenlandsAdres?.plaats || '',
        });
      }
    }

    res.status(404).json({ error: 'KVK niet gevonden' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
