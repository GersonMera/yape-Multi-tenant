import { useEffect, useRef } from 'react';
import { usePusher } from './hooks/usePusher';
import { YapeCard } from './components/YapeCard';

function App() {
  // Simulamos que el comercio inició sesión y su ID es 1
  const tenantId = 1; 
  const { yapeEvents } = usePusher(tenantId);
  const audioRef = useRef(null);

  // Intentar reproducir sonido cada vez que entra un nuevo pago
  useEffect(() => {
    if (yapeEvents.length > 0 && audioRef.current) {
      audioRef.current.play().catch(e => {
        console.warn("Navegador bloqueó el Autoplay del sonido. Haz clic en la pantalla una vez para habilitarlo.");
      });
    }
  }, [yapeEvents.length]);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      {/* 
        Para que esto suene, debes crear una carpeta 'public/sounds/' 
        y poner un archivo MP3 ahí llamado 'yape_alert.mp3'
      */}
      <audio ref={audioRef} src="/sounds/yape_alert.mp3" preload="auto"></audio>

      <header className="mb-12 text-center">
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-yape to-yape-light text-transparent bg-clip-text drop-shadow-sm">
          Panel de Caja
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
            {/* Cabecera de la lista */}
            <div className="flex justify-between items-center px-4 mb-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
              <span>Transacciones Recientes</span>
              <span className="bg-yape/20 text-yape-light px-3 py-1 rounded-full">{yapeEvents.length}</span>
            </div>
            
            {/* Lista de pagos */}
            {yapeEvents.map(yape => (
              <YapeCard key={yape.id} yape={yape} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
