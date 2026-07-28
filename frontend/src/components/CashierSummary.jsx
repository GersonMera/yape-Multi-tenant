import React from 'react';

export const CashierSummary = ({ summary, includeTests, onToggleTests, isDemoMode, onOpenCloseModal }) => {
  const totalReal = summary?.total_real || 0;
  const countReal = summary?.count_real || 0;
  const totalTest = summary?.total_test || 0;
  const countTest = summary?.count_test || 0;

  return (
    <div className="mb-8 space-y-4 animate-fade-in-up">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tarjeta Principal: Recaudación Real del Día */}
        <div className="glass rounded-3xl p-6 border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-black/40 to-black/60 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400/80 flex items-center gap-1.5">
              <span>💰</span> Recaudación Real de Hoy
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
              S/ {totalReal.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400 font-medium">
              {countReal} transacci{countReal === 1 ? 'ón' : 'ones'} reales
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl shadow-inner">
            💵
          </div>
        </div>

        {/* Tarjeta de Pruebas (Solo en Modo Demo) */}
        {isDemoMode && (
          <div className={`glass rounded-3xl p-6 border transition-all duration-300 flex items-center justify-between ${
            includeTests 
              ? 'border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-black/40 to-black/60 shadow-xl' 
              : 'border-white/10 opacity-60 hover:opacity-100'
          }`}>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400/80 flex items-center gap-1.5">
                <span>🧪</span> Simulaciones (Modo Test)
              </span>
              <div className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight drop-shadow-md">
                S/ {totalTest.toFixed(2)}
              </div>
              <p className="text-xs text-gray-400 font-medium">
                {countTest} prueba{countTest === 1 ? '' : 's'} de simulación
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-2xl shadow-inner">
              ⚡
            </div>
          </div>
        )}
      </div>

      {/* Acciones: Botón de Cierre de Caja e Interruptor de Pruebas */}
      <div className="flex flex-wrap justify-between items-center gap-4 px-2">
        <button
          type="button"
          onClick={onOpenCloseModal}
          className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <span>📊</span> Reporte de Cierre de Caja
        </button>

        {isDemoMode && (
          <button
            type="button"
            onClick={() => onToggleTests(!includeTests)}
            className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
              includeTests 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm' 
                : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
            }`}
          >
            <span>{includeTests ? '🟢' : '⚪'}</span>
            <span>{includeTests ? 'Mostrando pruebas en historial' : 'Ocultando pruebas en historial'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
