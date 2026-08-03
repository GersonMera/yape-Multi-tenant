import React from 'react';

const formatHora12 = (fechaStr) => {
  if (!fechaStr) return '';
  const date = new Date(fechaStr.replace(' ', 'T'));
  if (isNaN(date.getTime())) return fechaStr;
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

export const YapeCard = ({ yape }) => {
  const isTest = Boolean(yape.is_test);

  return (
    <div className="saas-card-hover rounded-2xl p-6 mb-4 flex items-center justify-between animate-fade-in-up group cursor-default">
      <div className="flex items-center gap-4">
        {/* Ícono Oficial Yape Morado Vibrante */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B2FE5] to-[#661DAB] border border-purple-400/40 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-purple-600/40 group-hover:shadow-purple-500/60 transition-shadow shrink-0">
          Y
        </div>
        
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-xl font-bold text-white tracking-wide">{yape.remitente}</h3>
            {isTest ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 tracking-wider uppercase inline-flex items-center gap-1">
                <span>🧪</span>
                <span>PRUEBA DE SISTEMA</span>
              </span>
            ) : (
              <span className="yape-badge-verified px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase inline-flex items-center gap-1">
                <span>✅</span>
                <span>YAPE VERIFICADO EN VIVO</span>
              </span>
            )}
          </div>
          
          <p className="text-gray-300 text-xs font-medium flex items-center gap-1.5">
            <span className="font-mono text-purple-300">{formatHora12(yape.fecha_hora)}</span>
            <span className="text-gray-500">—</span>
            <span className="text-gray-400">Notificación interbancaria autenticada</span>
          </p>
        </div>
      </div>
      
      {/* Monto Acreditado con Brillo Menta Turquesa */}
      <div className="text-right shrink-0">
        <span className="text-3xl sm:text-4xl font-mono font-extrabold yape-glow-text tracking-tight block">
          +S/ {parseFloat(yape.monto).toFixed(2)}
        </span>
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#00E3A5]/80 block mt-1">
          {isTest ? 'Simulado' : 'Acreditado'}
        </span>
      </div>
    </div>
  );
};
