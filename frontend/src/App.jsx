import { useEffect, useRef, useState, useCallback } from 'react';
import { usePusher } from './hooks/usePusher';
import { YapeCard } from './components/YapeCard';
import { TenantModal } from './components/TenantModal';
import { CashierSummary } from './components/CashierSummary';
import { CashierCloseModal } from './components/CashierCloseModal';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { SubscriptionBlockedScreen } from './components/SubscriptionBlockedScreen';
import { 
  IconActivity, 
  IconBarChart, 
  IconBuilding, 
  IconLogOut, 
  IconVolumeUp, 
  IconVolumeMute, 
  IconEye,
  IconDownload,
  IconCalendar
} from './components/Icons';

function App() {
  const { user, token, loading, logout, viewingTenant, setViewingTenant } = useAuth();

  const activeTenantId = viewingTenant?.id || user?.tenant_id || 1;
  const tenantId = activeTenantId;

  const audioRef = useRef(null);
  const ttsAudioRef = useRef(null);
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

  // Filtro por Fechas: 'today' | 'specific' | 'range'
  const [dateFilterMode, setDateFilterMode] = useState('today');
  const getTodayDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [specificDate, setSpecificDate] = useState(getTodayDateStr());
  const [startDate, setStartDate] = useState(getTodayDateStr());
  const [endDate, setEndDate] = useState(getTodayDateStr());

  // Voz Inteligente TTS Natural
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    return localStorage.getItem('yape_voice_enabled') !== 'false';
  });
  const [voiceGender, setVoiceGender] = useState(() => {
    return localStorage.getItem('yape_voice_gender') || 'female';
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

  const cleanCustomerName = (rawName) => {
    if (!rawName) return '';
    const clean = rawName.trim();
    if (!clean || clean.toLowerCase() === 'desconocido' || clean.toLowerCase() === 'cliente') {
      return '';
    }
    // Tomar solo los dos primeros nombres para que sea una locución rápida y natural
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length > 2) {
      return `${parts[0]} ${parts[1]}`;
    }
    return clean;
  };

  const speakYape = useCallback((monto, remitente) => {
    if (!voiceEnabled) return;

    const fraseMonto = formatMontoParaVoz(monto);
    const nombreCliente = cleanCustomerName(remitente);

    // Frase amigable, alegre y directa
    const textoVoz = nombreCliente
      ? `¡Yape recibido! ${fraseMonto}, de ${nombreCliente}.`
      : `¡Yape recibido! ${fraseMonto}.`;

    const voiceCode = voiceGender === 'female' ? 'camila' : 'alex';
    const audioUrl = `/yape/backend/public/api/tts.php?text=${encodeURIComponent(textoVoz)}&voice=${voiceCode}`;

    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
    }
    ttsAudioRef.current = new Audio(audioUrl);
    ttsAudioRef.current.play().catch(e => {
      console.warn("Fallo reproducción de TTS neural, intentando síntesis de navegador:", e);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(textoVoz);
        u.lang = 'es-PE';
        window.speechSynthesis.speak(u);
      }
    });
  }, [voiceEnabled, voiceGender]);

  const testVoice = (gender = voiceGender) => {
    const fraseMonto = formatMontoParaVoz(25.00);
    const textoVoz = `¡Yape recibido! ${fraseMonto}, de Juan Pérez.`;
    const voiceCode = gender === 'female' ? 'camila' : 'alex';
    const audioUrl = `/yape/backend/public/api/tts.php?text=${encodeURIComponent(textoVoz)}&voice=${voiceCode}`;

    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
    }
    ttsAudioRef.current = new Audio(audioUrl);
    ttsAudioRef.current.play().catch(e => {
      console.warn("Error reproduciendo audio neural:", e);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(textoVoz);
        u.lang = 'es-PE';
        window.speechSynthesis.speak(u);
      }
    });
  };

  const isDemoMode = import.meta.env.VITE_MODE === 'demo' && user?.rol === 'admin';

  const handleNewYape = useCallback((newTx) => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => {
        console.warn("Navegador bloqueó el Autoplay del sonido.");
      });
    }

    // Invocación instantánea sin retrasos (0ms delay)
    speakYape(newTx.monto, newTx.remitente);

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

  const fetchTenant = useCallback(async () => {
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
  }, [activeTenantId, token]);

  useEffect(() => {
    if (user) {
      fetchTenant();
    }
  }, [fetchTenant, user]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        let url = `/yape/backend/public/api/transactions.php?include_tests=${includeTests ? '1' : '0'}&tenant_id=${activeTenantId}`;
        if (dateFilterMode === 'today') {
          url += `&filter=today`;
        } else if (dateFilterMode === 'specific') {
          url += `&filter=specific_date&start_date=${specificDate}`;
        } else if (dateFilterMode === 'range') {
          url += `&filter=range&start_date=${startDate}&end_date=${endDate}`;
        }

        const res = await fetch(url, {
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
  }, [includeTests, dateFilterMode, specificDate, startDate, endDate, token, activeTenantId, user]);

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
    link.setAttribute('download', `Recaudacion_Yape_${tenant?.nombre_negocio || 'POS'}_${dateFilterMode}_${getDateLabel().replace(/[/ ]/g, '_')}.csv`);
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

  const isSubscriptionExpired = Boolean(
    tenant?.suscripcion?.is_expired || tenant?.estado === 'Suspendido'
  );

  // Si es un comercio afiliado y su suscripción está vencida o suspendida, se bloquea la pantalla
  if (user.rol === 'comercio' && isSubscriptionExpired) {
    return (
      <SubscriptionBlockedScreen 
        tenant={tenant} 
        onLogout={logout} 
        onRefresh={fetchTenant} 
      />
    );
  }

  const getDateLabel = () => {
    if (dateFilterMode === 'today') return 'Hoy';
    if (dateFilterMode === 'specific') {
      const parts = specificDate.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return specificDate;
    }
    if (dateFilterMode === 'range') {
      const f1 = startDate ? startDate.split('-').reverse().join('/') : '';
      const f2 = endDate ? endDate.split('-').reverse().join('/') : '';
      return `${f1} al ${f2}`;
    }
    return 'Hoy';
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

            <div className="pt-2 space-y-2">
              <button
                onClick={toggleVoice}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  voiceEnabled 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs' 
                    : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {voiceEnabled ? <IconVolumeUp className="w-4 h-4 text-emerald-600 shrink-0" /> : <IconVolumeMute className="w-4 h-4 text-[#64748B] shrink-0" />}
                  <span>Voz de Alerta</span>
                </div>
                <span className="text-[10px] font-mono font-bold">{voiceEnabled ? 'ACTIVA' : 'SILENCIO'}</span>
              </button>

              {voiceEnabled && (
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2.5 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#64748B]">
                    <span>Tono de Voz:</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setVoiceGender('female');
                          localStorage.setItem('yape_voice_gender', 'female');
                          testVoice('female');
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          voiceGender === 'female'
                            ? 'bg-[#7C3AED] text-white shadow-2xs'
                            : 'bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
                        }`}
                      >
                        👩 Camila (Perú)
                      </button>
                      <button
                        onClick={() => {
                          setVoiceGender('male');
                          localStorage.setItem('yape_voice_gender', 'male');
                          testVoice('male');
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          voiceGender === 'male'
                            ? 'bg-[#7C3AED] text-white shadow-2xs'
                            : 'bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
                        }`}
                      >
                        👨 Alex (Perú)
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => testVoice(voiceGender)}
                    className="w-full text-center text-[11px] text-[#7C3AED] hover:text-[#6D28D9] font-semibold py-1 bg-white hover:bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <IconVolumeUp className="w-3.5 h-3.5" />
                    <span>Escuchar prueba de voz</span>
                  </button>
                </div>
              )}
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

        {/* Alerta de Suscripción Vencida para Super Admin */}
        {viewingTenant && isSubscriptionExpired && (
          <div className="bg-red-50 border-b border-red-200 text-red-700 px-6 py-2.5 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0"></span>
              <span>
                <strong>Atención Super Admin:</strong> La suscripción de este comercio está <strong>{tenant?.suscripcion?.texto || 'VENCIDA'}</strong>. La pantalla del cajero se encuentra bloqueada actualmente.
              </span>
            </div>
            <button
              onClick={() => setViewingTenant(null)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors font-semibold text-[11px]"
            >
              Ir a Renovar en el Panel
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
          {/* Selector de Fechas Avanzado (Hoy / Fecha Específica / Rango de Fechas) */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E2E8F0] p-3 rounded-xl shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#64748B] px-2 uppercase tracking-wider">Período:</span>

              {/* Botón Hoy */}
              <button
                onClick={() => setDateFilterMode('today')}
                className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-all ${
                  dateFilterMode === 'today'
                    ? 'bg-[#7C3AED] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                }`}
              >
                Hoy
              </button>

              {/* Botón Fecha Específica */}
              <button
                onClick={() => setDateFilterMode('specific')}
                className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  dateFilterMode === 'specific'
                    ? 'bg-[#7C3AED] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                }`}
              >
                <IconCalendar className="w-3.5 h-3.5" />
                <span>Fecha Específica</span>
              </button>

              {/* Botón Rango de Fechas */}
              <button
                onClick={() => setDateFilterMode('range')}
                className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  dateFilterMode === 'range'
                    ? 'bg-[#7C3AED] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                }`}
              >
                <span>Rango de Fechas</span>
              </button>

              {/* Selector para Fecha Específica */}
              {dateFilterMode === 'specific' && (
                <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-1.5 rounded-xl ml-1 animate-fade-in">
                  <span className="text-[11px] font-bold text-[#64748B]">Día:</span>
                  <input
                    type="date"
                    value={specificDate}
                    onChange={(e) => setSpecificDate(e.target.value)}
                    className="text-xs font-bold text-[#0F172A] bg-transparent outline-none cursor-pointer font-mono"
                  />
                </div>
              )}

              {/* Selectores para Rango de Fechas */}
              {dateFilterMode === 'range' && (
                <div className="flex items-center gap-2 ml-1 flex-wrap animate-fade-in">
                  <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-1.5 rounded-xl">
                    <span className="text-[11px] font-bold text-[#64748B]">Desde:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="text-xs font-bold text-[#0F172A] bg-transparent outline-none cursor-pointer font-mono"
                    />
                  </div>
                  <span className="text-xs font-bold text-[#94A3B8]">al</span>
                  <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-1.5 rounded-xl">
                    <span className="text-[11px] font-bold text-[#64748B]">Hasta:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="text-xs font-bold text-[#0F172A] bg-transparent outline-none cursor-pointer font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
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
        dateLabel={getDateLabel()}
      />
    </div>
  );
}

export default App;
