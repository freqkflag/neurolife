import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/** Resolve monorepo root `.env` whether the API runs from repo root or `apps/api`. */
export function resolveEnvFilePaths(): string[] {
  const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../.env'),
    resolve(process.cwd(), '../../.env'),
    resolve(__dirname, '../../../.env'),
    resolve(__dirname, '../../../../.env'),
  ];
  return [...new Set(candidates.filter(existsSync))];
}
