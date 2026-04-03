import { useState, useEffect } from 'react';

const AUTH_KEY = 'fruition_auth';
const VALID_DOMAIN = 'fruitionservices.io';
const VALID_PASSWORD = 'Fruition2024!';

export const useAuth = () => {
  const [authState, setAuthState] = useState(null); // null = loading

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check expiry (24 hours)
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          setAuthState({ authenticated: true, email: parsed.email });
          return;
        }
      }
    } catch (_) {}
    setAuthState({ authenticated: false });
  }, []);

  const login = (email, password) => {
    const emailLower = email.toLowerCase().trim();
    const domain = emailLower.split('@')[1];

    if (domain !== VALID_DOMAIN) {
      return { success: false, error: `Access restricted to @${VALID_DOMAIN} accounts.` };
    }
    if (password !== VALID_PASSWORD) {
      return { success: false, error: 'Incorrect password.' };
    }

    const session = {
      email: emailLower,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    setAuthState({ authenticated: true, email: emailLower });
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthState({ authenticated: false });
  };

  return { authState, login, logout };
};
