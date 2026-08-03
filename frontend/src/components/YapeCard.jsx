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

export const YapeCard = ({ yape, isNewest }) => {
  const isTest = Boolean(yape.is_test);

  return (
    <div 
      className={`w-80 sm:w-88 rounded-2xl p-6 flex flex-col justify-between shrink-0 snap-start select-none transition-all ${
        isNewest
          ? 'animate-yape-carousel-enter bg-gradient-to-br from-white via-white to-[#FAF5FF] border-2 border-[#7C3AED] shadow-lg ring-4 ring-[#7C3AED]/10'
          : 'saas-card-hover border border-[#E2E8F0] shadow-xs'
      }`}
    >
      {/* Cabecera de la Tarjeta Carrusel */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#7C3AED] text-white font-bold text-lg flex items-center justify-center shadow-xs shrink-0">
            Y
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
              Cobro Recibido
            </span>
            <span className="text-xs font-semibold text-[#0F172A]">
              Yape Interbancario
            </span>
          </div>
        </div>

        <div>
          {isTest ? (
            <span className="bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-lg text-[10px] font-semibold inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>SIMULACIÓN</span>
            </span>
          ) : (
            <span className="yape-badge-verified px-2.5 py-1 rounded-lg text-[10px] font-semibold inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
              <span>VERIFICADO</span>
            </span>
          )}
        </div>
      </div>

      {/* Cuerpo Contable y Remitente */}
      <div className="my-5">
        <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight truncate" title={yape.remitente}>
          {yape.remitente}
        </h3>

        <div className="text-3xl sm:text-4xl font-mono font-extrabold text-[#059669] tracking-tight my-2">
          +S/ {parseFloat(yape.monto).toFixed(2)}
        </div>

        <p className="text-[11px] text-[#64748B] font-medium">
          {isTest ? 'Transacción de prueba en modo demostración' : 'Cobro auténtico acreditado y validado en tiempo real'}
        </p>
      </div>

      {/* Pie de Tarjeta y Marca de Tiempo */}
      <div className="border-t border-[#E2E8F0] pt-3.5 mt-2 flex items-center justify-between text-xs text-[#64748B]">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[#334155] font-bold">{formatHora12(yape.fecha_hora)}</span>
        </div>
        <span className="text-[11px] font-mono text-[#7C3AED] font-semibold bg-[#F3E8FF] px-2 py-0.5 rounded-md">
          REF #{yape.id}
        </span>
      </div>
    </div>
  );
};
