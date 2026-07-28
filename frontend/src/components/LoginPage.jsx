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
    <div className="min-h-screen bg-[#08090E] flex items-center justify-center p-4">
      <div className="w-full max-w-md saas-card rounded-2xl p-8 sm:p-10 space-y-8 animate-fade-in-up">
        {/* Encabezado sobrio y empresarial */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#8B5CF6] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
              Y
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Yape POS SaaS</h1>
              <p className="text-xs text-gray-400">Portal de Acceso Empresarial</p>
            </div>
          </div>
        </div>

        {/* Banner de error sobrio */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs p-3.5 rounded-xl flex items-center gap-2.5">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Formulario minimalista */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 block">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yape.com o bodega@prueba.com"
              className="w-full saas-input rounded-xl px-4 py-2.5 text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 block">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full saas-input rounded-xl px-4 py-2.5 text-sm font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold py-3 px-4 rounded-xl transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm mt-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">↻</span>
                <span>Iniciando Sesión...</span>
              </>
            ) : (
              <span>Entrar al Sistema</span>
            )}
          </button>
        </form>

        {/* Cuentas Demo en formato sobrio monocromático */}
        <div className="border-t border-[#1C1E2D] pt-6 space-y-3">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Cuentas de Demostración Rápida
          </p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@yape.com', 'admin123')}
              className="w-full bg-[#11121B] hover:bg-[#161824] border border-[#1F2133] text-gray-300 hover:text-white text-xs font-medium py-2.5 px-3.5 rounded-xl transition-all flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>Super Administrador (SaaS Owner)</span>
              </span>
              <span className="font-mono text-gray-500 text-[11px]">admin@yape.com</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('bodega@prueba.com', '123456')}
              className="w-full bg-[#11121B] hover:bg-[#161824] border border-[#1F2133] text-gray-300 hover:text-white text-xs font-medium py-2.5 px-3.5 rounded-xl transition-all flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Mi Bodega VIP (Comercio 1)</span>
              </span>
              <span className="font-mono text-gray-500 text-[11px]">bodega@...</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('farmacia@prueba.com', '123456')}
              className="w-full bg-[#11121B] hover:bg-[#161824] border border-[#1F2133] text-gray-300 hover:text-white text-xs font-medium py-2.5 px-3.5 rounded-xl transition-all flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Farmacia VIP 24/7 (Comercio 2)</span>
              </span>
              <span className="font-mono text-gray-500 text-[11px]">farmacia@...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
