import React, { useState, useEffect } from 'react';

export const TenantModal = ({ isOpen, onClose, tenant, onUpdateName }) => {
  const [nombre, setNombre] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
        setMessage('✅ ' + result.message);
        if (onUpdateName) onUpdateName(result.nombre_negocio);
      } else {
        setMessage('❌ Error: ' + result.message);
      }
    } catch (err) {
      setMessage('❌ Error de conexión al guardar el nombre');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, setCopiedState) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in-up">
      <div className="glass rounded-3xl p-8 max-w-lg w-full border border-white/20 shadow-2xl space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yape/30 flex items-center justify-center text-yape-light text-xl">
            🏢
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Configuración de Caja</h2>
            <p className="text-xs text-gray-400">Credenciales del comercio y seguridad</p>
          </div>
        </div>

        {message && (
          <div className="text-sm px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-200">
            {message}
          </div>
        )}

        <form onSubmit={handleSaveName} className="space-y-2">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Nombre de la Bodega / Local (máx. 100 caracteres)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value.slice(0, 100))}
              maxLength={100}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yape transition-colors text-sm"
              placeholder="Ej. Mi Bodega Prueba"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-yape to-yape-light text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm shadow-md"
            >
              {loading ? '...' : 'Guardar'}
            </button>
          </div>
        </form>

        <div className="space-y-2 pt-2 border-t border-white/10">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
            API Token Secreto (Header Authorization en MacroDroid)
          </label>
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5">
            <span className="flex-1 font-mono text-sm text-amber-300 truncate">
              {showToken ? tenant.api_token : '••••••••••••••••••••••••••••'}
            </span>
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="text-gray-400 hover:text-white text-xs px-2"
            >
              {showToken ? 'Ocultar' : 'Ver'}
            </button>
            <button
              type="button"
              onClick={() => copyToClipboard(`Bearer ${tenant.api_token}`, setCopiedToken)}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              {copiedToken ? '¡Copiado!' : '📋 Copiar Bearer'}
            </button>
          </div>
          <p className="text-[11px] text-gray-400">
            Pega este valor en el Header HTTP de MacroDroid como: <code className="text-gray-300">Bearer {showToken ? tenant.api_token : 'tu_token'}</code>
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-white/10">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
            URL del Webhook para MacroDroid
          </label>
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5">
            <span className="flex-1 font-mono text-xs text-gray-300 truncate">
              {webhookUrl}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(webhookUrl, setCopiedUrl)}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              {copiedUrl ? '¡Copiado!' : '📋 Copiar URL'}
            </button>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
