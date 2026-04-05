import { useState, useEffect } from 'react';

const AUTH_KEY = 'fruition_auth';
const ALLOWED_DOMAIN = 'fruitionservices.io';
const PASSWORD = 'Fruition2024!';

export const useAuth = () => {
  const [authState, setAuthState] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        const { email } = JSON.parse(stored);
        setAuthState({ authenticated: true, email });
      } catch {
        setAuthState({ authenticated: false });
      }
    } else {
      setAuthState({ authenticated: false });
    }
  }, []);

  const login = (email, password) => {
    if (!email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)) {
      return { success: false, error: `Access restricted to @${ALLOWED_DOMAIN} accounts.` };
    }
    if (password !== PASSWORD) {
      return { success: false, error: 'Incorrect password.' };
    }
    localStorage.setItem(AUTH_KEY, JSON.stringify({ email }));
    setAuthState({ authenticated: true, email });
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthState({ authenticated: false });
  };

  return { authState, login, logout };
};
