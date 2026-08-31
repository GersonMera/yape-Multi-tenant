import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  IconBarChart, 
  IconStore, 
  IconPlus, 
  IconEye, 
  IconLogOut, 
  IconShieldCheck,
  IconCalendar,
  IconWhatsApp,
  IconLock,
  IconRefresh
} from './Icons';

export const SuperAdminDashboard = () => {
  const { user, token, logout, setViewingTenant } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [whatsappSoporte, setWhatsappSoporte] = useState('+51999999999');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general'); // general | comercios

  // Modal Nuevo Comercio
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPass, setFormPass] = useState('123456');
  const [formCorreoYape, setFormCorreoYape] = useState('');
  const [formDiaCorte, setFormDiaCorte] = useState(new Date().getDate());
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  // Modal de Renovación Inteligente (Modo A vs Modo B)
  const [renewTenant, setRenewTenant] = useState(null);
  const [renewMode, setRenewMode] = useState('from_today'); // 'from_today' (Modo A) | 'from_due_date' | 'custom'
  const [customDate, setCustomDate] = useState('');
  const [renewing, setRenewing] = useState(false);

  // Modal de Configurar Corte Mensual
  const [editCorteTenant, setEditCorteTenant] = useState(null);
  const [editDiaCorte, setEditDiaCorte] = useState(30);
  const [editFechaVenc, setEditFechaVenc] = useState('');
  const [savingCorte, setSavingCorte] = useState(false);

  // Modal WhatsApp de Soporte
  const [isWpModalOpen, setIsWpModalOpen] = useState(false);
  const [wpInput, setWpInput] = useState('');
  const [savingWp, setSavingWp] = useState(false);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await fetch('/yape/backend/public/api/admin.php?action=list_tenants', {
        headers: { 'X-Auth-Token': token }
      });
      const json = await res.json();
      if (json.status === 'success') {
        setTenants(json.data || []);
        if (json.whatsapp_soporte) {
          setWhatsappSoporte(json.whatsapp_soporte);
        }
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
          correo_recepcion_yape: formCorreoYape,
          dia_corte_mensual: parseInt(formDiaCorte, 10) || 30
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
      setFormDiaCorte(new Date().getDate());
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

  // RENOVAR SUSCRIPCIÓN (Modo A por defecto: +30 días desde HOY)
  const handleExecuteRenew = async () => {
    if (!renewTenant) return;
    setRenewing(true);
    try {
      const res = await fetch('/yape/backend/public/api/admin.php?action=renew_subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          tenant_id: renewTenant.id,
          mode: renewMode,
          custom_date: customDate
        })
      });
      const json = await res.json();
      if (json.status === 'success') {
        setRenewTenant(null);
        fetchTenants();
      } else {
        alert(json.message || 'Error al renovar suscripción');
      }
    } catch (e) {
      console.error('Error al renovar:', e);
    } finally {
      setRenewing(false);
    }
  };

  // GUARDAR CONFIGURACIÓN DE CORTE MANUAL
  const handleSaveCorte = async (e) => {
    e.preventDefault();
    if (!editCorteTenant) return;
    setSavingCorte(true);
    try {
      const res = await fetch('/yape/backend/public/api/admin.php?action=update_subscription_settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          tenant_id: editCorteTenant.id,
          dia_corte_mensual: parseInt(editDiaCorte, 10),
          fecha_vencimiento: editFechaVenc
        })
      });
      const json = await res.json();
      if (json.status === 'success') {
        setEditCorteTenant(null);
        fetchTenants();
      } else {
        alert(json.message || 'Error actualizando corte');
      }
    } catch (e) {
      console.error('Error al actualizar corte:', e);
    } finally {
      setSavingCorte(false);
    }
  };

  // GUARDAR NÚMERO DE WHATSAPP DE SOPORTE
  const handleSaveWhatsapp = async (e) => {
    e.preventDefault();
    setSavingWp(true);
    try {
      const res = await fetch('/yape/backend/public/api/admin.php?action=update_subscription_settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({ whatsapp_soporte: wpInput })
      });
      const json = await res.json();
      if (json.status === 'success') {
        setWhatsappSoporte(wpInput);
        setIsWpModalOpen(false);
      }
    } catch (e) {
      console.error('Error guardando WhatsApp:', e);
    } finally {
      setSavingWp(false);
    }
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return 'Sin fecha';
    try {
      const parts = fechaStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return fechaStr;
    } catch {
      return fechaStr;
    }
  };

  // Calcular fecha tentativa para el Modo A (+30 días a partir de hoy)
  const getFechaModoA = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toLocaleDateString('es-PE');
  };

  const totalStores = tenants.length;
  const activeStores = tenants.filter(t => t.estado === 'Activo' && !t.suscripcion?.is_expired).length;
  const expiredStores = tenants.filter(t => t.suscripcion?.is_expired || t.estado === 'Suspendido').length;
  const totalVolume = tenants.reduce((acc, t) => acc + (parseFloat(t.total_real) || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-[#0F172A]">
      {/* SIDEBAR CORPORATIVO EN BLANCO PURO */}
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
              <IconBarChart className="w-4 h-4 shrink-0" />
              <span>Métricas SaaS</span>
            </button>

            <button
              onClick={() => setActiveTab('comercios')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'comercios'
                  ? 'bg-[#7C3AED] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <IconStore className="w-4 h-4 shrink-0" />
              <span>Directorio & Suscripciones</span>
            </button>
          </nav>

          {/* Tarjeta de WhatsApp de Soporte Configurado */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">WhatsApp Soporte</span>
              <button
                onClick={() => {
                  setWpInput(whatsappSoporte);
                  setIsWpModalOpen(true);
                }}
                className="text-[11px] text-[#7C3AED] hover:underline font-semibold"
              >
                Editar
              </button>
            </div>
            <div className="flex items-center gap-2 text-[#0F172A] font-semibold">
              <IconWhatsApp className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span className="font-mono text-xs">{whatsappSoporte}</span>
            </div>
            <p className="text-[10px] text-[#64748B] leading-tight">
              Los clientes bloqueados te contactarán a este número para renovar.
            </p>
          </div>
        </div>

        {/* Footer Sidebar */}
        <div className="pt-6 border-t border-[#E2E8F0] space-y-4">
          <div className="px-3">
            <p className="text-xs font-bold text-[#0F172A] truncate">{user?.email || 'admin@yape.com'}</p>
            <span className="text-[10px] text-[#64748B] font-medium block">SaaS Master Owner</span>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <IconLogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Header Superior */}
        <header className="h-16 border-b border-[#E2E8F0] px-6 sm:px-10 flex items-center justify-between bg-white sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Panel Master</span>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-xs font-bold text-[#0F172A]">Control Multi-Tenant & Suscripciones</span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs inline-flex items-center gap-2"
          >
            <IconPlus className="w-4 h-4" />
            <span>Registrar Nuevo Comercio</span>
          </button>
        </header>

        <div className="p-6 sm:p-10 space-y-8 max-w-7xl w-full mx-auto">
          {/* Métricas Globales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="saas-card p-5 rounded-xl border border-[#E2E8F0] space-y-1">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Comercios Afiliados</span>
              <p className="text-2xl font-extrabold text-[#0F172A]">{totalStores}</p>
              <span className="text-xs text-[#64748B]">Registrados en base de datos</span>
            </div>

            <div className="saas-card p-5 rounded-xl border border-[#E2E8F0] space-y-1">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Suscripciones Activas</span>
              <p className="text-2xl font-extrabold text-[#16A34A]">{activeStores}</p>
              <span className="text-xs text-[#64748B]">Terminales operando en vivo</span>
            </div>

            <div className="saas-card p-5 rounded-xl border border-[#E2E8F0] space-y-1">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Vencidas / Bloqueadas</span>
              <p className="text-2xl font-extrabold text-red-600">{expiredStores}</p>
              <span className="text-xs text-[#64748B]">Cajeros en pantalla de pago</span>
            </div>

            <div className="saas-card p-5 rounded-xl border border-[#E2E8F0] space-y-1">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Volumen Global Yape</span>
              <p className="text-2xl font-extrabold text-[#059669] font-mono">S/ {totalVolume.toFixed(2)}</p>
              <span className="text-xs text-[#64748B]">Cobros reales acumulados</span>
            </div>
          </div>

          {/* Tabla de Comercios con Gestión de Suscripción */}
          <div className="saas-card rounded-xl border border-[#E2E8F0] overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4 bg-white">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Directorio de Cajas & Estado de Facturación</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Controla las fechas de corte mensual, días restantes y renovaciones en 1 clic</p>
              </div>
              <button
                onClick={fetchTenants}
                className="text-xs font-semibold text-[#475569] hover:text-[#0F172A] bg-[#F8FAFC] hover:bg-[#F1F5F9] px-3.5 py-1.5 rounded-xl border border-[#CBD5E1] transition-colors inline-flex items-center gap-1.5"
              >
                <IconRefresh className="w-3.5 h-3.5" />
                <span>Actualizar Lista</span>
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-[#64748B]">Cargando datos de comercios y suscripciones...</div>
            ) : tenants.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#64748B]">No hay tiendas registradas aún en el sistema.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">ID</th>
                      <th className="py-3.5 px-4">Comercio</th>
                      <th className="py-3.5 px-4">Día de Corte</th>
                      <th className="py-3.5 px-4">Vencimiento</th>
                      <th className="py-3.5 px-4">Vigencia</th>
                      <th className="py-3.5 px-4 text-right">Recaudación</th>
                      <th className="py-3.5 px-4 text-center">Acciones de Suscripción & Caja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {tenants.map((t) => {
                      const sub = t.suscripcion || {};
                      const isExpired = sub.is_expired || t.estado === 'Suspendido';

                      return (
                        <tr key={t.id} className={`hover:bg-[#F8FAFC] transition-colors ${isExpired ? 'bg-red-50/20' : ''}`}>
                          <td className="py-4 px-4 font-mono text-[#64748B]">#{t.id}</td>
                          <td className="py-4 px-4">
                            <span className="font-bold text-[#0F172A] block">{t.nombre_negocio}</span>
                            <span className="text-[11px] text-[#64748B] font-mono">{t.email}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-[#334155] block">Día {t.dia_corte_mensual || 30}</span>
                            <span className="text-[10px] text-[#64748B]">de cada mes</span>
                          </td>
                          <td className="py-4 px-4 font-mono text-xs">
                            <span className="font-semibold text-[#0F172A] block">{formatFecha(t.fecha_vencimiento)}</span>
                            {t.ultimo_pago_at && (
                              <span className="text-[10px] text-[#64748B] block">Pago: {t.ultimo_pago_at.split(' ')[0]}</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold text-[11px] ${
                              isExpired
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : sub.badge === 'POR_VENCER' || sub.badge === 'VENCE_HOY'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                isExpired ? 'bg-red-600 animate-pulse' : sub.badge === 'POR_VENCER' ? 'bg-amber-500' : 'bg-[#16A34A]'
                              }`}></span>
                              {sub.texto || (isExpired ? 'Vencido' : 'Vigente')}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-mono font-bold text-[#059669] text-xs">
                            S/ {parseFloat(t.total_real || 0).toFixed(2)}
                          </td>
                          <td className="py-4 px-4 text-center space-x-1.5 whitespace-nowrap">
                            {/* Botón RENOVAR MODO A (+30 días desde HOY) */}
                            <button
                              onClick={() => {
                                setRenewTenant(t);
                                setRenewMode('from_today');
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all shadow-xs inline-flex items-center gap-1"
                              title="Renovar 30 días completos a partir de hoy (Modo A)"
                            >
                              <span>+30d Renovar</span>
                            </button>

                            {/* Botón Ajustar Corte */}
                            <button
                              onClick={() => {
                                setEditCorteTenant(t);
                                setEditDiaCorte(t.dia_corte_mensual || 30);
                                setEditFechaVenc(t.fecha_vencimiento || '');
                              }}
                              className="bg-white hover:bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1] text-[11px] font-semibold px-2 py-1.5 rounded-lg transition-all"
                              title="Modificar día de corte o fecha límite manual"
                            >
                              <IconCalendar className="w-3.5 h-3.5" />
                            </button>

                            {/* Botón Auditar Caja */}
                            <button
                              onClick={() => setViewingTenant(t)}
                              className="bg-[#F3E8FF] hover:bg-[#7C3AED] text-[#6D28D9] hover:text-white border border-[#E9D5FF] text-[11px] font-semibold px-2 py-1.5 rounded-lg transition-all inline-flex items-center gap-1"
                              title="Auditar pantalla del cajero"
                            >
                              <IconEye className="w-3.5 h-3.5" />
                              <span>Auditar</span>
                            </button>

                            {/* Botón Suspender / Activar */}
                            <button
                              onClick={() => handleToggleStatus(t.id, t.estado)}
                              className={`text-[11px] font-semibold px-2 py-1.5 rounded-lg border transition-all ${
                                t.estado === 'Activo'
                                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                              }`}
                              title={t.estado === 'Activo' ? 'Suspender temporalmente' : 'Activar acceso'}
                            >
                              {t.estado === 'Activo' ? 'Pausar' : 'Activar'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL DE RENOVACIÓN INTELIGENTE (MODO A vs MODO B) */}
      {renewTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 sm:p-7 border border-[#E2E8F0] space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Facturación SaaS
                </span>
                <h3 className="text-base font-bold text-[#0F172A] mt-1">
                  Renovar Suscripción: {renewTenant.nombre_negocio}
                </h3>
              </div>
              <button onClick={() => setRenewTenant(null)} className="text-[#64748B] hover:text-[#0F172A] font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-[#475569]">
                Selecciona la modalidad de cobro para reactivar el servicio de este comercio:
              </p>

              {/* Opción A (Recomendada): 30 días desde HOY */}
              <div 
                onClick={() => setRenewMode('from_today')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  renewMode === 'from_today'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="renewMode" 
                        checked={renewMode === 'from_today'} 
                        onChange={() => setRenewMode('from_today')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-[#0F172A]">
                        🟢 Modo A: 30 Días completos a partir de HOY (Recomendado)
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] pl-5">
                      Ideal si el cliente estuvo bloqueado. Se le otorga el ciclo mensual completo hasta el <strong className="text-emerald-700">{getFechaModoA()}</strong> y su nuevo día de corte mensual será el día {new Date().getDate()}.
                    </p>
                  </div>
                </div>
              </div>

              {/* Opción B: Mantener corte original */}
              <div 
                onClick={() => setRenewMode('from_due_date')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  renewMode === 'from_due_date'
                    ? 'border-[#7C3AED] bg-purple-50/50 ring-2 ring-purple-500/20'
                    : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="renewMode" 
                        checked={renewMode === 'from_due_date'} 
                        onChange={() => setRenewMode('from_due_date')}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs font-bold text-[#0F172A]">
                        🔵 Modo B: Mantener Día Fijo ({renewTenant.dia_corte_mensual || 30} de cada mes)
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] pl-5">
                      Suma 1 mes a su fecha de corte anterior para conservar su mismo día fijo de siempre.
                    </p>
                  </div>
                </div>
              </div>

              {/* Opción C: Fecha Personalizada */}
              <div 
                onClick={() => setRenewMode('custom')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  renewMode === 'custom'
                    ? 'border-[#7C3AED] bg-purple-50/50 ring-2 ring-purple-500/20'
                    : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="renewMode" 
                    checked={renewMode === 'custom'} 
                    onChange={() => setRenewMode('custom')}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-xs font-bold text-[#0F172A]">
                    📅 Fecha manual personalizada
                  </span>
                </div>
                {renewMode === 'custom' && (
                  <div className="mt-3 pl-5">
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="saas-input rounded-xl px-3 py-2 text-xs w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setRenewTenant(null)}
                className="flex-1 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] font-semibold py-2.5 rounded-xl text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={renewing}
                onClick={handleExecuteRenew}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {renewing ? 'Procesando...' : 'Aplicar Renovación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURAR CORTE MENSUAL */}
      {editCorteTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#E2E8F0] space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Configurar Ciclo de Facturación</h3>
                <p className="text-xs text-[#64748B]">{editCorteTenant.nombre_negocio}</p>
              </div>
              <button onClick={() => setEditCorteTenant(null)} className="text-[#64748B] hover:text-[#0F172A] font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveCorte} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#334155] block mb-1">Día de Corte Mensual (1 al 31)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={editDiaCorte}
                  onChange={(e) => setEditDiaCorte(e.target.value)}
                  className="w-full saas-input rounded-xl px-4 py-2.5 text-sm font-bold"
                />
                <p className="text-[11px] text-[#64748B] mt-1">El sistema verificará el corte en este día de cada mes.</p>
              </div>

              <div>
                <label className="font-semibold text-[#334155] block mb-1">Fecha de Vencimiento Actual</label>
                <input
                  type="date"
                  required
                  value={editFechaVenc}
                  onChange={(e) => setEditFechaVenc(e.target.value)}
                  className="w-full saas-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditCorteTenant(null)}
                  className="flex-1 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingCorte}
                  className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm"
                >
                  {savingCorte ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURAR NÚMERO WHATSAPP SOPORTE */}
      {isWpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#E2E8F0] space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">WhatsApp de Contacto / Renovación</h3>
                <p className="text-xs text-[#64748B]">Número donde los clientes enviarán su solicitud de pago</p>
              </div>
              <button onClick={() => setIsWpModalOpen(false)} className="text-[#64748B] hover:text-[#0F172A] font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveWhatsapp} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#334155] block mb-1">Número de WhatsApp (con código de país)</label>
                <input
                  type="text"
                  required
                  placeholder="+51999999999"
                  value={wpInput}
                  onChange={(e) => setWpInput(e.target.value)}
                  className="w-full saas-input rounded-xl px-4 py-2.5 text-sm font-mono"
                />
                <p className="text-[11px] text-[#64748B] mt-1">
                  Ejemplo: <code className="bg-slate-100 px-1 py-0.5 rounded text-[#0F172A]">+51987654321</code>
                </p>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsWpModalOpen(false)}
                  className="flex-1 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingWp}
                  className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-2.5 rounded-xl transition-all shadow-sm"
                >
                  {savingWp ? 'Guardando...' : 'Actualizar WhatsApp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE NUEVO COMERCIO CON DÍA DE CORTE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-7 border border-[#E2E8F0] space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Alta de Nuevo Comercio</h3>
                <p className="text-xs text-[#64748B]">Crea acceso y define su ciclo de facturación mensual</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#64748B] hover:text-[#0F172A] font-bold">✕</button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTenant} className="space-y-3.5">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#334155] block mb-1">Correo de Acceso</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="tienda@comercio.com"
                    className="w-full saas-input rounded-xl px-3 py-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#334155] block mb-1">Contraseña</label>
                  <input
                    type="text"
                    required
                    value={formPass}
                    onChange={(e) => setFormPass(e.target.value)}
                    placeholder="123456"
                    className="w-full saas-input rounded-xl px-3 py-2.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">
                  Día de Corte Mensual (1 al 31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={formDiaCorte}
                  onChange={(e) => setFormDiaCorte(e.target.value)}
                  placeholder="15"
                  className="w-full saas-input rounded-xl px-4 py-2.5 text-sm font-bold"
                />
                <p className="text-[11px] text-[#64748B] mt-1">
                  Día de cada mes que se bloqueará el sistema si no renueva. (Por defecto: 30 días a partir de hoy).
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">Correo Notificación Yape (Opcional)</label>
                <input
                  type="email"
                  value={formCorreoYape}
                  onChange={(e) => setFormCorreoYape(e.target.value)}
                  placeholder="pagos@comercio.com"
                  className="w-full saas-input rounded-xl px-4 py-2 text-xs"
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
