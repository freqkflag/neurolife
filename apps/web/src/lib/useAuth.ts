'use client';

import { useEffect, useState } from 'react';
import { getAccessToken } from './auth';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setToken(getAccessToken());
    setReady(true);
  }, []);

  return { token, ready, isAuthenticated: Boolean(token) };
}
