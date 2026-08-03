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
    <div className="saas-card-hover rounded-xl p-5 mb-3 flex items-center justify-between animate-fade-in group cursor-default">
      <div className="flex items-center gap-4">
        {/* Ícono Corporativo Yape Morado */}
        <div className="w-12 h-12 rounded-xl bg-[#7C3AED] text-white font-bold text-xl flex items-center justify-center shadow-sm shrink-0">
          Y
        </div>
        
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">{yape.remitente}</h3>
            {isTest ? (
              <span className="bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-0.5 rounded-md text-[11px] font-semibold inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>SIMULACIÓN</span>
              </span>
            ) : (
              <span className="yape-badge-verified px-2.5 py-0.5 rounded-md text-[11px] font-semibold inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
                <span>VERIFICADO</span>
              </span>
            )}
          </div>
          
          <p className="text-[#64748B] text-xs font-medium flex items-center gap-1.5">
            <span className="font-mono text-[#475569]">{formatHora12(yape.fecha_hora)}</span>
            <span className="text-[#CBD5E1]">•</span>
            <span>Notificación interbancaria</span>
          </p>
        </div>
      </div>
      
      {/* Monto Contable Sobrio */}
      <div className="text-right shrink-0">
        <span className="text-2xl sm:text-3xl font-mono font-bold text-[#059669] tracking-tight block">
          +S/ {parseFloat(yape.monto).toFixed(2)}
        </span>
        <span className="text-[11px] font-semibold text-[#64748B] block mt-0.5">
          {isTest ? 'Simulado' : 'Acreditado'}
        </span>
      </div>
    </div>
  );
};
