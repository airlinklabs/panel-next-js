import crypto from 'crypto';
import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { URL } from 'url';
import prisma from './prisma';

const SIGNATURE_WINDOW_S = 30;

let cachedScheme: 'http' | 'https' = 'http';
let schemeCachedAt = 0;
const SCHEME_CACHE_TTL_MS = 60_000;

async function refreshSchemeCache(): Promise<void> {
  try {
    const s = await prisma.settings.findUnique({ where: { id: 1 } });
    cachedScheme = (s as any)?.enforceDaemonHttps ? 'https' : 'http';
  } catch {
    // leave existing value
  }
  schemeCachedAt = Date.now();
}

export async function daemonScheme(): Promise<'http' | 'https'> {
  if (Date.now() - schemeCachedAt > SCHEME_CACHE_TTL_MS) {
    await refreshSchemeCache();
  }
  return cachedScheme;
}

export function daemonSchemeSync(): 'http' | 'https' {
  if (Date.now() - schemeCachedAt > SCHEME_CACHE_TTL_MS) {
    // Fire-and-forget refresh — callers that need the accurate value should use daemonScheme()
    // We still return the last known value synchronously; the next call after refresh completes
    // will get the updated scheme. This avoids returning stale 'http' on first boot by
    // eagerly refreshing and updating cachedScheme before the TTL expires.
    refreshSchemeCache();
  }
  return cachedScheme;
}

export function daemonUrl(address: string, port: number): string {
  if (Date.now() - schemeCachedAt > SCHEME_CACHE_TTL_MS) {
    refreshSchemeCache();
  }
  return `${cachedScheme}://${address}:${port}`;
}

function hmacSign(key: string, method: string, path: string, body: string, timestamp: number): string {
  const payload = `${timestamp}:${method.toUpperCase()}:${path}:${body}`;
  return crypto.createHmac('sha256', key).update(payload).digest('hex');
}

let interceptorInstalled = false;

export function installDaemonRequestInterceptor(): void {
  if (interceptorInstalled) return;
  interceptorInstalled = true;

  axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (!config.auth || (config.auth as any).username !== 'Airlink') return config;

    const key = (config.auth as any).password;
    if (!key) return config;

    const method = (config.method || 'GET').toUpperCase();

    let urlPath = '/';
    try {
      const parsed = new URL(config.url || '', 'http://localhost');
      urlPath = parsed.pathname;
    } catch {
      urlPath = (config.url || '/').split('?')[0];
    }

    const body = config.data
      ? typeof config.data === 'string' ? config.data : JSON.stringify(config.data)
      : '';

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = hmacSign(key, method, urlPath, body, timestamp);

    config.headers.set('X-Airlink-Timestamp', String(timestamp));
    config.headers.set('X-Airlink-Signature', signature);

    return config;
  });
}

export async function daemonGet<T = unknown>(
  address: string,
  port: number,
  key: string,
  path: string,
  params?: Record<string, string>
): Promise<T> {
  const base = daemonUrl(address, port);
  const resp = await axios.get<T>(`${base}${path}`, {
    auth: { username: 'Airlink', password: key },
    params,
    timeout: 4000,
  });
  return resp.data;
}

export async function daemonPost<T = unknown>(
  address: string,
  port: number,
  key: string,
  path: string,
  data?: unknown
): Promise<T> {
  const base = daemonUrl(address, port);
  const resp = await axios.post<T>(`${base}${path}`, data, {
    auth: { username: 'Airlink', password: key },
    timeout: 8000,
  });
  return resp.data;
}

export async function checkNodeOnline(address: string, port: number, key: string): Promise<boolean> {
  try {
    const base = daemonUrl(address, port);
    await axios.get(base, {
      auth: { username: 'Airlink', password: key },
      timeout: 3000,
    });
    return true;
  } catch {
    return false;
  }
}

export { SIGNATURE_WINDOW_S };
