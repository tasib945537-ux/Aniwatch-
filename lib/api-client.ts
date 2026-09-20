const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
const DEFAULT_TIMEOUT_MS = 10000;

export async function apiFetch(path: string, init: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const base = API_BASE_URL.replace(/\/+$/, '');
  const target = /^https?:\/\//i.test(path) ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(target, {...init, signal: controller.signal});
      clearTimeout(timer);
      if (response.ok || response.status < 500 || attempt === 2) return response;
      await new Promise(r => setTimeout(r, 250 * (attempt + 1)));
    } catch (e) {
      clearTimeout(timer); lastError = e;
      if (attempt < 2) await new Promise(r => setTimeout(r, 250 * (attempt + 1)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error('API request failed');
}
