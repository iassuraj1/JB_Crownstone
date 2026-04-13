import { useCallback } from 'react';

const TOKEN_KEY = 'jbcrownstone_token';
const USER_KEY = 'jbcrownstone_user';

export const useAuth = () => {
  const getToken = useCallback(() => {
    return localStorage.getItem(TOKEN_KEY);
  }, []);

  const getUser = useCallback(() => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }, []);

  const setAuth = useCallback((token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;

    try {
      // Decode JWT payload (base64)
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Check expiry
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        clearAuth();
        return false;
      }
      return true;
    } catch {
      clearAuth();
      return false;
    }
  }, [clearAuth]);

  return { getToken, getUser, setAuth, clearAuth, isAuthenticated };
};

export default useAuth;
