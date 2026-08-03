import React from 'react';

export const CashierSummary = ({ summary, includeTests, onToggleTests, isDemoMode, onOpenCloseModal, dateLabel = 'Hoy' }) => {
  const totalReal = summary?.total_real || 0;
  const countReal = summary?.count_real || 0;
  const totalTest = summary?.total_test || 0;
  const countTest = summary?.count_test || 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Recaudación Real - Yape Royal Glass */}
        <div className="saas-card rounded-2xl p-6 border border-purple-500/40 bg-gradient-to-br from-[#2D1546]/90 to-[#1F0E32]/90 shadow-xl shadow-purple-950/60 flex items-center justify-between">
          <div className="space-y-2">
            <span className="yape-badge-verified px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00E3A5] animate-pulse"></span>
              <span>RECAUDACIÓN EN VIVO ({dateLabel})</span>
            </span>
            <div className="text-4xl sm:text-5xl font-mono font-extrabold yape-glow-text tracking-tight">
              S/ {totalReal.toFixed(2)}
            </div>
            <p className="text-xs text-purple-200">
              <strong className="text-white font-mono font-bold">{countReal}</strong> cobros Yape acreditados
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#8B2FE5]/20 border border-[#00E3A5]/40 flex items-center justify-center text-2xl shadow-lg shadow-teal-500/10 shrink-0">
            🛡️
          </div>
        </div>

        {/* Modo Test - Yape Test Glass */}
        {isDemoMode && (
          <div className={`saas-card rounded-2xl p-6 border transition-all ${
            includeTests ? 'border-amber-500/40 bg-gradient-to-br from-[#2D1B28]/90 to-[#1F1122]/90' : 'border-purple-900/30 opacity-60'
          } flex items-center justify-between`}>
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30 inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>PRUEBAS Y SIMULACIONES</span>
              </span>
              <div className="text-4xl sm:text-5xl font-mono font-bold text-amber-300 tracking-tight">
                S/ {totalTest.toFixed(2)}
              </div>
              <p className="text-xs text-amber-200/80">
                <strong className="text-white font-mono font-bold">{countTest}</strong> pruebas en entorno demo
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-2xl shrink-0">
              ⚡
            </div>
          </div>
        )}
      </div>

      {/* Acciones del Resumen */}
      <div className="flex flex-wrap justify-between items-center gap-4 pt-1">
        <button
          type="button"
          onClick={onOpenCloseModal}
          className="bg-gradient-to-r from-[#8B2FE5] to-[#661DAB] hover:from-[#9B42FF] hover:to-[#7B24CC] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-lg shadow-purple-600/40 flex items-center gap-2 border border-purple-400/30"
        >
          <span>📊</span>
          <span>Generar Reporte de Cierre de Caja</span>
        </button>

        {isDemoMode && (
          <button
            type="button"
            onClick={() => onToggleTests(!includeTests)}
            className="text-xs font-medium px-4 py-2.5 rounded-xl bg-[#231236] hover:bg-[#2F1948] text-purple-300 hover:text-white border border-purple-500/30 transition-colors flex items-center gap-2"
          >
            <span className={`w-2 h-2 rounded-full ${includeTests ? 'bg-[#00E3A5]' : 'bg-gray-500'}`}></span>
            <span>{includeTests ? 'Simulaciones visibles en historial' : 'Simulaciones ocultas'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
