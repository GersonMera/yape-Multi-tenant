import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="glass w-full max-w-md rounded-3xl p-8 border border-white/10 shadow-2xl space-y-8 animate-fade-in-up">
        {/* Encabezado con Logo y Título */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-yape to-yape-light rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-yape/30">
            <span className="text-3xl font-black text-white">Y</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Yape POS SaaS</h1>
          <p className="text-sm text-gray-400">Autenticación Multi-Tenant & Super Admin</p>
        </div>

        {/* Mensaje de Error si falla login */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Formulario de Inicio de Sesión */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ej: admin@yape.com o bodega@prueba.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yape transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yape transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yape to-yape-light hover:from-yape-light hover:to-yape text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-yape/25 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin text-lg">↻</span>
                <span>Iniciando Sesión...</span>
              </>
            ) : (
              <>
                <span>🔐</span>
                <span>Entrar al Sistema</span>
              </>
            )}
          </button>
        </form>

        {/* Accesos Rápidos - Modo Demo */}
        <div className="border-t border-white/10 pt-6 space-y-3">
          <p className="text-xs font-semibold text-center text-gray-400 uppercase tracking-wider">
            ⚡ Accesos Rápidos de Prueba (Modo Demo)
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@yape.com', 'admin123')}
              className="w-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold py-2 px-3 rounded-xl transition-colors flex items-center justify-between"
            >
              <span>👑 Super Administrador (Tú)</span>
              <span className="text-gray-400 font-normal">admin@yape.com</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('bodega@prueba.com', '123456')}
              className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold py-2 px-3 rounded-xl transition-colors flex items-center justify-between"
            >
              <span>🏪 Mi Bodega VIP (Tenant 1)</span>
              <span className="text-gray-400 font-normal">bodega@...</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('farmacia@prueba.com', '123456')}
              className="w-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold py-2 px-3 rounded-xl transition-colors flex items-center justify-between"
            >
              <span>💊 Farmacia VIP 24/7 (Tenant 2)</span>
              <span className="text-gray-400 font-normal">farmacia@...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
