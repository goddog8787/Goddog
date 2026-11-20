const PRODUCTION_STORE_API = 'https://goddog.onrender.com';

const CLOUD_RUN_BACKENDS = [
  'https://ais-pre-epkqvggcyqcjwbkc4rilrx-662608706001.asia-northeast1.run.app',
  'https://ais-dev-epkqvggcyqcjwbkc4rilrx-662608706001.asia-northeast1.run.app',
];

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
  const configured = configuredApiBase();
  if (configured) return configured;
  if (typeof window !== 'undefined') {
    try {
      const storedBase = localStorage.getItem('god_dog_ai_base_url');
      if (storedBase && storedBase.trim().startsWith('http')) {
        return storedBase.trim().replace(/\/+$/, '');
      }
    } catch {}
    if (isStaticHostingEnv()) {
      return CLOUD_RUN_BACKENDS[0];
    }
  }
  return '';
}

export function getCandidateApiBases(): string[] {
  const primary = getBackendApiBase();
  if (!isStaticHostingEnv()) {
    return [primary];
  }
  const bases = new Set<string>();
  if (primary) bases.add(primary);
  for (const b of CLOUD_RUN_BACKENDS) {
    bases.add(b);
  }
  return Array.from(bases);
}
