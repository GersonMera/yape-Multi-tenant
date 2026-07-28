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

  // Determinamos el tenant activo: inspeccionado (Super Admin), o propio (Tenant), o 1 por defecto
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

  const isDemoMode = import.meta.env.VITE_MODE === 'demo';

  // Callback sincronizado para nuevos pagos recibidos por WebSocket
  const handleNewYape = useCallback((newTx) => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => {
        console.warn("Navegador bloqueó el Autoplay del sonido. Haz clic en la pantalla una vez para habilitarlo.");
      });
    }

    const isTest = Boolean(newTx.is_test);
    const montoNum = parseFloat(newTx.monto) || 0;

    // Actualizamos el resumen del día en vivo
    setSummary(prev => ({
      ...prev,
      total_real: !isTest ? prev.total_real + montoNum : prev.total_real,
      count_real: !isTest ? prev.count_real + 1 : prev.count_real,
      total_test: isTest ? prev.total_test + montoNum : prev.total_test,
      count_test: isTest ? prev.count_test + 1 : prev.count_test,
    }));

    // Si es una transacción real, siempre se añade; si es test, solo si includeTests está activo
    setTransactions(prev => {
      if (!isTest || includeTests) {
        return [newTx, ...prev];
      }
      return prev;
    });
  }, [includeTests]);

  // Suscripción en vivo al canal del tenant activo
  usePusher(tenantId, handleNewYape);

  // Obtener datos seguros del tenant desde el backend
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

  // Cargar historial persistente del día desde MySQL
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/yape/backend/public/api/transactions.php?include_tests=${includeTests ? '1' : '0'}&tenant_id=${activeTenantId}`, {
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
  }, [includeTests, token, activeTenantId, user]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white font-semibold">
        <div className="flex items-center gap-3">
          <span className="animate-spin text-2xl">↻</span>
          <span>Cargando Yape POS SaaS...</span>
        </div>
      </div>
    );
  }

  // Si no ha iniciado sesión, mostrar pantalla de Login
  if (!user) {
    return <LoginPage />;
  }

  // Si es Super Admin y no está auditando una caja en particular, mostrar Panel SaaS
  if (user.rol === 'admin' && !viewingTenant) {
    return <SuperAdminDashboard />;
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <audio ref={audioRef} src="/sounds/yape_alert.mp3" preload="auto"></audio>

      {/* Banner especial si el Super Admin está inspeccionando esta caja */}
      {viewingTenant && (
        <div className="bg-gradient-to-r from-purple-900/90 to-indigo-900/90 text-purple-100 px-5 py-3 rounded-2xl mb-6 flex items-center justify-between text-xs font-bold border border-purple-500/30 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-base">👑</span>
            <span>Modo Auditoría Super Admin — Viendo la Caja de: <strong className="text-white underline">{viewingTenant.nombre_negocio}</strong></span>
          </div>
          <button
            onClick={() => setViewingTenant(null)}
            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl border border-white/20 transition-colors"
          >
            ⬅ Volver al Panel Admin
          </button>
        </div>
      )}

      {/* Barra superior multi-rol */}
      <nav className="mb-8 flex flex-wrap items-center justify-between gap-4 glass rounded-2xl p-4 border border-white/10 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
            {tenant?.nombre_negocio || user?.nombre_negocio} <span className="text-gray-500">({user?.email})</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCloseModalOpen(true)}
            className="bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
          >
            <span>📊</span> Cierre de Caja
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all border border-white/10 flex items-center gap-1.5"
          >
            <span>🏢</span> Credenciales
          </button>

          {isDemoMode && (
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>⚡</span> {simulating ? 'Simulando...' : 'Simular Yape (S/ 15.50)'}
            </button>
          )}

          <button
            onClick={logout}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center gap-1 ml-1"
            title="Cerrar Sesión"
          >
            <span>🚪</span> Salir
          </button>
        </div>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-yape to-yape-light text-transparent bg-clip-text drop-shadow-sm">
          {tenant?.nombre_negocio || 'Panel de Caja'}
        </h1>
        <p className="text-gray-400 font-medium">Validación de pagos en tiempo real</p>
      </header>

      {/* Resumen del Día y Toggle de Pruebas */}
      <CashierSummary 
        summary={summary} 
        includeTests={includeTests} 
        onToggleTests={setIncludeTests} 
        isDemoMode={isDemoMode}
        onOpenCloseModal={() => setIsCloseModalOpen(true)}
      />

      <main>
        {transactions.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl border-dashed border border-white/20 shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-fast shadow-inner border border-white/5">
              <span className="text-3xl">👀</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-200 tracking-tight">
              {includeTests ? 'Sin pagos ni pruebas en el día de hoy' : 'Esperando el primer Yape real del día...'}
            </h2>
            <p className="text-gray-400 mt-2">Los pagos validados aparecerán aquí mágicamente</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center px-4 mb-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
              <span>Historial del Día (Hoy)</span>
              <span className="bg-yape/20 text-yape-light px-3 py-1 rounded-full">{transactions.length}</span>
            </div>
            
            {transactions.map(yape => (
              <YapeCard key={yape.id} yape={yape} />
            ))}
          </div>
        )}
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
