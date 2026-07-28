import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const SuperAdminDashboard = () => {
  const { user, token, logout, setViewingTenant } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulario de Nueva Tienda
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPass, setFormPass] = useState('123456');
  const [formCorreoYape, setFormCorreoYape] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await fetch('/yape/backend/public/api/admin.php?action=list_tenants', {
        headers: { 'X-Auth-Token': token }
      });
      const json = await res.json();
      if (json.status === 'success') {
        setTenants(json.data || []);
      }
    } catch (e) {
      console.error('Error cargando tiendas:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [token]);

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/yape/backend/public/api/admin.php?action=create_tenant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          nombre_negocio: formName,
          email: formEmail,
          password: formPass,
          correo_recepcion_yape: formCorreoYape
        })
      });
      const json = await res.json();
      if (!res.ok || json.status === 'error') {
        throw new Error(json.message || 'Error creando comercio');
      }
      setIsModalOpen(false);
      setFormName('');
      setFormEmail('');
      setFormCorreoYape('');
      fetchTenants();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (tenantId, currentStatus) => {
    const newStatus = currentStatus === 'Activo' ? 'Suspendido' : 'Activo';
    try {
      await fetch('/yape/backend/public/api/admin.php?action=toggle_status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({ tenant_id: tenantId, new_status: newStatus })
      });
      fetchTenants();
    } catch (e) {
      console.error('Error al cambiar estado:', e);
    }
  };

  const totalStores = tenants.length;
  const activeStores = tenants.filter(t => t.estado === 'Activo').length;
  const totalVolume = tenants.reduce((acc, t) => acc + (parseFloat(t.total_real) || 0), 0);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8 animate-fade-in-up">
      {/* Barra superior del Super Admin estilo Vercel / Linear */}
      <header className="flex flex-wrap items-center justify-between gap-6 glass rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/40 text-2xl glow-yape">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Panel Super Admin SaaS</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                SaaS Owner
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 font-medium">Sesión activa: <span className="text-gray-300 font-mono">{user?.email}</span> — Control multi-comercio</p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>➕</span> Registrar Comercio
          </button>

          <button
            onClick={logout}
            className="bg-white/[0.06] hover:bg-red-500/20 hover:text-red-300 text-gray-300 border border-white/10 text-xs font-semibold px-4 py-3 rounded-xl transition-all flex items-center gap-2"
          >
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </header>

      {/* KPI Cards de alta jerarquía tipográfica */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card rounded-3xl p-6 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tiendas Registradas</p>
            <p className="text-3xl font-mono font-black text-white mt-1.5">{totalStores}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl">
            🏪
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Comercios Activos</p>
            <p className="text-3xl font-mono font-black text-emerald-300 mt-1.5">{activeStores}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl">
            🟢
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Volumen Real SaaS</p>
            <p className="text-3xl font-mono font-black text-white mt-1.5">S/ {totalVolume.toFixed(2)}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl">
            💰
          </div>
        </div>
      </div>

      {/* Tabla Oficial de Tenants Estilo Stripe / Linear */}
      <section className="glass rounded-3xl p-7 border border-white/10 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📋</span> Directorio de Comercios en la Plataforma
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Audita cajas en tiempo real o administra el estado de los clientes</p>
          </div>
          <button
            onClick={fetchTenants}
            className="text-xs font-semibold text-gray-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] px-3.5 py-2 rounded-xl border border-white/10 transition-colors flex items-center gap-2"
          >
            <span>↻</span> Actualizar Lista
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400 font-medium">Cargando comercios registrados...</div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No hay tiendas registradas aún en el sistema.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Comercio</th>
                  <th className="py-3.5 px-4">Correo</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Recaudado (Real)</th>
                  <th className="py-3.5 px-4 text-center">Auditoría / Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.04] transition-colors group">
                    <td className="py-4 px-4 font-mono text-xs text-gray-500">#{t.id}</td>
                    <td className="py-4 px-4 font-bold text-white group-hover:text-purple-300 transition-colors">{t.nombre_negocio}</td>
                    <td className="py-4 px-4 text-gray-400 font-mono text-xs">{t.email}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border ${
                        t.estado === 'Activo' 
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                          : 'bg-red-500/15 text-red-300 border-red-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${t.estado === 'Activo' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                        {t.estado}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-white text-base">
                      S/ {parseFloat(t.total_real || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-center space-x-2">
                      <button
                        onClick={() => setViewingTenant(t)}
                        className="bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5 hover:shadow-lg hover:shadow-purple-500/25"
                        title="Ver y Auditar la Caja en vivo"
                      >
                        <span>👀</span> Auditar Caja
                      </button>

                      <button
                        onClick={() => handleToggleStatus(t.id, t.estado)}
                        className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all ${
                          t.estado === 'Activo'
                            ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {t.estado === 'Activo' ? '⏸️ Suspender' : '▶️ Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal Nueva Tienda Estilo Vercel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
          <div className="glass w-full max-w-md rounded-3xl p-7 border border-white/20 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>➕</span> Dar de Alta Nuevo Comercio
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Genera acceso y token de API para la tienda</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-3.5 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-300 uppercase block mb-1">Nombre de la Tienda</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="ej: Super Bodega Central"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-300 uppercase block mb-1">Correo de Acceso (Login)</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ej: tienda@comercio.com"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-300 uppercase block mb-1">Contraseña Inicial</label>
                <input
                  type="text"
                  required
                  value={formPass}
                  onChange={(e) => setFormPass(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-300 uppercase block mb-1">Correo Notificación Yape (Opcional)</label>
                <input
                  type="email"
                  value={formCorreoYape}
                  onChange={(e) => setFormCorreoYape(e.target.value)}
                  placeholder="ej: pagos@comercio.com"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all"
                >
                  {creating ? 'Creando...' : 'Registrar Comercio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
