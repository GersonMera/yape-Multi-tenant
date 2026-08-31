import React, { useState, useEffect, useMemo } from 'react';
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
  IconRefresh,
  IconActivity,
  IconEdit,
  IconTrash,
  IconAlertCircle
} from './Icons';

export const SuperAdminDashboard = () => {
  const { user, token, logout, setViewingTenant } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [whatsappSoporte, setWhatsappSoporte] = useState('+51999999999');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'comercios'

  // Filtros en Directorio
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'vigente' | 'por_vencer' | 'vencido'

  // Modal Nuevo Comercio (Create)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPass, setFormPass] = useState('123456');
  const [formCorreoYape, setFormCorreoYape] = useState('');
  const [formDiaCorte, setFormDiaCorte] = useState(new Date().getDate());
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  // Modal Editar Comercio (Update)
  const [editTenant, setEditTenant] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPass, setEditPass] = useState('');
  const [editCorreoYape, setEditCorreoYape] = useState('');
  const [editDiaCorteVal, setEditDiaCorteVal] = useState(30);
  const [editFechaVencVal, setEditFechaVencVal] = useState('');
  const [editEstadoVal, setEditEstadoVal] = useState('Activo');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState(null);

  // Modal Eliminar Comercio (Delete)
  const [deleteTenant, setDeleteTenant] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Modal de Renovación Inteligente (Modo A vs Modo B)
  const [renewTenant, setRenewTenant] = useState(null);
  const [renewMode, setRenewMode] = useState('from_today'); // 'from_today' (Modo A) | 'from_due_date' | 'custom'
  const [customDate, setCustomDate] = useState('');
  const [renewing, setRenewing] = useState(false);

  // Modal de Configurar Corte Rápido
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

  // CREATE TENANT
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

  // OPEN EDIT MODAL
  const openEditModal = (t) => {
    setEditTenant(t);
    setEditName(t.nombre_negocio || '');
    setEditEmail(t.email || '');
    setEditPass('');
    setEditCorreoYape(t.correo_recepcion_yape || '');
    setEditDiaCorteVal(t.dia_corte_mensual || 30);
    setEditFechaVencVal(t.fecha_vencimiento || '');
    setEditEstadoVal(t.estado || 'Activo');
    setEditError(null);
  };

  // UPDATE TENANT
  const handleSaveEditTenant = async (e) => {
    e.preventDefault();
    if (!editTenant) return;
    setSavingEdit(true);
    setEditError(null);
    try {
      const payload = {
        action: 'update_tenant',
        tenant_id: editTenant.id,
        nombre_negocio: editName,
        email: editEmail,
        correo_recepcion_yape: editCorreoYape,
        dia_corte_mensual: parseInt(editDiaCorteVal, 10),
        fecha_vencimiento: editFechaVencVal,
        estado: editEstadoVal
      };
      if (editPass.trim()) {
        payload.password = editPass.trim();
      }
      const res = await fetch('/yape/backend/public/api/admin.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok || json.status === 'error') {
        throw new Error(json.message || 'Error al actualizar comercio');
      }
      setEditTenant(null);
      fetchTenants();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // DELETE TENANT
  const handleExecuteDeleteTenant = async () => {
    if (!deleteTenant) return;
    setDeleting(true);
    try {
      const res = await fetch('/yape/backend/public/api/admin.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          action: 'delete_tenant',
          tenant_id: deleteTenant.id
        })
      });
      const json = await res.json();
      if (json.status === 'success') {
        setDeleteTenant(null);
        fetchTenants();
      } else {
        alert(json.message || 'Error al eliminar comercio');
      }
    } catch (e) {
      console.error('Error al eliminar:', e);
    } finally {
      setDeleting(false);
    }
  };

  // TOGGLE STATUS
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

  // GUARDAR CONFIGURACIÓN DE CORTE RÁPIDO
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

  // Calcular fecha tentativa para el Modo A (+1 mes exacto a partir de hoy)
  const getFechaModoA = () => {
    const now = new Date();
    const day = now.getDate();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const daysInNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0).getDate();
    const targetDay = Math.min(day, daysInNextMonth);
    nextMonth.setDate(targetDay);
    return nextMonth.toLocaleDateString('es-PE');
  };

  // Métricas agregadas
  const totalStores = tenants.length;
  const activeStores = tenants.filter(t => t.estado === 'Activo' && !t.suscripcion?.is_expired).length;
  const warningStores = tenants.filter(t => t.suscripcion?.badge === 'POR_VENCER' || t.suscripcion?.badge === 'VENCE_HOY').length;
  const expiredStores = tenants.filter(t => t.suscripcion?.is_expired || t.estado === 'Suspendido').length;
  const totalVolume = tenants.reduce((acc, t) => acc + (parseFloat(t.total_real) || 0), 0);
  const totalTransactions = tenants.reduce((acc, t) => acc + (parseInt(t.count_yapes, 10) || 0), 0);
  const avgTicket = totalTransactions > 0 ? (totalVolume / totalTransactions).toFixed(2) : '0.00';

  // Ranking de comercios para la pestaña de Métricas
  const sortedTenantsBySales = useMemo(() => {
    return [...tenants].sort((a, b) => (parseFloat(b.total_real) || 0) - (parseFloat(a.total_real) || 0));
  }, [tenants]);

  // Filtrado de comercios para la pestaña de Directorio
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      // Filtro por texto (nombre o email)
      const matchesText = 
        t.nombre_negocio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesText) return false;

      // Filtro por estado de suscripción
      const isExpired = t.suscripcion?.is_expired || t.estado === 'Suspendido';
      const isWarning = t.suscripcion?.badge === 'POR_VENCER' || t.suscripcion?.badge === 'VENCE_HOY';

      if (statusFilter === 'vigente') return !isExpired && !isWarning && t.estado === 'Activo';
      if (statusFilter === 'por_vencer') return isWarning;
      if (statusFilter === 'vencido') return isExpired;

      return true; // 'all'
    });
  }, [tenants, searchQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-[#0F172A]">
      {/* 1. BARRA SUPERIOR EXCLUSIVA PARA CELULAR (md:hidden) */}
      <div className="md:hidden bg-white border-b border-[#E2E8F0] px-4 py-3 space-y-2.5 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#7C3AED] rounded-xl flex items-center justify-center text-white font-bold text-base shadow-xs">
              Y
            </div>
            <div>
              <span className="font-bold text-[#0F172A] tracking-tight block text-xs leading-tight">Yape POS SaaS</span>
              <span className="text-[9px] text-[#64748B] font-semibold uppercase tracking-wider block">
                Super Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* WhatsApp Soporte rápido */}
            <button
              onClick={() => {
                setWpInput(whatsappSoporte);
                setIsWpModalOpen(true);
              }}
              className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 text-xs font-semibold"
              title="Configurar WhatsApp de Soporte"
            >
              <IconWhatsApp className="w-4 h-4 text-[#16A34A]" />
              <span className="text-[10px] hidden xs:inline font-mono">{whatsappSoporte}</span>
            </button>

            {/* Cerrar Sesión */}
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200 transition-colors"
              title="Cerrar Sesión"
            >
              <IconLogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selector de Pestañas Segmentado para Celular */}
        <div className="grid grid-cols-2 gap-1.5 bg-[#F1F5F9] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-white text-[#7C3AED] shadow-2xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <IconBarChart className="w-3.5 h-3.5" />
            <span>Métricas</span>
          </button>
          <button
            onClick={() => setActiveTab('comercios')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'comercios'
                ? 'bg-white text-[#7C3AED] shadow-2xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <IconStore className="w-3.5 h-3.5" />
            <span>Directorio</span>
          </button>
        </div>
      </div>

      {/* 2. SIDEBAR CORPORATIVO COMPLETO PARA DESKTOP (hidden md:flex) */}
      <aside className="hidden md:flex md:w-64 saas-sidebar flex-col justify-between border-r border-[#E2E8F0] p-5 shrink-0 bg-white min-h-screen sticky top-0">
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

          {/* Navegación por Pestañas Claras */}
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

        {/* Footer Sidebar Desktop */}
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

      {/* CONTENIDO PRINCIPAL DINÁMICO */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Header Superior con Acción de Registrar */}
        <header className="h-14 sm:h-16 border-b border-[#E2E8F0] px-4 sm:px-10 flex items-center justify-between bg-white sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider hidden sm:inline">Panel Master</span>
            <span className="text-[#CBD5E1] hidden sm:inline">/</span>
            <span className="text-xs font-bold text-[#0F172A] truncate max-w-[180px] sm:max-w-none">
              {activeTab === 'general' ? 'Métricas & Analítica Global' : 'Directorio de Comercios'}
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-3.5 sm:px-4 py-2 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 shrink-0"
          >
            <IconPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Registrar Nuevo Comercio</span>
            <span className="sm:hidden">Nuevo Comercio</span>
          </button>
        </header>

        {/* ========================================================================= */}
        {/* VISTA 1: MÉTRICAS SAAS (Centro Analítico y de Negocio) */}
        {/* ========================================================================= */}
        {activeTab === 'general' && (
          <div className="p-4 sm:p-10 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto animate-fade-in">
            {/* Título de Sección */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">Rendimiento General de la Plataforma</h2>
              <p className="text-xs text-[#64748B] mt-0.5">Indicadores financieros consolidados y salud de la infraestructura</p>
            </div>

            {/* 4 KPIs Financieros Globales (2x2 en Celular, 4 en Desktop) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              <div className="saas-card p-3.5 sm:p-5 rounded-xl border border-[#E2E8F0] bg-white space-y-1 shadow-xs">
                <span className="text-[10px] sm:text-[11px] font-bold text-[#64748B] uppercase tracking-wider block truncate">Volumen Global</span>
                <p className="text-xl sm:text-2xl font-extrabold text-[#059669] font-mono">S/ {totalVolume.toFixed(2)}</p>
                <span className="text-[10px] sm:text-xs text-[#64748B] block truncate">Todos los comercios</span>
              </div>

              <div className="saas-card p-3.5 sm:p-5 rounded-xl border border-[#E2E8F0] bg-white space-y-1 shadow-xs">
                <span className="text-[10px] sm:text-[11px] font-bold text-[#64748B] uppercase tracking-wider block truncate">Cobros Procesados</span>
                <p className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">{totalTransactions}</p>
                <span className="text-[10px] sm:text-xs text-[#64748B] block truncate">Pagos validados</span>
              </div>

              <div className="saas-card p-3.5 sm:p-5 rounded-xl border border-[#E2E8F0] bg-white space-y-1 shadow-xs">
                <span className="text-[10px] sm:text-[11px] font-bold text-[#64748B] uppercase tracking-wider block truncate">Ticket Promedio</span>
                <p className="text-xl sm:text-2xl font-extrabold text-[#7C3AED] font-mono">S/ {avgTicket}</p>
                <span className="text-[10px] sm:text-xs text-[#64748B] block truncate">Por transacción</span>
              </div>

              <div className="saas-card p-3.5 sm:p-5 rounded-xl border border-[#E2E8F0] bg-white space-y-1 shadow-xs">
                <span className="text-[10px] sm:text-[11px] font-bold text-[#64748B] uppercase tracking-wider block truncate">Comercios Activos</span>
                <p className="text-xl sm:text-2xl font-extrabold text-[#16A34A]">
                  {totalStores > 0 ? Math.round((activeStores / totalStores) * 100) : 0}%
                </p>
                <span className="text-[10px] sm:text-xs text-[#64748B] block truncate">{activeStores} de {totalStores} tiendas al día</span>
              </div>
            </div>

            {/* Fila Analítica: Ranking de Ventas + Estado del Sistema */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Ranking de Comercios por Volumen (8 columnas) */}
              <div className="lg:col-span-8 saas-card rounded-xl border border-[#E2E8F0] bg-white overflow-hidden shadow-xs">
                <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">Ranking de Recaudación por Comercio</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">Tiendas con mayor actividad y volumen procesado</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#7C3AED] bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full uppercase">
                    Top Rendimiento
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {sortedTenantsBySales.length === 0 ? (
                    <p className="text-center text-xs text-[#64748B] py-8">Sin comercios registrados.</p>
                  ) : (
                    sortedTenantsBySales.map((t, idx) => {
                      const amount = parseFloat(t.total_real || 0);
                      const maxAmount = parseFloat(sortedTenantsBySales[0]?.total_real || 1) || 1;
                      const percentage = maxAmount > 0 ? Math.round((amount / maxAmount) * 100) : 0;

                      return (
                        <div key={t.id} className="space-y-1.5 p-3 rounded-xl hover:bg-[#F8FAFC] transition-colors border border-transparent hover:border-[#E2E8F0]">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-slate-100 font-mono text-[11px] font-bold text-[#475569] flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-[#0F172A]">{t.nombre_negocio}</span>
                              <span className="text-[11px] text-[#64748B] font-mono">({t.email})</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-[#059669] text-sm">
                                S/ {amount.toFixed(2)}
                              </span>
                              <button
                                onClick={() => setViewingTenant(t)}
                                className="text-[11px] text-[#7C3AED] hover:underline font-semibold"
                              >
                                Ver Caja
                              </button>
                            </div>
                          </div>

                          {/* Barra de progreso de ventas */}
                          <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#7C3AED] rounded-full transition-all duration-500" 
                              style={{ width: `${Math.max(percentage, 3)}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex justify-between text-[10px] text-[#64748B]">
                            <span>{t.count_yapes || 0} pagos procesados</span>
                            <span>{percentage}% del volumen líder</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Salud del SaaS e Infraestructura (4 columnas) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Salud de Suscripciones */}
                <div className="saas-card p-5 rounded-xl border border-[#E2E8F0] bg-white space-y-4 shadow-xs">
                  <h3 className="text-sm font-bold text-[#0F172A]">Salud de Suscripciones</h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="font-semibold">🟢 Vigentes (Al día):</span>
                      <span className="font-bold font-mono">{activeStores} tiendas</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                      <span className="font-semibold">🟡 Por Vencer (≤3 días):</span>
                      <span className="font-bold font-mono">{warningStores} tiendas</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 text-red-800 border border-red-200">
                      <span className="font-semibold">🔴 Vencidas / Bloqueadas:</span>
                      <span className="font-bold font-mono">{expiredStores} tiendas</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('comercios')}
                    className="w-full bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A] font-semibold py-2 rounded-xl text-xs transition-colors text-center block"
                  >
                    Gestionar en el Directorio →
                  </button>
                </div>

                {/* Estado de Conexiones del Servidor */}
                <div className="saas-card p-5 rounded-xl border border-[#E2E8F0] bg-white space-y-3 shadow-xs text-xs">
                  <h3 className="text-sm font-bold text-[#0F172A]">Estado de Infraestructura</h3>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-1 border-b border-[#F1F5F9]">
                      <span className="text-[#64748B]">Base de Datos MySQL:</span>
                      <span className="font-bold text-[#16A34A] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span> Conectada
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-[#F1F5F9]">
                      <span className="text-[#64748B]">Pusher WebSockets:</span>
                      <span className="font-bold text-[#16A34A] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span> En Línea
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-[#F1F5F9]">
                      <span className="text-[#64748B]">Webhook REST API:</span>
                      <span className="font-bold text-[#16A34A] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span> Operando (200)
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-[#64748B]">App Android Connector:</span>
                      <span className="font-bold text-[#16A34A] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span> HTTP Habilitado
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 2: DIRECTORIO & SUSCRIPCIONES (CRUD Completo de Comercios) */}
        {/* ========================================================================= */}
        {activeTab === 'comercios' && (
          <div className="p-4 sm:p-10 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto animate-fade-in">
            {/* Header de la Sección */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">Directorio de Cajas & Facturación Mensual</h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Administra, edita o elimina comercios, controla días de corte y ejecuta renovaciones en 1 clic
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={fetchTenants}
                  className="text-xs font-semibold text-[#475569] hover:text-[#0F172A] bg-white hover:bg-[#F8FAFC] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-[#CBD5E1] transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <IconRefresh className="w-3.5 h-3.5" />
                  <span>Actualizar Datos</span>
                </button>
              </div>
            </div>

            {/* Barra de Filtros Rápidos & Buscador Responsivo */}
            <div className="bg-white border border-[#E2E8F0] p-3 sm:p-4 rounded-xl shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
              {/* Filtros tipo Chips con scroll horizontal táctil */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    statusFilter === 'all'
                      ? 'bg-[#7C3AED] text-white shadow-xs'
                      : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
                  }`}
                >
                  Todos ({tenants.length})
                </button>

                <button
                  onClick={() => setStatusFilter('vigente')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    statusFilter === 'vigente'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  🟢 Vigentes ({activeStores})
                </button>

                <button
                  onClick={() => setStatusFilter('por_vencer')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    statusFilter === 'por_vencer'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  🟡 Por Vencer ({warningStores})
                </button>

                <button
                  onClick={() => setStatusFilter('vencido')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    statusFilter === 'vencido'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  🔴 Vencidos ({expiredStores})
                </button>
              </div>

              {/* Buscador */}
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Buscar tienda o correo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full saas-input rounded-xl px-3.5 py-1.5 text-xs bg-[#F8FAFC]"
                />
              </div>
            </div>

            {/* Contenedor de Comercios: Tabla en Desktop, Tarjetas Agrupadas en Móvil */}
            <div className="saas-card rounded-xl border border-[#E2E8F0] bg-white overflow-hidden shadow-xs">
              {loading ? (
                <div className="p-12 text-center text-xs text-[#64748B]">Cargando datos de comercios y suscripciones...</div>
              ) : filteredTenants.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#64748B] space-y-2">
                  <p className="font-semibold text-sm text-[#0F172A]">No se encontraron tiendas</p>
                  <p>Intenta cambiar el término de búsqueda o el filtro de estado seleccionado.</p>
                </div>
              ) : (
                <>
                  {/* VISTA 1: TABLA PARA COMPUTADORA / TABLET (hidden md:block) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4">ID</th>
                          <th className="py-3.5 px-4">Comercio</th>
                          <th className="py-3.5 px-4">Día de Corte</th>
                          <th className="py-3.5 px-4">Fecha Límite</th>
                          <th className="py-3.5 px-4">Estado Suscripción</th>
                          <th className="py-3.5 px-4 text-right">Recaudado (PEN)</th>
                          <th className="py-3.5 px-4 text-center">Gestión & Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {filteredTenants.map((t) => {
                          const sub = t.suscripcion || {};
                          const isExpired = sub.is_expired || t.estado === 'Suspendido';

                          return (
                            <tr key={t.id} className={`hover:bg-[#F8FAFC] transition-colors ${isExpired ? 'bg-red-50/25' : ''}`}>
                              <td className="py-4 px-4 font-mono text-[#64748B]">#{t.id}</td>
                              <td className="py-4 px-4">
                                <span className="font-bold text-[#0F172A] block text-sm">{t.nombre_negocio}</span>
                                <span className="text-[11px] text-[#64748B] font-mono">{t.email}</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="font-semibold text-[#334155] block">Día {t.dia_corte_mensual || 30}</span>
                                <span className="text-[10px] text-[#64748B]">de cada mes</span>
                              </td>
                              <td className="py-4 px-4 font-mono text-xs">
                                <span className="font-semibold text-[#0F172A] block">{formatFecha(t.fecha_vencimiento)}</span>
                                {t.ultimo_pago_at && (
                                  <span className="text-[10px] text-[#64748B] block">Último: {t.ultimo_pago_at.split(' ')[0]}</span>
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

                                <button
                                  onClick={() => openEditModal(t)}
                                  className="bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-900 border border-blue-200 text-[11px] font-semibold px-2 py-1.5 rounded-lg transition-all inline-flex items-center gap-1 shadow-2xs"
                                  title="Editar datos del comercio, correo, contraseña o corte"
                                >
                                  <IconEdit className="w-3.5 h-3.5" />
                                  <span>Editar</span>
                                </button>

                                <button
                                  onClick={() => setViewingTenant(t)}
                                  className="bg-[#F3E8FF] hover:bg-[#7C3AED] text-[#6D28D9] hover:text-white border border-[#E9D5FF] text-[11px] font-semibold px-2 py-1.5 rounded-lg transition-all inline-flex items-center gap-1 shadow-2xs"
                                  title="Auditar pantalla del cajero"
                                >
                                  <IconEye className="w-3.5 h-3.5" />
                                  <span>Auditar</span>
                                </button>

                                <button
                                  onClick={() => handleToggleStatus(t.id, t.estado)}
                                  className={`text-[11px] font-semibold px-2 py-1.5 rounded-lg border transition-all shadow-2xs ${
                                    t.estado === 'Activo'
                                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                                  }`}
                                  title={t.estado === 'Activo' ? 'Suspender temporalmente' : 'Activar acceso'}
                                >
                                  {t.estado === 'Activo' ? 'Pausar' : 'Activar'}
                                </button>

                                <button
                                  onClick={() => setDeleteTenant(t)}
                                  className="bg-white hover:bg-red-50 text-red-600 hover:text-red-800 border border-red-200 text-[11px] font-semibold p-1.5 rounded-lg transition-all shadow-2xs inline-flex items-center"
                                  title="Eliminar comercio definitivamente"
                                >
                                  <IconTrash className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* VISTA 2: TARJETAS AGRUPADAS NATIVAS PARA CELULAR (block md:hidden) */}
                  <div className="block md:hidden divide-y divide-[#E2E8F0]">
                    {filteredTenants.map((t) => {
                      const sub = t.suscripcion || {};
                      const isExpired = sub.is_expired || t.estado === 'Suspendido';

                      return (
                        <div key={t.id} className={`p-4 space-y-3 transition-colors ${isExpired ? 'bg-red-50/20' : 'bg-white'}`}>
                          {/* Cabecera de la Tarjeta */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[11px] font-bold text-[#64748B]">#{t.id}</span>
                                <h4 className="font-bold text-[#0F172A] text-sm truncate">{t.nombre_negocio}</h4>
                              </div>
                              <p className="text-[11px] text-[#64748B] font-mono truncate">{t.email}</p>
                            </div>

                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-[10px] shrink-0 ${
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
                          </div>

                          {/* Cuadrícula de Datos Clave (2 columnas) */}
                          <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-xl text-xs">
                            <div>
                              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Día de Corte</span>
                              <span className="font-bold text-[#0F172A]">Día {t.dia_corte_mensual || 30}</span>
                              <span className="text-[9px] text-[#64748B] block">de cada mes</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Fecha Límite</span>
                              <span className="font-bold font-mono text-[#0F172A]">{formatFecha(t.fecha_vencimiento)}</span>
                              <span className="text-[9px] text-[#64748B] block truncate">
                                Recaudado: <b className="text-[#059669] font-mono">S/ {parseFloat(t.total_real || 0).toFixed(2)}</b>
                              </span>
                            </div>
                          </div>

                          {/* Botonera Móvil Ergonómica Agrupada */}
                          <div className="space-y-2 pt-0.5">
                            {/* Fila 1: Auditar y Renovar */}
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => setViewingTenant(t)}
                                className="bg-[#F3E8FF] hover:bg-[#7C3AED] text-[#6D28D9] hover:text-white border border-[#E9D5FF] text-xs font-bold py-2 px-3 rounded-xl transition-all inline-flex items-center justify-center gap-1.5 shadow-2xs"
                              >
                                <IconEye className="w-3.5 h-3.5" />
                                <span>Auditar Caja</span>
                              </button>

                              <button
                                onClick={() => {
                                  setRenewTenant(t);
                                  setRenewMode('from_today');
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-xl transition-all shadow-xs inline-flex items-center justify-center gap-1.5"
                              >
                                <IconRefresh className="w-3.5 h-3.5" />
                                <span>+30d Renovar</span>
                              </button>
                            </div>

                            {/* Fila 2: Editar, Pausar/Activar y Eliminar */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditModal(t)}
                                className="flex-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold py-1.5 px-3 rounded-xl transition-all inline-flex items-center justify-center gap-1 shadow-2xs"
                              >
                                <IconEdit className="w-3.5 h-3.5" />
                                <span>Editar</span>
                              </button>

                              <button
                                onClick={() => handleToggleStatus(t.id, t.estado)}
                                className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-semibold transition-all shadow-2xs text-center ${
                                  t.estado === 'Activo'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}
                              >
                                {t.estado === 'Activo' ? 'Pausar' : 'Activar'}
                              </button>

                              <button
                                onClick={() => setDeleteTenant(t)}
                                className="p-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 transition-all shadow-2xs shrink-0"
                                title="Eliminar comercio definitivamente"
                              >
                                <IconTrash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL EDITAR COMERCIO (CRUD UPDATE) */}
      {/* ========================================================================= */}
      {editTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 sm:p-7 border border-[#E2E8F0] space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Edición de Comercio
                </span>
                <h3 className="text-base font-bold text-[#0F172A] mt-1">
                  Editar: {editTenant.nombre_negocio}
                </h3>
              </div>
              <button onClick={() => setEditTenant(null)} className="text-[#64748B] hover:text-[#0F172A] font-bold">✕</button>
            </div>

            {editError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-medium">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEditTenant} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-[#334155] block mb-1">Nombre del Comercio / Tienda</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full saas-input rounded-xl px-4 py-2.5 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#334155] block mb-1">Correo de Acceso (Login)</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full saas-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#334155] block mb-1">Nueva Contraseña (Opcional)</label>
                  <input
                    type="text"
                    value={editPass}
                    onChange={(e) => setEditPass(e.target.value)}
                    placeholder="En blanco para no cambiar"
                    className="w-full saas-input rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#334155] block mb-1">Correo Receptor Notificaciones Yape</label>
                <input
                  type="email"
                  value={editCorreoYape}
                  onChange={(e) => setEditCorreoYape(e.target.value)}
                  placeholder="pagos@comercio.com"
                  className="w-full saas-input rounded-xl px-3.5 py-2 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-[#334155] block mb-1">Día de Corte</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={editDiaCorteVal}
                    onChange={(e) => setEditDiaCorteVal(e.target.value)}
                    className="w-full saas-input rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#334155] block mb-1">Fecha Límite</label>
                  <input
                    type="date"
                    required
                    value={editFechaVencVal}
                    onChange={(e) => setEditFechaVencVal(e.target.value)}
                    className="w-full saas-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#334155] block mb-1">Estado</label>
                  <select
                    value={editEstadoVal}
                    onChange={(e) => setEditEstadoVal(e.target.value)}
                    className="w-full saas-input rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="Activo">🟢 Activo</option>
                    <option value="Suspendido">🔴 Suspendido</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setEditTenant(null)}
                  className="flex-1 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] font-semibold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {savingEdit ? 'Guardando...' : 'Actualizar Comercio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL ELIMINAR COMERCIO (CRUD DELETE) */}
      {/* ========================================================================= */}
      {deleteTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-7 border border-[#E2E8F0] space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <IconTrash className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-[#0F172A]">
                ¿Eliminar este comercio definitivamente?
              </h3>
              <p className="text-xs text-[#64748B]">
                Estás a punto de borrar a <strong className="text-[#0F172A]">{deleteTenant.nombre_negocio}</strong> (<span className="font-mono">{deleteTenant.email}</span>).
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-start gap-2.5">
              <IconAlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <div className="space-y-1">
                <span className="font-bold block">Esta acción no se puede deshacer</span>
                <p className="text-[11px] leading-relaxed">
                  Se eliminará permanentemente la cuenta, sus credenciales y todo el historial de cobros y transacciones Yape registradas para este negocio.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTenant(null)}
                className="flex-1 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] font-semibold py-2.5 rounded-xl text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleExecuteDeleteTenant}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {deleting ? 'Eliminando...' : 'Sí, Eliminar Comercio'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                        🟢 Modo A: 1 Mes completo a partir de HOY (Recomendado)
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] pl-5">
                      Ideal si el cliente estuvo bloqueado. Se le otorga el mes completo hasta el <strong className="text-emerald-700">{getFechaModoA()}</strong> y su nuevo día de corte mensual será el día {new Date().getDate()}.
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

      {/* MODAL DE NUEVO COMERCIO CON DÍA DE CORTE (CRUD CREATE) */}
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
