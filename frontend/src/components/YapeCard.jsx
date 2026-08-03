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
  return (
    <div className="glass rounded-2xl p-6 mb-4 flex items-center justify-between transform transition-all duration-500 hover:scale-[1.02] hover:bg-white/10 animate-fade-in-up group cursor-default">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yape to-yape-light flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-yape/40 group-hover:shadow-yape/60 transition-shadow">
          Y
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white tracking-wide">{yape.remitente}</h3>
            {yape.is_test && (
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/30 tracking-wider">
                🧪 PRUEBA
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm font-medium">
            {formatHora12(yape.fecha_hora)} - Pago Validado
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <span className="text-3xl font-black text-emerald-400 tracking-tight drop-shadow-md">
          +S/ {parseFloat(yape.monto).toFixed(2)}
        </span>
      </div>
    </div>
  );
};
