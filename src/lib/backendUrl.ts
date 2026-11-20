const PRODUCTION_STORE_API = 'https://goddog.onrender.com';

export function isStaticHostingEnv(): boolean {
  if (typeof window === 'undefined') return false;
  const host = (window.location.hostname || '').toLowerCase();
  return (
    (host === 'goddog.space' || host.endsWith('.goddog.space')) ||
    host.endsWith('.web.app') ||
    host.endsWith('.firebaseapp.com') ||
    host.endsWith('.github.io') ||
    host.endsWith('.pages.dev')
  );
}

function configuredApiBase(): string {
  const customBase = (import.meta as any).env?.VITE_API_BASE_URL;
  if (customBase && typeof customBase === 'string' && customBase.trim()) {
    return customBase.trim().replace(/\/+$/, '');
  }
  return '';
}

// Checkout and verification always use a deployment-controlled backend.
export function getStoreApiBase(): string {
  return configuredApiBase() || (isStaticHostingEnv() ? PRODUCTION_STORE_API : '');
}

export function getBackendApiBase(): string {
  return getStoreApiBase();
}

export function getCandidateApiBases(): string[] {
  return [getBackendApiBase()];
}
