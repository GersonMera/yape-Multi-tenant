import React from 'react';

export const CashierSummary = ({ summary, includeTests, onToggleTests, isDemoMode, onOpenCloseModal }) => {
  const totalReal = summary?.total_real || 0;
  const countReal = summary?.count_real || 0;
  const totalTest = summary?.total_test || 0;
  const countTest = summary?.count_test || 0;

  return (
    <div className="mb-8 space-y-5 animate-fade-in-up">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Tarjeta Principal: Recaudación Real del Día */}
        <div className="glass-card rounded-3xl p-7 border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-black/40 to-black/60 shadow-xl flex items-center justify-between group">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/90 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Recaudación Real (Hoy)</span>
            </span>
            <div className="text-4xl sm:text-5xl font-mono font-black text-white tracking-tight drop-shadow-md group-hover:text-emerald-200 transition-colors">
              S/ {totalReal.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400 font-medium">
              <strong className="text-emerald-300 font-mono font-bold">{countReal}</strong> transacci{countReal === 1 ? 'ón' : 'ones'} reales validadas
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl shadow-inner group-hover:scale-105 transition-transform">
            💵
          </div>
        </div>

        {/* Tarjeta de Pruebas (Solo en Modo Demo) */}
        {isDemoMode && (
          <div className={`glass-card rounded-3xl p-7 border transition-all duration-300 flex items-center justify-between group ${
            includeTests 
              ? 'border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-black/40 to-black/60 shadow-xl' 
              : 'border-white/10 opacity-70 hover:opacity-100'
          }`}>
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Simulaciones (Modo Test)</span>
              </span>
              <div className="text-4xl sm:text-5xl font-mono font-black text-amber-300 tracking-tight drop-shadow-md group-hover:text-amber-200 transition-colors">
                S/ {totalTest.toFixed(2)}
              </div>
              <p className="text-xs text-gray-400 font-medium">
                <strong className="text-amber-300 font-mono font-bold">{countTest}</strong> prueba{countTest === 1 ? '' : 's'} de simulación
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-2xl shadow-inner group-hover:scale-105 transition-transform">
              ⚡
            </div>
          </div>
        )}
      </div>

      {/* Acciones: Botón de Cierre de Caja e Interruptor de Pruebas */}
      <div className="flex flex-wrap justify-between items-center gap-4 px-1">
        <button
          type="button"
          onClick={onOpenCloseModal}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-5 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>📋</span>
          <span>Reporte y Cierre de Caja</span>
        </button>

        {isDemoMode && (
          <button
            type="button"
            onClick={() => onToggleTests(!includeTests)}
            className={`text-xs font-bold px-4 py-2.5 rounded-2xl border transition-all flex items-center gap-2 ${
              includeTests 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm' 
                : 'bg-white/[0.05] text-gray-400 border-white/10 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${includeTests ? 'bg-amber-400 animate-pulse' : 'bg-gray-500'}`}></span>
            <span>{includeTests ? 'Mostrando simulaciones de prueba' : 'Simulaciones ocultas en tabla'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
