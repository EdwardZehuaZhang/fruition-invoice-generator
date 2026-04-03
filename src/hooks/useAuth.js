import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ALLOWED_DOMAIN = 'fruitionservices.io';

const validateDomain = (email) => {
  if (!email) return false;
  return email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);
};

export const useAuth = () => {
  const [authState, setAuthState] = useState(null); // null = loading

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const email = session.user?.email;
        if (!validateDomain(email)) {
          // Wrong domain — sign out immediately
          supabase.auth.signOut();
          setAuthState({ authenticated: false, error: `Access restricted to @${ALLOWED_DOMAIN} accounts. You signed in with ${email}.` });
        } else {
          setAuthState({ authenticated: true, email });
        }
      } else {
        setAuthState({ authenticated: false });
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const email = session.user?.email;
        if (!validateDomain(email)) {
          supabase.auth.signOut();
          setAuthState({ authenticated: false, error: `Access restricted to @${ALLOWED_DOMAIN} accounts. You signed in with ${email}.` });
        } else {
          setAuthState({ authenticated: true, email });
        }
      } else {
        setAuthState((prev) => ({
          authenticated: false,
          error: prev?.error // preserve domain error if present
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = () => {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          hd: ALLOWED_DOMAIN, // hint Google to show only fruitionservices.io accounts
        },
      },
    });
  };

  const logout = () => {
    return supabase.auth.signOut();
  };

  return { authState, login, logout };
};
