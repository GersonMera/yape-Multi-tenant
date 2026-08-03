import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const SuperAdminDashboard = () => {
  const { user, token, logout, setViewingTenant } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // general | comercios

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
    <div className="min-h-screen bg-[#170A24] flex flex-col md:flex-row text-gray-100 selection:bg-purple-500 selection:text-white">
      {/* SIDEBAR CORPORATIVO YAPE COMMAND CENTER */}
      <aside className="w-full md:w-64 saas-sidebar flex flex-col justify-between border-b md:border-b-0 md:border-r border-purple-500/25 p-5 shrink-0">
        <div className="space-y-7">
          {/* Brand */}
          <div className="flex items-center gap-3.5 px-2">
            <div className="w-11 h-11 bg-gradient-to-br from-[#8B2FE5] to-[#661DAB] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-600/40 border border-purple-400/30">
              Y
            </div>
            <div>
              <span className="font-extrabold text-white tracking-tight block text-sm">Yape POS SaaS</span>
              <span className="text-[10px] text-[#00E3A5] font-mono font-bold uppercase tracking-widest block mt-0.5">
                👑 SUPER ADMIN
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">Navegación Principal</p>
            
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'general'
                  ? 'bg-[#8B5CF6] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-[#12141F]'
              }`}
            >
              <span>📊</span>
              <span>Vista General</span>
            </button>

            <button
              onClick={() => setActiveTab('comercios')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'comercios'
                  ? 'bg-[#8B5CF6] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-[#12141F]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span>🏪</span>
                <span>Directorio de Tiendas</span>
              </div>
              <span className="bg-white/10 px-2 py-0.5 rounded-md text-[10px]">{totalStores}</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#12141F] transition-all"
            >
              <span>➕</span>
              <span>Alta de Comercio</span>
            </button>
          </nav>
        </div>

        {/* Perfil del Usuario en Sidebar */}
        <div className="pt-6 border-t border-[#171926] mt-6 space-y-3">
          <div className="px-2">
            <p className="text-xs font-bold text-white truncate">{user?.email}</p>
            <p className="text-[10px] text-purple-400 font-mono">Rol: SaaS Owner</p>
          </div>

          <button
            onClick={logout}
            className="w-full bg-[#11121C] hover:bg-red-500/10 hover:text-red-400 text-gray-400 border border-[#1D2030] text-xs font-medium py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DE CONTENIDO A PANTALLA COMPLETA */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Topbar Sobrio */}
        <header className="h-16 border-b border-[#171926] px-6 sm:px-8 flex items-center justify-between bg-[#0A0B12]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-400">Panel Administrativo</span>
            <span className="text-gray-600">/</span>
            <span className="text-xs font-bold text-white capitalize">{activeTab === 'general' ? 'Vista General & KPIs' : 'Gestión de Tiendas'}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <span>➕</span>
              <span>Registrar Tienda</span>
            </button>
          </div>
        </header>

        {/* Contenido Adaptable */}
        <div className="flex-1 p-6 sm:p-10 space-y-8 max-w-7xl w-full mx-auto">
          {/* Banner de Estado del SaaS */}
          <div className="saas-card rounded-2xl p-6 sm:p-8 border border-[#1E2030] flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Estado Operativo de la Plataforma
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Monitoreo consolidado de cobros validados y comercios activos
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3.5 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Sistemas Yape POS en Línea
              </span>
            </div>
          </div>

          {/* Tarjetas KPI Monocromáticas de Alta Densidad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="saas-card-hover rounded-2xl p-6 border border-[#1E2030] space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tiendas Registradas</p>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-mono font-bold text-white">{totalStores}</span>
                <span className="text-xs text-gray-500">100% plataforma</span>
              </div>
            </div>

            <div className="saas-card-hover rounded-2xl p-6 border border-[#1E2030] space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Comercios Activos</p>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-mono font-bold text-white">{activeStores}</span>
                <span className="text-xs text-emerald-400 font-medium">Operativos</span>
              </div>
            </div>

            <div className="saas-card-hover rounded-2xl p-6 border border-[#1E2030] space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Volumen Real Procesado</p>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-mono font-bold text-white">S/ {totalVolume.toFixed(2)}</span>
                <span className="text-xs text-purple-400 font-medium">PEN</span>
              </div>
            </div>
          </div>

          {/* Tabla Empresarial Sobria de Comercios */}
          <div className="saas-card rounded-2xl border border-[#1E2030] overflow-hidden">
            <div className="p-5 border-b border-[#1E2030] flex flex-wrap items-center justify-between gap-4 bg-[#0A0B12]">
              <div>
                <h3 className="text-sm font-bold text-white">Directorio de Cajas Registradas</h3>
                <p className="text-xs text-gray-400 mt-0.5">Audita o controla las sesiones del cliente en tiempo real</p>
              </div>
              <button
                onClick={fetchTenants}
                className="text-xs font-medium text-gray-400 hover:text-white bg-[#131522] hover:bg-[#1A1D2E] px-3.5 py-1.5 rounded-xl border border-[#212538] transition-colors"
              >
                Actualizar Lista
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-gray-400">Cargando datos de comercios...</div>
            ) : tenants.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-500">No hay tiendas registradas aún en el sistema.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0A0B12] border-b border-[#1E2030] text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-6">ID</th>
                      <th className="py-3.5 px-6">Comercio / Negocio</th>
                      <th className="py-3.5 px-6">Correo de Acceso</th>
                      <th className="py-3.5 px-6">Estado</th>
                      <th className="py-3.5 px-6 text-right">Recaudado (PEN)</th>
                      <th className="py-3.5 px-6 text-center">Auditoría / Gestión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#171926]">
                    {tenants.map((t) => (
                      <tr key={t.id} className="hover:bg-[#10121C] transition-colors">
                        <td className="py-4 px-6 font-mono text-gray-500">#{t.id}</td>
                        <td className="py-4 px-6 font-bold text-white">{t.nombre_negocio}</td>
                        <td className="py-4 px-6 font-mono text-gray-400">{t.email}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${
                            t.estado === 'Activo'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${t.estado === 'Activo' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                            {t.estado}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-white text-sm">
                          S/ {parseFloat(t.total_real || 0).toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-center space-x-2">
                          <button
                            onClick={() => setViewingTenant(t)}
                            className="bg-[#181928] hover:bg-[#8B5CF6] text-gray-200 hover:text-white border border-[#26283D] hover:border-[#8B5CF6] text-xs font-medium px-3.5 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5"
                            title="Auditar y ver la caja del cliente en vivo"
                          >
                            <span>👀</span>
                            <span>Auditar Caja</span>
                          </button>

                          <button
                            onClick={() => handleToggleStatus(t.id, t.estado)}
                            className={`text-xs font-medium px-3 py-1.5 rounded-xl border transition-all ${
                              t.estado === 'Activo'
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            {t.estado === 'Activo' ? 'Suspender' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Nuevo Comercio Sobrio */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md saas-card rounded-2xl p-7 border border-[#1E2030] space-y-6">
            <div className="flex items-center justify-between border-b border-[#1E2030] pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Alta de Nuevo Comercio</h3>
                <p className="text-xs text-gray-400">Crea acceso de cliente y token en el SaaS</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs p-3 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Nombre de la Tienda</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="ej: Bodega Central"
                  className="w-full saas-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Correo de Acceso</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="tienda@comercio.com"
                  className="w-full saas-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Contraseña Inicial</label>
                <input
                  type="text"
                  required
                  value={formPass}
                  onChange={(e) => setFormPass(e.target.value)}
                  placeholder="123456"
                  className="w-full saas-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Correo Notificación Yape (Opcional)</label>
                <input
                  type="email"
                  value={formCorreoYape}
                  onChange={(e) => setFormCorreoYape(e.target.value)}
                  placeholder="pagos@comercio.com"
                  className="w-full saas-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-[#131420] hover:bg-[#1C1E2F] text-gray-300 font-medium py-2.5 rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold py-2.5 rounded-xl text-xs disabled:opacity-50 transition-all"
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
