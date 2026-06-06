const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function handleUnauthorized(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('neurolife_access_token');
  window.location.href = '/login';
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string },
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (options?.token) headers.Authorization = `Bearer ${options.token}`;

  const { token: _token, ...fetchOptions } = options ?? {};
  const res = await fetch(`${API_URL}${path}`, { ...fetchOptions, headers });

  if (res.status === 401) {
    handleUnauthorized();
    throw new ApiError(401, 'Unauthorized');
  }
  if (!res.ok) throw new ApiError(res.status, `API error: ${res.status}`);
  return res.json();
}

export function getApiBaseUrl(): string {
  return API_URL;
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new ApiError(401, 'Unauthorized');
  }
  if (!res.ok) throw new ApiError(res.status, `API error: ${res.status}`);
  return res.json();
}
