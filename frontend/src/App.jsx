import { useEffect, useRef, useState } from 'react';
import { usePusher } from './hooks/usePusher';
import { YapeCard } from './components/YapeCard';
import { TenantModal } from './components/TenantModal';

function App() {
  const tenantId = 1; 
  const { yapeEvents } = usePusher(tenantId);
  const audioRef = useRef(null);

  const [tenant, setTenant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const isDemoMode = import.meta.env.VITE_MODE === 'demo';

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

  // Intentar reproducir sonido cada vez que entra un nuevo pago
  useEffect(() => {
    if (yapeEvents.length > 0 && audioRef.current) {
      audioRef.current.play().catch(e => {
        console.warn("Navegador bloqueó el Autoplay del sonido. Haz clic en la pantalla una vez para habilitarlo.");
      });
    }
  }, [yapeEvents.length]);

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

      <header className="mb-12 text-center">
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-yape to-yape-light text-transparent bg-clip-text drop-shadow-sm">
          {tenant?.nombre_negocio || 'Panel de Caja'}
        </h1>
        <p className="text-gray-400 font-medium">Validación de pagos en tiempo real</p>
      </header>

      <main>
        {yapeEvents.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl border-dashed border border-white/20 shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-fast shadow-inner border border-white/5">
              <span className="text-3xl">👀</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-200 tracking-tight">Esperando el primer Yape...</h2>
            <p className="text-gray-400 mt-2">Los pagos aparecerán aquí mágicamente</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center px-4 mb-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
              <span>Transacciones Recientes</span>
              <span className="bg-yape/20 text-yape-light px-3 py-1 rounded-full">{yapeEvents.length}</span>
            </div>
            
            {yapeEvents.map(yape => (
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
