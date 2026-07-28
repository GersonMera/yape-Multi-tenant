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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Esferas de luz ambiental de fondo */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="glass w-full max-w-md rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl space-y-8 animate-fade-in-up relative z-10">
        {/* Encabezado con Logo Vibrante y Jerarquía Premium */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/40 glow-yape transform transition-transform duration-300 hover:scale-105">
            <span className="text-3xl font-black text-white tracking-wider">Y</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Yape POS SaaS</h1>
            <p className="text-xs text-gray-400 mt-1 font-medium">Plataforma de Autenticación & Control Multi-Tenant</p>
          </div>
        </div>

        {/* Banner de Error Estilo Vercel */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs p-3.5 rounded-2xl flex items-center gap-3 animate-scale-up">
            <span className="text-base">⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Formulario Estilizado con Foco Luminous */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ej: admin@yape.com o bodega@prueba.com"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-purple-500/30 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <>
                <span className="animate-spin text-lg">↻</span>
                <span>Iniciando Sesión...</span>
              </>
            ) : (
              <>
                <span>🔐</span>
                <span>Entrar a la Plataforma</span>
              </>
            )}
          </button>
        </form>

        {/* Tarjetas Interactivas - Modo Demo */}
        <div className="border-t border-white/10 pt-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              ⚡ Accesos de Prueba (Demo)
            </span>
            <span className="text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full font-semibold">
              Clic para rellenar
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              type="button"
              onClick={() => fillDemo('admin@yape.com', 'admin123')}
              className="w-full group bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 text-purple-200 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-between hover:scale-[1.01] active:scale-[0.99]"
            >
              <span className="flex items-center gap-2 font-bold">
                <span className="text-base">👑</span>
                <span>Super Administrador (SaaS Owner)</span>
              </span>
              <span className="text-gray-400 font-mono text-[11px] group-hover:text-purple-300 transition-colors">admin@yape.com</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('bodega@prueba.com', '123456')}
              className="w-full group bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-200 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-between hover:scale-[1.01] active:scale-[0.99]"
            >
              <span className="flex items-center gap-2 font-bold">
                <span className="text-base">🏪</span>
                <span>Mi Bodega VIP (Cliente 1)</span>
              </span>
              <span className="text-gray-400 font-mono text-[11px] group-hover:text-emerald-300 transition-colors">bodega@...</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('farmacia@prueba.com', '123456')}
              className="w-full group bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 hover:border-sky-500/40 text-sky-200 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-between hover:scale-[1.01] active:scale-[0.99]"
            >
              <span className="flex items-center gap-2 font-bold">
                <span className="text-base">💊</span>
                <span>Farmacia VIP 24/7 (Cliente 2)</span>
              </span>
              <span className="text-gray-400 font-mono text-[11px] group-hover:text-sky-300 transition-colors">farmacia@...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
