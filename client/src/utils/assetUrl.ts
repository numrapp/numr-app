import { Capacitor } from '@capacitor/core';

// When the app runs natively (Capacitor iOS), `window.location.origin` is
// something like `capacitor://localhost` – not our backend. Static assets
// uploaded to the server (videos, logos, …) live under `/uploads/…` and must
// therefore be rewritten to the public production URL so they can be fetched.
// On the web build, relative paths already resolve against the hosting origin
// so we leave them alone.

export const BACKEND_ORIGIN = 'https://numr-app-production.up.railway.app';

export function assetUrl(path: string | null | undefined): string {
  if (!path) return '';
  // Already absolute – nothing to do.
  if (/^https?:\/\//i.test(path)) return path;
  // Data URI – leave untouched.
  if (path.startsWith('data:')) return path;

  const normalized = path.startsWith('/') ? path : `/${path}`;

  if (Capacitor.isNativePlatform()) {
    return `${BACKEND_ORIGIN}${normalized}`;
  }
  return normalized;
}
