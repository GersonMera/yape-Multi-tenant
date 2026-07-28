import React from 'react';

export const CashierSummary = ({ summary, includeTests, onToggleTests, isDemoMode, onOpenCloseModal }) => {
  const totalReal = summary?.total_real || 0;
  const countReal = summary?.count_real || 0;
  const totalTest = summary?.total_test || 0;
  const countTest = summary?.count_test || 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Recaudación Real - Sobria Corporativa */}
        <div className="saas-card rounded-2xl p-6 border border-[#1E2030] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Recaudación Real (Hoy)</span>
            </span>
            <div className="text-4xl font-mono font-bold text-white tracking-tight">
              S/ {totalReal.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">
              <strong className="text-gray-300 font-mono">{countReal}</strong> transacciones verificadas
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#131420] border border-[#212436] flex items-center justify-center text-xl">
            💵
          </div>
        </div>

        {/* Modo Test - Sobrio Corporativo */}
        {isDemoMode && (
          <div className={`saas-card rounded-2xl p-6 border transition-all ${
            includeTests ? 'border-[#2D3047]' : 'border-[#171926] opacity-60'
          } flex items-center justify-between`}>
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span>Modo Test (Simulado)</span>
              </span>
              <div className="text-4xl font-mono font-bold text-gray-200 tracking-tight">
                S/ {totalTest.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500">
                <strong className="text-gray-300 font-mono">{countTest}</strong> pruebas de simulación
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#131420] border border-[#212436] flex items-center justify-center text-xl">
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
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          <span>📊</span>
          <span>Generar Reporte de Cierre</span>
        </button>

        {isDemoMode && (
          <button
            type="button"
            onClick={() => onToggleTests(!includeTests)}
            className="text-xs font-medium px-3.5 py-2 rounded-xl bg-[#11121C] hover:bg-[#181A29] text-gray-400 hover:text-white border border-[#1D2030] transition-colors flex items-center gap-2"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${includeTests ? 'bg-purple-400' : 'bg-gray-600'}`}></span>
            <span>{includeTests ? 'Simulaciones visibles en historial' : 'Simulaciones ocultas'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
