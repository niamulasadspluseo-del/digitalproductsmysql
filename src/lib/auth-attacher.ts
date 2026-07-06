import { createMiddleware } from '@tanstack/react-start';
import { getToken } from '@/lib/store';

export const attachAuth = createMiddleware({ type: 'function' }).client(
  async ({ next }) => {
    const token = getToken();
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
