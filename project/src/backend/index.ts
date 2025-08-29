import { Backend } from './Backend';
import { createLocalBackend } from './localBackend';

let backend: Backend | null = null;

type ImportMetaEnv = { VITE_BACKEND?: string };

export function getBackend(): Backend {
  if (backend) return backend;
  const env = (import.meta as unknown as { env?: ImportMetaEnv }).env;
  const mode = env?.VITE_BACKEND || 'local';
  switch (mode) {
    case 'local':
    default:
      backend = createLocalBackend();
      return backend;
  }
}


