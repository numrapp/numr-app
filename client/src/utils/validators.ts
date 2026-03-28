export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) return 'email_required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'email_invalid';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'password_required';
  if (password.length < 6) return 'password_min';
  return null;
}

export function validateKVK(kvk: string): string | null {
  if (!kvk || !kvk.trim()) return 'kvk_required';
  if (!/^\d{8}$/.test(kvk.trim())) return 'kvk_invalid';
  return null;
}

export function validateBTW(btw: string): string | null {
  if (!btw || !btw.trim()) return 'btw_required';
  if (!/^NL\d{9}B\d{2}$/.test(btw.trim())) return 'btw_invalid';
  return null;
}

export function validateKVKBTWMatch(kvk: string, btw: string): string | null {
  if (!kvk || !btw) return null;
  const kvkClean = kvk.trim();
  const btwClean = btw.trim();
  if (!/^\d{8}$/.test(kvkClean) || !/^NL\d{9}B\d{2}$/.test(btwClean)) return null;
  const btwDigits = btwClean.slice(2, 11);
  if (!btwDigits.startsWith(kvkClean)) return 'kvk_btw_mismatch';
  return null;
}

export function validateIBAN(iban: string): string | null {
  if (!iban || !iban.trim()) return 'iban_required';
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/.test(cleaned)) return 'iban_invalid';
  return null;
}

export function validateRequired(value: string): string | null {
  if (!value || !value.trim()) return 'field_required';
  return null;
}
