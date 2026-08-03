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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-[#0F172A]">
      {/* SIDEBAR CORPORATIVO INSTITUCIONAL YAPE EN BLANCO PURO */}
      <aside className="w-full md:w-64 saas-sidebar flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E2E8F0] p-5 shrink-0">
        <div className="space-y-7">
          {/* Brand */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xs">
              Y
            </div>
            <div>
              <span className="font-bold text-[#0F172A] tracking-tight block text-sm">Yape POS SaaS</span>
              <span className="text-[11px] text-[#64748B] font-medium uppercase tracking-wider block">
                Super Admin Panel
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-1.5">
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider px-3 mb-2">Navegación Principal</p>
            
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'general'
                  ? 'bg-[#7C3AED] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <span>📊</span>
              <span>Vista General</span>
            </button>

            <button
              onClick={() => setActiveTab('comercios')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'comercios'
                  ? 'bg-[#7C3AED] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span>🏪</span>
                <span>Directorio de Tiendas</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${
                activeTab === 'comercios' ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#0F172A]'
              }`}>{totalStores}</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-all"
            >
              <span>➕</span>
              <span>Alta de Comercio</span>
            </button>
          </nav>
        </div>

        {/* Perfil del Usuario en Sidebar */}
        <div className="pt-6 border-t border-[#E2E8F0] mt-6 space-y-3">
          <div className="px-2">
            <p className="text-xs font-bold text-[#0F172A] truncate">{user?.email}</p>
            <p className="text-[10px] text-[#64748B] font-mono">Rol: SaaS Owner</p>
          </div>

          <button
            onClick={logout}
            className="w-full bg-white hover:bg-red-50 text-[#64748B] hover:text-red-600 border border-[#CBD5E1] hover:border-red-200 text-xs font-semibold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DE CONTENIDO A PANTALLA COMPLETA */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Topbar Corporativo Blanco */}
        <header className="h-16 border-b border-[#E2E8F0] px-6 sm:px-8 flex items-center justify-between bg-white sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#64748B]">Panel Administrativo</span>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-xs font-bold text-[#0F172A] capitalize">{activeTab === 'general' ? 'Vista General & KPIs' : 'Gestión de Tiendas'}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <span>➕</span>
              <span>Registrar Tienda</span>
            </button>
          </div>
        </header>

        {/* Contenido Minimalista Ejecutivo */}
        <div className="flex-1 p-6 sm:p-10 space-y-8 max-w-7xl w-full mx-auto">
          {/* Banner de Estado del SaaS */}
          <div className="saas-card rounded-xl p-6 sm:p-8 border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-6 shadow-xs">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
                Estado Operativo de la Plataforma
              </h2>
              <p className="text-xs text-[#64748B] mt-1">
                Monitoreo consolidado de cobros validados y comercios activos
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3.5 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                Sistemas Yape POS en Línea
              </span>
            </div>
          </div>

          {/* Tarjetas KPI Monocromáticas Blancas de Alta Legibilidad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="saas-card-hover rounded-xl p-6 border border-[#E2E8F0] space-y-2 shadow-xs">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Tiendas Registradas</p>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-mono font-extrabold text-[#0F172A]">{totalStores}</span>
                <span className="text-xs text-[#64748B]">100% plataforma</span>
              </div>
            </div>

            <div className="saas-card-hover rounded-xl p-6 border border-[#E2E8F0] space-y-2 shadow-xs">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Comercios Activos</p>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-mono font-extrabold text-[#0F172A]">{activeStores}</span>
                <span className="text-xs text-[#16A34A] font-semibold">Operativos</span>
              </div>
            </div>

            <div className="saas-card-hover rounded-xl p-6 border border-[#E2E8F0] space-y-2 shadow-xs">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Volumen Real Procesado</p>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-mono font-extrabold text-[#0F172A]">S/ {totalVolume.toFixed(2)}</span>
                <span className="text-xs text-[#7C3AED] font-semibold">PEN</span>
              </div>
            </div>
          </div>

          {/* Tabla Empresarial de Comercios */}
          <div className="saas-card rounded-xl border border-[#E2E8F0] overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4 bg-white">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Directorio de Cajas Registradas</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Audita o controla las sesiones del cliente en tiempo real</p>
              </div>
              <button
                onClick={fetchTenants}
                className="text-xs font-semibold text-[#475569] hover:text-[#0F172A] bg-[#F8FAFC] hover:bg-[#F1F5F9] px-3.5 py-1.5 rounded-xl border border-[#CBD5E1] transition-colors"
              >
                Actualizar Lista
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-[#64748B]">Cargando datos de comercios...</div>
            ) : tenants.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#64748B]">No hay tiendas registradas aún en el sistema.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-6">ID</th>
                      <th className="py-3.5 px-6">Comercio / Negocio</th>
                      <th className="py-3.5 px-6">Correo de Acceso</th>
                      <th className="py-3.5 px-6">Estado</th>
                      <th className="py-3.5 px-6 text-right">Recaudado (PEN)</th>
                      <th className="py-3.5 px-6 text-center">Auditoría / Gestión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {tenants.map((t) => (
                      <tr key={t.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-4 px-6 font-mono text-[#64748B]">#{t.id}</td>
                        <td className="py-4 px-6 font-bold text-[#0F172A]">{t.nombre_negocio}</td>
                        <td className="py-4 px-6 font-mono text-[#475569]">{t.email}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold text-xs ${
                            t.estado === 'Activo'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${t.estado === 'Activo' ? 'bg-[#16A34A]' : 'bg-red-500'}`}></span>
                            {t.estado}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-[#059669] text-sm">
                          S/ {parseFloat(t.total_real || 0).toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-center space-x-2">
                          <button
                            onClick={() => setViewingTenant(t)}
                            className="bg-[#F3E8FF] hover:bg-[#7C3AED] text-[#6D28D9] hover:text-white border border-[#E9D5FF] hover:border-[#7C3AED] text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5 shadow-xs"
                            title="Auditar y ver la caja del cliente en vivo"
                          >
                            <span>👀</span>
                            <span>Auditar Caja</span>
                          </button>

                          <button
                            onClick={() => handleToggleStatus(t.id, t.estado)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                              t.estado === 'Activo'
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
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

      {/* Modal de Nuevo Comercio Minimalista */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-7 border border-[#E2E8F0] space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Alta de Nuevo Comercio</h3>
                <p className="text-xs text-[#64748B]">Crea acceso de cliente en la plataforma SaaS</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#64748B] hover:text-[#0F172A]">✕</button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">Nombre de la Tienda</label>
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
                <label className="text-xs font-semibold text-[#334155] block mb-1">Correo de Acceso</label>
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
                <label className="text-xs font-semibold text-[#334155] block mb-1">Contraseña Inicial</label>
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
                <label className="text-xs font-semibold text-[#334155] block mb-1">Correo Notificación Yape (Opcional)</label>
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
                  className="flex-1 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] font-semibold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold py-2.5 rounded-xl text-xs disabled:opacity-50 transition-all shadow-sm"
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
