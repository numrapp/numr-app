"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../database");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
function flattenObject(obj, prefix = '') {
    const result = {};
    for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            Object.assign(result, flattenObject(obj[key], fullKey));
        }
        else {
            result[fullKey] = String(obj[key]);
        }
    }
    return result;
}
function unflattenObject(flat) {
    const result = {};
    for (const [key, value] of Object.entries(flat)) {
        const parts = key.split('.');
        let current = result;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]])
                current[parts[i]] = {};
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
    }
    return result;
}
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { translations, targetLang } = req.body;
        if (!translations || !targetLang) {
            return res.status(400).json({ error: 'translations and targetLang are required' });
        }
        const user = (0, database_1.queryOne)('SELECT deepl_api_key FROM users WHERE id = ?', [req.userId]);
        const apiKey = user?.deepl_api_key;
        if (!apiKey) {
            return res.status(400).json({ error: 'DeepL API key not configured. Go to Settings -> Translation.' });
        }
        const flat = flattenObject(translations);
        const texts = Object.values(flat);
        const batchSize = 50;
        const allTranslated = [];
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
            const data = await response.json();
            allTranslated.push(...data.translations.map((t) => t.text));
        }
        const keys = Object.keys(flat);
        const translatedFlat = {};
        keys.forEach((key, i) => {
            translatedFlat[key] = allTranslated[i] || flat[key];
        });
        const result = unflattenObject(translatedFlat);
        res.json({ translations: result });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=translateRoutes.js.map