import { useEffect, useRef, useState, useCallback } from 'react';
import { usePusher } from './hooks/usePusher';
import { YapeCard } from './components/YapeCard';
import { TenantModal } from './components/TenantModal';
import { CashierSummary } from './components/CashierSummary';

function App() {
  const tenantId = 1; 
  const audioRef = useRef(null);

  const [tenant, setTenant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      total_real: isTest ? (prev.total_real || 0) : (prev.total_real || 0) + montoNum,
      count_real: isTest ? (prev.count_real || 0) : (prev.count_real || 0) + 1,
      total_test: isTest ? (prev.total_test || 0) + montoNum : (prev.total_test || 0),
      count_test: isTest ? (prev.count_test || 0) + 1 : (prev.count_test || 0),
    }));

    // Agregamos a la lista si corresponde según el filtro actual
    if (!isTest || includeTests) {
      setTransactions(prev => [newTx, ...prev]);
    }
  }, [includeTests]);

  usePusher(tenantId, handleNewYape);

  // Obtener datos seguros del tenant desde el backend
  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const res = await fetch('/yape/backend/public/api/tenant.php', {
          method: 'GET',
          headers: {
            'X-Admin-Secret': import.meta.env.VITE_ADMIN_SECRET || 'demo_admin_secret'
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
    fetchTenant();
  }, []);

  // Cargar historial persistente del día desde MySQL
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/yape/backend/public/api/transactions.php?include_tests=${includeTests ? '1' : '0'}`, {
          method: 'GET',
          headers: {
            'X-Admin-Secret': import.meta.env.VITE_ADMIN_SECRET || 'demo_admin_secret'
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
    fetchHistory();
  }, [includeTests]);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await fetch('/yape/backend/public/api/tenant.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': import.meta.env.VITE_ADMIN_SECRET || 'demo_admin_secret'
        },
        body: JSON.stringify({ action: 'simulate' })
      });
    } catch (e) {
      console.error('Error al simular pago:', e);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <audio ref={audioRef} src="/sounds/yape_alert.mp3" preload="auto"></audio>

      {/* Barra superior en modo demo */}
      {isDemoMode && (
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4 glass rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Modo Demo Activo
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all border border-white/10 flex items-center gap-1.5"
            >
              <span>🏢</span> Credenciales & Configuración
            </button>
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>⚡</span> {simulating ? 'Simulando...' : 'Simular Yape (S/ 15.50)'}
            </button>
          </div>
        </nav>
      )}

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
    </div>
  );
}

export default App;
