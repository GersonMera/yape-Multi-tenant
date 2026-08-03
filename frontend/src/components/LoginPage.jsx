import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { IconAlertCircle } from './Icons';

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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md saas-card rounded-2xl p-8 sm:p-10 space-y-8 animate-fade-in-up">
        {/* Encabezado Minimalista Empresarial */}
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-[#7C3AED] rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-sm mx-auto">
            Y
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight mt-3">Yape POS Control</h1>
            <p className="text-xs text-[#64748B] mt-1">Acceso institucional para monitoreo de cobros</p>
          </div>
        </div>

        {/* Banner de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-center gap-2.5 font-medium">
            <IconAlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario de Acceso */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#334155] block">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yape.com o bodega@prueba.com"
              className="w-full saas-input rounded-xl px-4 py-2.5 text-sm font-mono placeholder:text-[#94A3B8]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#334155] block">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full saas-input rounded-xl px-4 py-2.5 text-sm font-mono placeholder:text-[#94A3B8]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold py-3 px-4 rounded-xl transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm mt-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">↻</span>
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <span>Ingresar al Panel</span>
              </>
            )}
          </button>
        </form>

        {/* Cuentas Demo — solo visibles en modo demo */}
        {import.meta.env.VITE_MODE === 'demo' && (
          <div className="border-t border-[#E2E8F0] pt-6 space-y-3">
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">
              Cuentas de Demostración Rápida
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillDemo('admin@yape.com', 'admin123')}
                className="w-full bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#334155] hover:text-[#0F172A] text-xs font-medium py-2.5 px-3.5 rounded-xl transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#7C3AED]"></span>
                  <span>Super Administrador (SaaS Owner)</span>
                </span>
                <span className="font-mono text-[#64748B] text-[11px]">admin@yape.com</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('bodega@prueba.com', '123456')}
                className="w-full bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#334155] hover:text-[#0F172A] text-xs font-medium py-2.5 px-3.5 rounded-xl transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                  <span>Mi Bodega VIP (Sucursal 1)</span>
                </span>
                <span className="font-mono text-[#64748B] text-[11px]">bodega@...</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('farmacia@prueba.com', '123456')}
                className="w-full bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#334155] hover:text-[#0F172A] text-xs font-medium py-2.5 px-3.5 rounded-xl transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span>
                  <span>Farmacia VIP 24/7 (Sucursal 2)</span>
                </span>
                <span className="font-mono text-[#64748B] text-[11px]">farmacia@...</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
