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
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8 animate-fade-in">
      {/* Barra superior del Super Admin */}
      <header className="flex flex-wrap items-center justify-between gap-4 glass rounded-3xl p-6 border border-white/10 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 text-2xl">
            👑
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Panel Super Admin SaaS</h1>
            <p className="text-xs text-gray-400">Sesión: {user?.email} — Control Total de Tiendas</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <span>➕</span> Nueva Tienda (Tenant)
          </button>

          <button
            onClick={logout}
            className="bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-gray-300 border border-white/10 text-xs font-semibold px-4 py-3 rounded-xl transition-all flex items-center gap-2"
          >
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </header>

      {/* KPI Cards del SaaS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tiendas Registradas</p>
            <p className="text-3xl font-black text-white mt-1">{totalStores}</p>
          </div>
          <span className="text-4xl">🏪</span>
        </div>

        <div className="glass rounded-2xl p-5 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Tiendas Activas</p>
            <p className="text-3xl font-black text-emerald-300 mt-1">{activeStores}</p>
          </div>
          <span className="text-4xl">🟢</span>
        </div>

        <div className="glass rounded-2xl p-5 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-yape-light uppercase tracking-wider">Volumen Real Plataforma</p>
            <p className="text-3xl font-black text-white mt-1">S/ {totalVolume.toFixed(2)}</p>
          </div>
          <span className="text-4xl">💰</span>
        </div>
      </div>

      {/* Tabla de Comercios / Tenants */}
      <section className="glass rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📋</span> Listado Oficial de Comercios (Tenants)
          </h2>
          <button
            onClick={fetchTenants}
            className="text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-colors"
          >
            ↻ Actualizar Tabla
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Cargando tiendas...</div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No hay tiendas registradas aún.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Comercio</th>
                  <th className="py-3 px-4">Correo</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Recaudado (Real)</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-mono text-xs text-gray-400">#{t.id}</td>
                    <td className="py-4 px-4 font-bold text-white">{t.nombre_negocio}</td>
                    <td className="py-4 px-4 text-gray-300">{t.email}</td>
                    <td className="py-4 px-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        t.estado === 'Activo' 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                          : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}>
                        {t.estado}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-yape-light">
                      S/ {parseFloat(t.total_real || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-center space-x-2">
                      <button
                        onClick={() => setViewingTenant(t)}
                        className="bg-yape/30 hover:bg-yape text-yape-light hover:text-white border border-yape/40 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1"
                        title="Ver y Auditar la Caja en vivo"
                      >
                        <span>👀</span> Ver Caja
                      </button>

                      <button
                        onClick={() => handleToggleStatus(t.id, t.estado)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                          t.estado === 'Activo'
                            ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30'
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

      {/* Modal Nueva Tienda */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass w-full max-w-md rounded-3xl p-6 border border-white/20 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>➕</span> Crear Nueva Tienda
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-lg">✕</button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-3 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase block mb-1">Nombre de la Tienda</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="ej: Super Bodega Central"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase block mb-1">Correo de Acceso (Login)</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ej: tienda@comercio.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase block mb-1">Contraseña Inicial</label>
                <input
                  type="text"
                  required
                  value={formPass}
                  onChange={(e) => setFormPass(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase block mb-1">Correo Notificación Yape (Opcional)</label>
                <input
                  type="email"
                  value={formCorreoYape}
                  onChange={(e) => setFormCorreoYape(e.target.value)}
                  placeholder="ej: pagos@comercio.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-xl text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 rounded-xl text-sm shadow-lg disabled:opacity-50"
                >
                  {creating ? 'Creando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
