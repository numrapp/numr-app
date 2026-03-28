import { Router } from 'express';
import { queryOne } from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

function flattenObject(obj: any, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(result, flattenObject(obj[key], fullKey));
    } else {
      result[fullKey] = String(obj[key]);
    }
  }
  return result;
}

function unflattenObject(flat: Record<string, string>): any {
  const result: any = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { translations, targetLang } = req.body;

    if (!translations || !targetLang) {
      return res.status(400).json({ error: 'translations and targetLang are required' });
    }

    const user = queryOne('SELECT deepl_api_key FROM users WHERE id = ?', [req.userId!]);
    const apiKey = user?.deepl_api_key;

    if (!apiKey) {
      return res.status(400).json({ error: 'DeepL API key not configured. Go to Settings -> Translation.' });
    }

    const flat = flattenObject(translations);
    const texts = Object.values(flat);

    const batchSize = 50;
    const allTranslated: string[] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const params = new URLSearchParams();
      batch.forEach(t => params.append('text', t));
      params.append('target_lang', targetLang.toUpperCase());
      params.append('source_lang', 'EN');

      const isFreePlan = apiKey.endsWith(':fx');
      const baseUrl = isFreePlan
        ? 'https://api-free.deepl.com/v2/translate'
        : 'https://api.deepl.com/v2/translate';

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: `DeepL API error: ${errText}` });
      }

      const data: any = await response.json();
      allTranslated.push(...data.translations.map((t: any) => t.text));
    }

    const keys = Object.keys(flat);
    const translatedFlat: Record<string, string> = {};
    keys.forEach((key, i) => {
      translatedFlat[key] = allTranslated[i] || flat[key];
    });

    const result = unflattenObject(translatedFlat);
    res.json({ translations: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
