export interface StoredAuthSession {
  email: string;
  accessToken: string;
  googleId: string;
  userId: string;
  savedAt: number;
}

const STORAGE_KEY = 'rc_enc_auth';
const SALT = 'stack-box-auth-v1';

const WS_STORAGE_KEY = 'sb_enc_ws_v1';
const WS_SALT = 'stack-box-ws-v1';

/** WSS URL cache TTL — sau 2h tự fetch lại */
export const WS_URL_TTL_MS = 2 * 60 * 60 * 1000;

export interface StoredWsEndpoint {
  url: string;
  googleId: string;
  savedAt: number;
}

async function deriveKey(salt: string): Promise<CryptoKey> {
  const pepper =
    (import.meta.env.VITE_AUTH_SECRET as string | undefined) ||
    `${window.location.origin}:stack-box`;
  const material = new TextEncoder().encode(pepper);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    material,
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(salt),
      iterations: 100_000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function encryptJson(salt: string, storageKey: string, data: unknown): Promise<void> {
  const key = await deriveKey(salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const payload = new TextEncoder().encode(JSON.stringify(data));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, payload);
  const blob = new Uint8Array(iv.length + encrypted.byteLength);
  blob.set(iv, 0);
  blob.set(new Uint8Array(encrypted), iv.length);
  localStorage.setItem(storageKey, toBase64(blob));
}

async function decryptJson<T>(salt: string, storageKey: string): Promise<T | null> {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;
  try {
    const key = await deriveKey(salt);
    const blob = fromBase64(raw);
    const iv = blob.slice(0, 12);
    const data = blob.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return JSON.parse(new TextDecoder().decode(decrypted)) as T;
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
}

export async function saveAuthSession(session: StoredAuthSession): Promise<void> {
  await encryptJson(SALT, STORAGE_KEY, session);
}

export async function saveWsEndpoint(entry: StoredWsEndpoint): Promise<void> {
  await encryptJson(WS_SALT, WS_STORAGE_KEY, entry);
}

export async function loadWsEndpoint(googleId: string): Promise<StoredWsEndpoint | null> {
  const entry = await decryptJson<StoredWsEndpoint>(WS_SALT, WS_STORAGE_KEY);
  if (!entry?.url || !entry.googleId || entry.googleId !== googleId) return null;
  return entry;
}

export function isWsEndpointFresh(entry: StoredWsEndpoint, now = Date.now()): boolean {
  return now - entry.savedAt < WS_URL_TTL_MS;
}

export function clearWsEndpoint(): void {
  localStorage.removeItem(WS_STORAGE_KEY);
}

export async function loadAuthSession(): Promise<StoredAuthSession | null> {
  const session = await decryptJson<StoredAuthSession>(SALT, STORAGE_KEY);
  if (!session?.email || !session.accessToken || !session.googleId) {
    return null;
  }
  return session;
}

export function clearAuthSession(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('LocalEmail');
  localStorage.removeItem('AccessToken');
  localStorage.removeItem('GoogleId');
  localStorage.removeItem('UserId');
  clearWsEndpoint();
}
