import { useEffect, useRef, useState, useCallback } from 'react';
import { usePusher } from './hooks/usePusher';
import { YapeCard } from './components/YapeCard';
import { TenantModal } from './components/TenantModal';
import { CashierSummary } from './components/CashierSummary';
import { CashierCloseModal } from './components/CashierCloseModal';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';

function App() {
  const { user, token, loading, logout, viewingTenant, setViewingTenant } = useAuth();

  const activeTenantId = viewingTenant?.id || user?.tenant_id || 1;
  const tenantId = activeTenantId;

  const audioRef = useRef(null);

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
    const enteros = Math.floor(num);
    const centimos = Math.round((num - enteros) * 100);

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

    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();

    let hora12 = hours % 12;
    if (hora12 === 0) hora12 = 12;

    let periodo = "de la mañana";
    if (hours >= 12 && hours < 19) {
      periodo = "de la tarde";
    } else if (hours >= 19 || hours < 5) {
      periodo = "de la noche";
    }

    let textoHora = (hora12 === 1) ? "a la una" : `a las ${hora12}`;

    if (minutes === 0) {
      textoHora += " en punto";
    } else if (minutes === 1) {
      textoHora += " y un minuto";
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
      const utterance = new SpeechSynthesisUtterance(`¡Yape de ${fraseMonto} recibido de ${nombreStr}, ${fraseHora}!`);
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
      const utterance = new SpeechSynthesisUtterance(`¡Yape de ${fraseMonto} recibido de Juan Pérez, ${fraseHora}!`);
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

    // Disparar voz TTS con un ligero retraso de 850ms para no superponerse con el timbre de alerta
    setTimeout(() => {
      speakYape(newTx.monto, newTx.remitente, newTx.fecha_hora_yape || newTx.fecha_hora);
    }, 850);

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
    <div className="min-h-screen bg-[#08090E] flex flex-col md:flex-row text-gray-100">
      <audio ref={audioRef} src="/sounds/yape_alert.mp3" preload="auto"></audio>

      {/* SIDEBAR DE CAJA / POS EMPRESARIAL */}
      <aside className="w-full md:w-64 saas-sidebar flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#171926] p-5 shrink-0">
        <div className="space-y-8">
          {/* Brand & Store */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 bg-[#8B5CF6] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
              Y
            </div>
            <div className="overflow-hidden">
              <span className="font-bold text-white tracking-tight block text-sm truncate">
                {tenant?.nombre_negocio || user?.nombre_negocio || 'Mi Comercio'}
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Yape POS Cajero</span>
            </div>
          </div>

          {/* Nav en el Sidebar */}
          <nav className="space-y-1.5">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">
              Módulos de Caja
            </p>
            
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#8B5CF6] text-white shadow-sm"
            >
              <span>⚡</span>
              <span>Recepción en Vivo</span>
            </button>

            <button
              onClick={() => setIsCloseModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#12141F] transition-all"
            >
              <span>📊</span>
              <span>Cierre de Caja ({getDateLabel()})</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#12141F] transition-all"
            >
              <span>🏢</span>
              <span>Credenciales & API</span>
            </button>

            <div className="pt-2">
              <button
                onClick={toggleVoice}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  voiceEnabled 
                    ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' 
                    : 'bg-[#12131F] text-gray-400 border-[#1E2030]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span>{voiceEnabled ? '🔊' : '🔇'}</span>
                  <span>Voz de Alerta</span>
                </div>
                <span className="text-[10px] font-mono">{voiceEnabled ? 'ACTIVA' : 'SILENCIO'}</span>
              </button>
              <button
                onClick={testVoice}
                className="w-full text-left text-[10px] text-gray-500 hover:text-purple-400 px-3 pt-1 transition-colors underline"
              >
                🔊 Probar volumen de voz TTS
              </button>
            </div>

            {isDemoMode && (
              <button
                onClick={handleSimulate}
                disabled={simulating}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-purple-400 hover:text-white hover:bg-[#12141F] transition-all disabled:opacity-50 mt-2 border border-purple-500/20"
              >
                <span>⚡</span>
                <span>{simulating ? 'Simulando...' : 'Simular Yape (S/ 15.50)'}</span>
              </button>
            )}
          </nav>
        </div>

        {/* Perfil / Sesión en el Sidebar */}
        <div className="pt-6 border-t border-[#171926] mt-6 space-y-3">
          <div className="px-2">
            <p className="text-xs font-bold text-white truncate">{user?.email}</p>
            <p className="text-[10px] text-gray-500 font-mono">Rol: {user?.rol === 'admin' ? 'Super Admin' : 'Comercio'}</p>
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

      {/* ÁREA PRINCIPAL FULL-SCREEN */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Banner de Auditoría del Super Admin */}
        {viewingTenant && (
          <div className="bg-[#1C1236] border-b border-[#362269] text-purple-200 px-6 py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span>👑</span>
              <span>Modo Auditoría Super Admin — Viendo la Caja de: <strong className="text-white underline">{viewingTenant.nombre_negocio}</strong></span>
            </div>
            <button
              onClick={() => setViewingTenant(null)}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg transition-colors"
            >
              Volver al Panel Admin
            </button>
          </div>
        )}

        {/* Header Principal de Caja */}
        <header className="h-16 border-b border-[#171926] px-6 sm:px-10 flex items-center justify-between bg-[#0A0B12]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-400">Terminal POS</span>
            <span className="text-gray-600">/</span>
            <span className="text-xs font-bold text-white">{tenant?.nombre_negocio || 'Caja Principal'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              En Espera de Yapes
            </span>
          </div>
        </header>

        {/* Contenido Completo del POS */}
        <div className="flex-1 p-6 sm:p-10 space-y-8 max-w-7xl w-full mx-auto">
          {/* Selector de Fechas (Filtros en el POS) */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0D0E16] border border-[#1E2030] p-2 rounded-2xl">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-gray-400 px-3">Período:</span>
              <button
                onClick={() => setDateFilter('today')}
                className={`text-xs font-semibold px-4 py-1.5 rounded-xl transition-all ${
                  dateFilter === 'today'
                    ? 'bg-[#8B5CF6] text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-[#141624]'
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => setDateFilter('yesterday')}
                className={`text-xs font-semibold px-4 py-1.5 rounded-xl transition-all ${
                  dateFilter === 'yesterday'
                    ? 'bg-[#8B5CF6] text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-[#141624]'
                }`}
              >
                Ayer
              </button>
              <button
                onClick={() => setDateFilter('last_7_days')}
                className={`text-xs font-semibold px-4 py-1.5 rounded-xl transition-all ${
                  dateFilter === 'last_7_days'
                    ? 'bg-[#8B5CF6] text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-[#141624]'
                }`}
              >
                Últimos 7 Días
              </button>
              <button
                onClick={() => setDateFilter('last_30_days')}
                className={`text-xs font-semibold px-4 py-1.5 rounded-xl transition-all ${
                  dateFilter === 'last_30_days'
                    ? 'bg-[#8B5CF6] text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-[#141624]'
                }`}
              >
                Últimos 30 Días
              </button>
            </div>

            <button
              onClick={exportToCSV}
              disabled={!transactions || transactions.length === 0}
              className="bg-[#12131F] hover:bg-[#181A2A] text-gray-200 hover:text-white border border-[#212338] text-xs font-semibold px-4 py-1.5 rounded-xl transition-colors disabled:opacity-40 flex items-center gap-2"
              title="Descargar historial filtrado a archivo CSV / Excel"
            >
              <span>📥</span>
              <span>Exportar Excel/CSV</span>
            </button>
          </div>

          {/* Resumen Contable Sobrio */}
          <CashierSummary 
            summary={summary} 
            includeTests={includeTests} 
            onToggleTests={setIncludeTests} 
            isDemoMode={isDemoMode}
            onOpenCloseModal={() => setIsCloseModalOpen(true)}
            dateLabel={getDateLabel()}
          />

          {/* Historial en Vivo */}
          <section className="space-y-4">
            <div className="flex justify-between items-center border-b border-[#171926] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Historial de Recaudación ({getDateLabel()})
                </h3>
                <p className="text-xs text-gray-400">Transacciones entrantes verificadas en tiempo real</p>
              </div>
              <span className="bg-[#121420] text-purple-400 text-xs font-mono font-bold px-3 py-1 rounded-lg border border-[#212436]">
                {transactions.length} pagos
              </span>
            </div>

            {transactions.length === 0 ? (
              <div className="saas-card rounded-2xl py-16 text-center border-dashed border-[#1E2030]">
                <p className="text-sm font-semibold text-gray-300">
                  {includeTests ? 'Sin cobros ni pruebas registrados en este periodo' : `No hay pagos reales en el periodo: ${getDateLabel()}`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Los pagos validados por MacroDroid aparecerán en esta lista al instante
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map(yape => (
                  <YapeCard key={yape.id} yape={yape} />
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
