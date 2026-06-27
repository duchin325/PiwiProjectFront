const GLOBAL_USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

export const resolveMockMode = (moduleValue: string | undefined) => {
  if (moduleValue === 'true') return true;
  if (moduleValue === 'false') return false;
  return GLOBAL_USE_MOCK;
};

export const logMockFallback = (message: string, error: unknown) => {
  if (process.env.NODE_ENV !== 'development') return;
  console.warn(`${message}. Usando datos mock.`, error);
};

// NEXT_PUBLIC_API_URL queda como alias por compatibilidad con .env.local existentes.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001';

export async function fetchJson<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...init?.headers,
    },
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `Error ${response.status} en ${path}: ${text || response.statusText}`
    );
  }

  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    // Algunos endpoints responden texto plano (ej. "Actualizado") en vez de JSON.
    return text as unknown as T;
  }
}
