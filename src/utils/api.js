const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiGet(path) {
  if (!BASE_URL) throw new Error("Missing VITE_API_BASE_URL in .env.local");

  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}
