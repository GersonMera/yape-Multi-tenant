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
    <div className="min-h-screen bg-[#170A24] flex items-center justify-center p-4 selection:bg-purple-500 selection:text-white">
      <div className="w-full max-w-md saas-card rounded-3xl p-8 sm:p-10 space-y-8 animate-fade-in-up border border-purple-500/35 bg-gradient-to-br from-[#2D1546]/95 to-[#1D0D2E]/95 shadow-2xl shadow-purple-950/80">
        {/* Encabezado Corporativo Yape Royal */}
        <div className="space-y-3 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-[#8B2FE5] to-[#661DAB] rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-purple-600/40 border border-purple-400/30 mx-auto">
            Y
          </div>
          <div>
            <span className="yape-badge-verified px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#00E3A5] animate-pulse"></span>
              <span>SISTEMA OFICIAL DE CONTROL</span>
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Yape POS Command</h1>
            <p className="text-xs text-purple-300/80 mt-1">Portal interbancario de recepción y auditoría de cobros</p>
          </div>
        </div>

        {/* Banner de error sobrio */}
        {error && (
          <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-xs p-3.5 rounded-xl flex items-center gap-2.5 font-medium">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Formulario de Acceso */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yape.com o bodega@prueba.com"
              className="w-full saas-input rounded-xl px-4 py-3 text-sm font-mono placeholder:text-purple-300/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full saas-input rounded-xl px-4 py-3 text-sm font-mono placeholder:text-purple-300/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#8B2FE5] to-[#661DAB] hover:from-[#9B42FF] hover:to-[#7B24CC] text-white font-extrabold py-3.5 px-4 rounded-xl transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/40 border border-purple-400/30 uppercase tracking-wider mt-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">↻</span>
                <span>Verificando Credenciales...</span>
              </>
            ) : (
              <>
                <span>🔐</span>
                <span>Ingresar al Sistema Yape</span>
              </>
            )}
          </button>
        </form>

        {/* Cuentas Demo en formato corporativo de marca */}
        <div className="border-t border-purple-500/25 pt-6 space-y-3">
          <p className="text-[10px] font-black text-purple-300/60 uppercase tracking-widest text-center">
            Cuentas de Demostración Rápida
          </p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@yape.com', 'admin123')}
              className="w-full bg-[#24113A]/70 hover:bg-[#321750] border border-purple-500/30 text-purple-200 hover:text-white text-xs font-semibold py-2.5 px-3.5 rounded-xl transition-all flex items-center justify-between shadow-sm"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8B2FE5]"></span>
                <span>Super Administrador (Dueño SaaS)</span>
              </span>
              <span className="font-mono text-purple-300 text-[11px]">admin@yape.com</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('bodega@prueba.com', '123456')}
              className="w-full bg-[#24113A]/70 hover:bg-[#321750] border border-purple-500/30 text-purple-200 hover:text-white text-xs font-semibold py-2.5 px-3.5 rounded-xl transition-all flex items-center justify-between shadow-sm"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00E3A5]"></span>
                <span>Mi Bodega VIP (Sucursal 1)</span>
              </span>
              <span className="font-mono text-purple-300 text-[11px]">bodega@...</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('farmacia@prueba.com', '123456')}
              className="w-full bg-[#24113A]/70 hover:bg-[#321750] border border-purple-500/30 text-purple-200 hover:text-white text-xs font-semibold py-2.5 px-3.5 rounded-xl transition-all flex items-center justify-between shadow-sm"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Farmacia VIP 24/7 (Sucursal 2)</span>
              </span>
              <span className="font-mono text-purple-300 text-[11px]">farmacia@...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
