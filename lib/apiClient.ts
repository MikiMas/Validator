const API_BASE = (process.env.NEXT_PUBLIC_BUFFLAUNCH_API_URL || "").trim().replace(/\/+$/, "");

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE) return normalizedPath;
  return `${API_BASE}${normalizedPath}`;
}
