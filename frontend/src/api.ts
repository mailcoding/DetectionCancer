// frontend/src/api.ts

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  auth: boolean = true
): Promise<T> {
  let headers: Record<string, string> = {};
  // Ajout du token si besoin
  if (auth) {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  // Si le body est FormData, ne pas mettre Content-Type
  const isFormData = options.body && typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.headers) {
    headers = { ...headers, ...(options.headers as Record<string, string>) };
  }
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function getApiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}
