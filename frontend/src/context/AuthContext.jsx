import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('yape_auth_token') || null);
  const [loading, setLoading] = useState(true);

  // Estado para que el Super Admin pueda inspeccionar la caja de un Tenant en vivo
  const [viewingTenant, setViewingTenant] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem('yape_auth_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/yape/backend/public/api/auth.php?action=me', {
          headers: {
            'X-Auth-Token': storedToken
          }
        });
        const json = await res.json();
        if (json.status === 'success' && json.user) {
          setUser(json.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem('yape_auth_token');
          setUser(null);
          setToken(null);
        }
      } catch (e) {
        console.warn('Error validando sesión:', e);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email, password) => {
    const res = await fetch('/yape/backend/public/api/auth.php?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const json = await res.json();
    if (!res.ok || json.status === 'error') {
      throw new Error(json.message || 'Error al iniciar sesión');
    }

    localStorage.setItem('yape_auth_token', json.token);
    setToken(json.token);
    setUser(json.user);
    setViewingTenant(null);
    return json;
  };

  const logout = () => {
    localStorage.removeItem('yape_auth_token');
    setToken(null);
    setUser(null);
    setViewingTenant(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      viewingTenant,
      setViewingTenant
    }}>
      {children}
    </AuthContext.Provider>
  );
};
