import { useEffect, useRef, useState, useCallback } from 'react';
import { usePusher } from './hooks/usePusher';
import { YapeCard } from './components/YapeCard';
import { TenantModal } from './components/TenantModal';
import { CashierSummary } from './components/CashierSummary';
import { CashierCloseModal } from './components/CashierCloseModal';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { 
  IconActivity, 
  IconBarChart, 
  IconBuilding, 
  IconLogOut, 
  IconVolumeUp, 
  IconVolumeMute, 
  IconEye,
  IconDownload
} from './components/Icons';

function App() {
  const { user, token, loading, logout, viewingTenant, setViewingTenant } = useAuth();

  const activeTenantId = viewingTenant?.id || user?.tenant_id || 1;
  const tenantId = activeTenantId;

  const audioRef = useRef(null);
  const carouselRef = useRef(null);
  const [lastNewId, setLastNewId] = useState(null);

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const scrollAmount = 360;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const [tenant, setTenant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ total_real: 0, count_real: 0, total_test: 0, count_test: 0 });
  const [includeTests, setIncludeTests] = useState(false);

  // Filtro por Fechas: 'today' | 'yesterday' | 'last_7_days' | 'last_30_days'
  const [dateFilter, setDateFilter] = useState('today');

  // Voz Inteligente TTS
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    return localStorage.getItem('yape_voice_enabled') !== 'false';
  });

  const toggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    localStorage.setItem('yape_voice_enabled', String(next));
  };

  const formatMontoParaVoz = (monto) => {
    const num = parseFloat(monto || 0);
    if (isNaN(num) || num <= 0) return '0 soles';
    const enteros = Math.floor(num);
    const centimos = Math.round((num - enteros) * 100);

    if (enteros === 0) {
      return `${centimos} ${centimos === 1 ? 'céntimo' : 'céntimos'}`;
    }
    if (centimos === 0) {
      return `${enteros} ${enteros === 1 ? 'sol' : 'soles'}`;
    }
    return `${enteros} ${enteros === 1 ? 'sol' : 'soles'} con ${centimos} ${centimos === 1 ? 'céntimo' : 'céntimos'}`;
  };

  const formatHoraParaVoz = (fechaHoraStr) => {
    let dateObj;
    if (fechaHoraStr && typeof fechaHoraStr === 'string') {
      dateObj = new Date(fechaHoraStr.replace(' ', 'T'));
      if (isNaN(dateObj.getTime())) {
        dateObj = new Date();
      }
    } else {
      dateObj = new Date();
    }

    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const periodo = hours >= 12 ? 'de la tarde' : 'de la mañana';

    if (hours === 0) {
      hours = 12;
    } else if (hours > 12) {
      hours -= 12;
    }

    let textoHora = `${hours}`;
    if (minutes === 0) {
      textoHora += ' en punto';
    } else if (minutes < 10) {
      textoHora += ` y cero ${minutes}`;
    } else {
      textoHora += ` y ${minutes}`;
    }

    return `${textoHora} ${periodo}`;
  };

  const speakYape = useCallback((monto, remitente, fechaHora) => {
    if (voiceEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const fraseMonto = formatMontoParaVoz(monto);
      const nombreStr = remitente || 'Cliente';
      const fraseHora = formatHoraParaVoz(fechaHora);
      
      // La frase introductoria (". . Nuevo pago Yape. . ") da tiempo al controlador de audio de Windows a activarse antes de pronunciar el monto, evitando que se corte
      const textoVoz = `. . Nuevo pago Yape. . por ${fraseMonto}, de ${nombreStr}, a las ${fraseHora}.`;

      const utterance = new SpeechSynthesisUtterance(textoVoz);
      utterance.lang = 'es-ES';
      utterance.rate = 0.96;

      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(v => v.lang.startsWith('es-PE') || v.lang.startsWith('es-MX') || v.lang.startsWith('es'));
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  }, [voiceEnabled]);

  const testVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const fraseMonto = formatMontoParaVoz(15.50);
      const fraseHora = formatHoraParaVoz(new Date().toISOString());
      
      const textoVoz = `. . Nuevo pago Yape. . por ${fraseMonto}, de Juan Pérez, a las ${fraseHora}.`;

      const utterance = new SpeechSynthesisUtterance(textoVoz);
      utterance.lang = 'es-ES';
      utterance.rate = 0.96;

      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(v => v.lang.startsWith('es-PE') || v.lang.startsWith('es-MX') || v.lang.startsWith('es'));
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Tu navegador no soporta síntesis de voz Web Speech.');
    }
  };

  const isDemoMode = import.meta.env.VITE_MODE === 'demo';

  const handleNewYape = useCallback((newTx) => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => {
        console.warn("Navegador bloqueó el Autoplay del sonido.");
      });
    }

    // Invocación instantánea sin retrasos (0ms delay)
    speakYape(newTx.monto, newTx.remitente, newTx.fecha_hora_yape || newTx.fecha_hora);

    const isTest = Boolean(newTx.is_test);
    const montoNum = parseFloat(newTx.monto) || 0;

    setSummary(prev => ({
      ...prev,
      total_real: !isTest ? prev.total_real + montoNum : prev.total_real,
      count_real: !isTest ? prev.count_real + 1 : prev.count_real,
      total_test: isTest ? prev.total_test + montoNum : prev.total_test,
      count_test: isTest ? prev.count_test + 1 : prev.count_test,
    }));

    setTransactions(prev => {
      if (!isTest || includeTests) {
        return [newTx, ...prev];
      }
      return prev;
    });
  }, [includeTests, speakYape]);

  usePusher(tenantId, handleNewYape);

  useEffect(() => {
    if (transactions.length > 0) {
      const newestId = transactions[0].id;
      if (newestId !== lastNewId) {
        setLastNewId(newestId);
        if (carouselRef.current) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }
    }
  }, [transactions, lastNewId]);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const res = await fetch(`/yape/backend/public/api/tenant.php?tenant_id=${activeTenantId}`, {
          method: 'GET',
          headers: {
            'X-Admin-Secret': import.meta.env.VITE_ADMIN_SECRET || 'demo_admin_secret',
            'X-Auth-Token': token || ''
          }
        });
        const json = await res.json();
        if (json.status === 'success') {
          setTenant(json.data);
        }
      } catch (e) {
        console.warn('No se pudo cargar la información del Tenant:', e);
      }
    };
    if (user) {
      fetchTenant();
    }
  }, [token, activeTenantId, user]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/yape/backend/public/api/transactions.php?filter=${dateFilter}&include_tests=${includeTests ? '1' : '0'}&tenant_id=${activeTenantId}`, {
          method: 'GET',
          headers: {
            'X-Admin-Secret': import.meta.env.VITE_ADMIN_SECRET || 'demo_admin_secret',
            'X-Auth-Token': token || ''
          }
        });
        const json = await res.json();
        if (json.status === 'success') {
          setTransactions(json.data.transactions || []);
          setSummary(json.data.summary || { total_real: 0, count_real: 0, total_test: 0, count_test: 0 });
        }
      } catch (e) {
        console.warn('No se pudo cargar el historial de transacciones:', e);
      }
    };
    if (user) {
      fetchHistory();
    }
  }, [includeTests, dateFilter, token, activeTenantId, user]);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await fetch(`/yape/backend/public/api/tenant.php?tenant_id=${activeTenantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': import.meta.env.VITE_ADMIN_SECRET || 'demo_admin_secret',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({ action: 'simulate', tenant_id: activeTenantId })
      });
    } catch (e) {
      console.error('Error al simular pago:', e);
    } finally {
      setSimulating(false);
    }
  };

  const formatFechaHora12 = (fechaStr) => {
    if (!fechaStr) return '';
    const date = new Date(fechaStr.replace(' ', 'T'));
    if (isNaN(date.getTime())) return fechaStr;
    const fecha = date.toLocaleDateString('es-PE');
    const hora = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    return `${fecha} ${hora}`;
  };

  const exportToCSV = () => {
    if (!transactions || transactions.length === 0) return;
    const headers = ['ID', 'Monto (PEN)', 'Remitente', 'Fecha y Hora', 'Es Prueba'];
    const rows = transactions.map(tx => [
      `#${tx.id}`,
      parseFloat(tx.monto || 0).toFixed(2),
      `"${(tx.remitente || 'Desconocido').replace(/"/g, '""')}"`,
      `"${formatFechaHora12(tx.fecha_hora || '')}"`,
      tx.is_test ? 'Si' : 'No'
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + 
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Recaudacion_Yape_${tenant?.nombre_negocio || 'POS'}_${dateFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090E] flex items-center justify-center text-white font-semibold">
        <div className="flex items-center gap-3">
          <span className="animate-spin text-xl">↻</span>
          <span>Cargando Yape POS SaaS...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (user.rol === 'admin' && !viewingTenant) {
    return <SuperAdminDashboard />;
  }

  const getDateLabel = () => {
    switch (dateFilter) {
      case 'yesterday': return 'Ayer';
      case 'last_7_days': return 'Últimos 7 Días';
      case 'last_30_days': return 'Últimos 30 Días';
      case 'today':
      default: return 'Hoy';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-[#0F172A]">
      <audio ref={audioRef} src="/sounds/yape_alert.mp3" preload="auto"></audio>

      {/* SIDEBAR CORPORATIVO INSTITUCIONAL YAPE EN BLANCO PURO */}
      <aside className="w-full md:w-64 saas-sidebar flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E2E8F0] p-5 shrink-0">
        <div className="space-y-7">
          {/* Brand & Store */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xs">
              Y
            </div>
            <div className="overflow-hidden">
              <span className="font-bold text-[#0F172A] tracking-tight block text-sm truncate">
                {tenant?.nombre_negocio || user?.nombre_negocio || 'Mi Comercio'}
              </span>
              <span className="text-[11px] text-[#64748B] font-medium block mt-0.5">
                Yape POS Control
              </span>
            </div>
          </div>

          {/* Nav en el Sidebar */}
          <nav className="space-y-1.5">
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider px-3 mb-2">
              Módulos de Caja
            </p>
            
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#7C3AED] text-white shadow-xs"
            >
              <IconActivity className="w-4 h-4 shrink-0" />
              <span>Recepción en Vivo</span>
            </button>

            <button
              onClick={() => setIsCloseModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-all"
            >
              <IconBarChart className="w-4 h-4 shrink-0" />
              <span>Cierre de Caja ({getDateLabel()})</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-all"
            >
              <IconBuilding className="w-4 h-4 shrink-0" />
              <span>Credenciales & API</span>
            </button>

            <div className="pt-2">
              <button
                onClick={toggleVoice}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  voiceEnabled 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {voiceEnabled ? <IconVolumeUp className="w-4 h-4 text-emerald-600 shrink-0" /> : <IconVolumeMute className="w-4 h-4 text-[#64748B] shrink-0" />}
                  <span>Voz de Alerta</span>
                </div>
                <span className="text-[10px] font-mono font-medium">{voiceEnabled ? 'ACTIVA' : 'SILENCIO'}</span>
              </button>
              <button
                onClick={testVoice}
                className="w-full text-left text-[11px] text-[#6D28D9] hover:text-[#5B21B6] px-3 pt-1.5 transition-colors underline flex items-center gap-1.5"
              >
                <IconVolumeUp className="w-3.5 h-3.5 shrink-0" />
                <span>Probar volumen de voz TTS</span>
              </button>
            </div>

            {isDemoMode && (
              <button
                onClick={handleSimulate}
                disabled={simulating}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 transition-all disabled:opacity-50 mt-2 border border-amber-200"
              >
                <IconActivity className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{simulating ? 'Simulando pago...' : 'Simular Yape (S/ 15.50)'}</span>
              </button>
            )}
          </nav>
        </div>

        {/* Perfil / Sesión en el Sidebar */}
        <div className="pt-6 border-t border-[#E2E8F0] mt-6 space-y-3">
          <div className="px-2">
            <p className="text-xs font-bold text-[#0F172A] truncate">{user?.email}</p>
            <p className="text-[10px] text-[#64748B] font-mono">Rol: {user?.rol === 'admin' ? 'Super Admin' : 'Comercio / Tienda'}</p>
          </div>

          <button
            onClick={logout}
            className="w-full bg-white hover:bg-red-50 text-[#64748B] hover:text-red-600 border border-[#CBD5E1] hover:border-red-200 text-xs font-semibold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <IconLogOut className="w-4 h-4 shrink-0" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL FULL-SCREEN */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Banner de Auditoría del Super Admin */}
        {viewingTenant && (
          <div className="bg-[#FAF5FF] border-b border-[#E9D5FF] text-[#6B21A8] px-6 py-3 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <IconEye className="w-4 h-4 text-[#7C3AED] shrink-0" />
              <span>Modo Auditoría Super Admin — Viendo la Caja de: <strong className="text-[#581C87] underline">{viewingTenant.nombre_negocio}</strong></span>
            </div>
            <button
              onClick={() => setViewingTenant(null)}
              className="bg-[#6B21A8] text-white hover:bg-[#581C87] px-3 py-1 rounded-lg transition-colors font-medium"
            >
              Volver al Panel Admin
            </button>
          </div>
        )}

        {/* Header Principal de Caja */}
        <header className="h-16 border-b border-[#E2E8F0] px-6 sm:px-10 flex items-center justify-between bg-white sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Terminal de Cobro</span>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-xs font-bold text-[#0F172A]">{tenant?.nombre_negocio || 'Caja Principal'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="yape-badge-verified px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
              <span>SISTEMA VERIFICADO</span>
            </span>
          </div>
        </header>

        {/* Contenido Completo del POS */}
        <div className="flex-1 p-6 sm:p-10 space-y-8 max-w-7xl w-full mx-auto">
          {/* Selector de Fechas (Filtros en el POS) */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E2E8F0] p-2.5 rounded-xl shadow-xs">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs font-bold text-[#64748B] px-3 uppercase tracking-wider">Período:</span>
              <button
                onClick={() => setDateFilter('today')}
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
                  dateFilter === 'today'
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => setDateFilter('yesterday')}
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
                  dateFilter === 'yesterday'
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                }`}
              >
                Ayer
              </button>
              <button
                onClick={() => setDateFilter('last_7_days')}
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
                  dateFilter === 'last_7_days'
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                }`}
              >
                Últimos 7 Días
              </button>
              <button
                onClick={() => setDateFilter('last_30_days')}
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
                  dateFilter === 'last_30_days'
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                }`}
              >
                Últimos 30 Días
              </button>
            </div>

            <button
              onClick={exportToCSV}
              disabled={!transactions || transactions.length === 0}
              className="bg-white hover:bg-[#F8FAFC] text-[#334155] hover:text-[#0F172A] border border-[#CBD5E1] text-xs font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-40 flex items-center gap-2 shadow-xs"
              title="Descargar historial filtrado a archivo CSV / Excel"
            >
              <IconDownload className="w-4 h-4 shrink-0" />
              <span>Exportar Excel/CSV</span>
            </button>
          </div>

          {/* Resumen Contable Minimalista */}
          <CashierSummary 
            summary={summary} 
            includeTests={includeTests} 
            onToggleTests={setIncludeTests} 
            isDemoMode={isDemoMode}
            onOpenCloseModal={() => setIsCloseModalOpen(true)}
            dateLabel={getDateLabel()}
          />

          {/* Historial en Vivo — Carrusel Horizontal Animado de Derecha a Izquierda */}
          <section className="space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-[#E2E8F0] pb-3.5">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                  Historial de Recaudación ({getDateLabel()})
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">Transacciones Yape entrantes en carrusel horizontal de tarjetas en tiempo real</p>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Botones de Navegación del Carrusel Horizontal */}
                <div className="flex items-center bg-white border border-[#E2E8F0] rounded-xl p-0.5 shadow-xs">
                  <button
                    onClick={() => scrollCarousel('left')}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-[#F8FAFC] text-[#475569] hover:text-[#0F172A] transition-colors font-bold text-xs"
                    title="Desplazar carrusel a la izquierda (pagos más recientes)"
                    aria-label="Anterior"
                  >
                    ←
                  </button>
                  <div className="w-px h-4 bg-[#E2E8F0] mx-0.5"></div>
                  <button
                    onClick={() => scrollCarousel('right')}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-[#F8FAFC] text-[#475569] hover:text-[#0F172A] transition-colors font-bold text-xs"
                    title="Desplazar carrusel a la derecha (pagos anteriores)"
                    aria-label="Siguiente"
                  >
                    →
                  </button>
                </div>

                <span className="bg-[#F3E8FF] text-[#6D28D9] text-xs font-mono font-semibold px-3.5 py-1.5 rounded-xl border border-[#E9D5FF] shadow-xs">
                  {transactions.length} pagos
                </span>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="saas-card rounded-2xl py-16 text-center border-dashed border-[#CBD5E1]">
                <p className="text-sm font-semibold text-[#0F172A]">
                  {includeTests ? 'Sin cobros ni pruebas registrados en este periodo' : `No hay pagos reales en el periodo: ${getDateLabel()}`}
                </p>
                <p className="text-xs text-[#64748B] mt-1">
                  Los pagos validados por MacroDroid aparecerán al inicio de este carrusel horizontal con animación
                </p>
              </div>
            ) : (
              <div 
                ref={carouselRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-6 pt-2 px-1 scroll-smooth snap-x snap-mandatory focus:outline-none"
              >
                {transactions.map((yape, index) => (
                  <YapeCard 
                    key={yape.id} 
                    yape={yape} 
                    isNewest={index === 0 && yape.id === lastNewId}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <TenantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tenant={tenant}
        onUpdateName={(newName) => setTenant(prev => ({ ...prev, nombre_negocio: newName }))}
      />

      <CashierCloseModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        summary={summary}
        tenant={tenant}
        transactions={transactions}
      />
    </div>
  );
}

export default App;
