import React, { useState, useEffect } from 'react';
import { IconBuilding, IconShieldCheck, IconAlertCircle } from './Icons';

export const TenantModal = ({ isOpen, onClose, tenant, onUpdateName }) => {
  const [nombre, setNombre] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (tenant) {
      setNombre(tenant.nombre_negocio || '');
    }
  }, [tenant]);

  if (!isOpen || !tenant) return null;

  const webhookUrl = `${window.location.protocol}//${window.location.hostname}/yape/backend/public/index.php`;

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setLoading(true);
    setMessage('');
    setIsError(false);
    try {
      const response = await fetch('/yape/backend/public/api/tenant.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': import.meta.env.VITE_ADMIN_SECRET || 'demo_admin_secret'
        },
        body: JSON.stringify({
          action: 'update',
          nombre_negocio: nombre.trim().slice(0, 100)
        })
      });

      const result = await response.json();
      if (result.status === 'success') {
        setMessage(result.message);
        setIsError(false);
        if (onUpdateName) onUpdateName(result.nombre_negocio);
      } else {
        setMessage('Error: ' + result.message);
        setIsError(true);
      }
    } catch (err) {
      setMessage('Error de conexión al guardar el nombre');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(tenant.api_token || '');
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in-up">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full border border-[#E2E8F0] shadow-xl space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#64748B] hover:text-[#0F172A] transition-colors font-bold"
        >
          ✕
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] flex items-center justify-center text-[#7C3AED] shrink-0">
            <IconBuilding className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">Configuración de Caja & API</h2>
            <p className="text-xs text-[#64748B]">Credenciales institucionales del comercio y seguridad</p>
          </div>
        </div>

        {message && (
          <div className={`text-xs px-4 py-2.5 rounded-xl border flex items-center gap-2 font-semibold ${
            isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            {isError ? <IconAlertCircle className="w-4 h-4 shrink-0" /> : <IconShieldCheck className="w-4 h-4 shrink-0" />}
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSaveName} className="space-y-2">
          <label className="block text-xs font-semibold text-[#334155] uppercase tracking-wider">
            Nombre del Establecimiento (máx. 100 caracteres)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value.slice(0, 100))}
              maxLength={100}
              className="flex-1 saas-input rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-colors"
              placeholder="Ej. Mi Bodega VIP"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#7C3AED] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#6D28D9] transition-colors disabled:opacity-50 text-xs shadow-xs"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>

        <div className="space-y-2 pt-3 border-t border-[#E2E8F0]">
          <label className="block text-xs font-semibold text-[#334155] uppercase tracking-wider">
            API Token Secreto (Header Authorization en MacroDroid / API)
          </label>
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-4 py-2.5">
            <span className="flex-1 font-mono text-xs text-[#0F172A] truncate">
              {showToken ? tenant.api_token : '••••••••••••••••••••••••••••'}
            </span>
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="text-[#64748B] hover:text-[#0F172A] text-xs font-semibold px-2"
            >
              {showToken ? 'Ocultar' : 'Ver'}
            </button>
            <button
              type="button"
              onClick={copyToken}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              {copiedToken ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-[#334155] uppercase tracking-wider">
            Endpoint Webhook para Notificaciones (POST JSON)
          </label>
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-4 py-2.5">
            <span className="flex-1 font-mono text-xs text-[#475569] truncate">
              {webhookUrl}
            </span>
            <button
              type="button"
              onClick={copyUrl}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              {copiedUrl ? 'Copiado' : 'Copiar URL'}
            </button>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#334155] hover:text-[#0F172A] font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors"
          >
            Cerrar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};
