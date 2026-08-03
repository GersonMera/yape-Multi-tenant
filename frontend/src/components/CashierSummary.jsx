import React from 'react';
import { IconActivity, IconBarChart } from './Icons';

export const CashierSummary = ({ summary, includeTests, onToggleTests, isDemoMode, onOpenCloseModal, dateLabel = 'Hoy' }) => {
  const totalReal = summary?.total_real || 0;
  const countReal = summary?.count_real || 0;
  const totalTest = summary?.total_test || 0;
  const countTest = summary?.count_test || 0;

  return (
    <div className="space-y-6">
      {/* Tarjetas Ejecutivas de Recaudación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Total Real Validado */}
        <div className="saas-card rounded-xl p-6 border border-[#E2E8F0] flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
              <span>Recaudación Real ({dateLabel})</span>
            </span>
            <div className="text-4xl sm:text-5xl font-mono font-extrabold text-[#0F172A] tracking-tight">
              S/ {totalReal.toFixed(2)}
            </div>
            <p className="text-xs text-[#64748B]">
              <strong className="text-[#0F172A] font-mono font-bold">{countReal}</strong> cobros acreditados
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center text-2xl font-bold shrink-0">
            S/
          </div>
        </div>

        {/* Modo Test - Minimalista */}
        {isDemoMode && (
          <div className={`rounded-xl p-6 border transition-all ${
            includeTests ? 'bg-[#FFFBEB] border-[#FDE68A]' : 'bg-[#FFFFFF] border-[#E2E8F0] opacity-60'
          } flex items-center justify-between shadow-xs`}>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#92400E] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Pruebas y Simulaciones</span>
              </span>
              <div className="text-4xl sm:text-5xl font-mono font-extrabold text-[#78350F] tracking-tight">
                S/ {totalTest.toFixed(2)}
              </div>
              <p className="text-xs text-[#92400E]/80">
                <strong className="text-[#78350F] font-mono font-bold">{countTest}</strong> pruebas en demo
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <IconActivity className="w-6 h-6 text-amber-800" />
            </div>
          </div>
        )}
      </div>

      {/* Acciones del Resumen */}
      <div className="flex flex-wrap justify-between items-center gap-4 pt-1">
        <button
          type="button"
          onClick={onOpenCloseModal}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          <IconBarChart className="w-4 h-4 shrink-0" />
          <span>Generar Reporte de Cierre de Caja</span>
        </button>

        {isDemoMode && (
          <button
            type="button"
            onClick={() => onToggleTests(!includeTests)}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-white hover:bg-[#F8FAFC] text-[#475569] hover:text-[#0F172A] border border-[#CBD5E1] transition-colors flex items-center gap-2"
          >
            <span className={`w-2 h-2 rounded-full ${includeTests ? 'bg-[#16A34A]' : 'bg-[#94A3B8]'}`}></span>
            <span>{includeTests ? 'Simulaciones visibles' : 'Simulaciones ocultas'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
