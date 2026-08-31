import React, { useState } from 'react';
import { IconBarChart, IconFileText } from './Icons';

export const CashierCloseModal = ({ isOpen, onClose, tenant, transactions = [], summary, dateLabel }) => {
  const [copyMsg, setCopyMsg] = useState(false);

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalReal = summary?.total_real || 0;
  const countReal = summary?.count_real || 0;
  const totalTest = summary?.total_test || 0;
  const countTest = summary?.count_test || 0;
  const totalGeneral = totalReal + totalTest;

  const generateReportText = () => {
    const lines = [
      `*REPORTE DE CIERRE DE CAJA - YAPE POS*`,
      `==================================`,
      `*Comercio:* ${tenant?.nombre_negocio || 'Panel de Caja'}`,
      `*Período:* ${dateLabel || todayStr}`,
      `----------------------------------`,
      `*Cobros Reales Verificados:*`,
      `- Cantidad: ${countReal} transacciones`,
      `- Total Real: S/ ${totalReal.toFixed(2)}`,
      `----------------------------------`,
      `*Simulaciones de Prueba:*`,
      `- Cantidad: ${countTest} pruebas`,
      `- Total Simulado: S/ ${totalTest.toFixed(2)}`,
      `==================================`,
      `*MONTO GENERAL:* S/ ${totalGeneral.toFixed(2)}`,
      `==================================`,
      `Sistema Yape POS Control Institucional`
    ];
    return lines.join('\n');
  };

  const handleCopyReport = () => {
    const text = generateReportText();
    navigator.clipboard.writeText(text);
    setCopyMsg(true);
    setTimeout(() => setCopyMsg(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl p-7 border border-[#E2E8F0] space-y-6 max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Cabecera del Reporte */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-[#7C3AED] border border-[#E9D5FF] flex items-center justify-center shrink-0">
              <IconBarChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Reporte de Cierre de Caja</h3>
              <p className="text-xs text-[#64748B] capitalize">{todayStr}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0F172A] text-base font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Local info */}
        <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] text-center">
          <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Sucursal / Comercio</p>
          <p className="text-lg font-bold text-[#0F172A] mt-0.5">{tenant?.nombre_negocio || 'Panel de Caja'}</p>
        </div>

        {/* Cifras contables */}
        <div className="space-y-3">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-semibold text-[#64748B] uppercase">Total Recaudado (Real)</p>
              <p className="text-2xl font-mono font-bold text-[#0F172A] mt-1">S/ {totalReal.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <span className="bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] text-xs font-mono font-semibold px-3 py-1 rounded-lg">
                {countReal} transacci{countReal === 1 ? 'ón' : 'ones'}
              </span>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-semibold text-[#64748B] uppercase">Simulaciones (Test)</p>
              <p className="text-lg font-mono font-bold text-[#475569] mt-1">S/ {totalTest.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <span className="bg-[#F8FAFC] text-[#64748B] text-xs font-mono font-semibold px-3 py-1 rounded-lg border border-[#E2E8F0]">
                {countTest} prueba{countTest === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-4 flex items-center justify-between">
            <span className="text-sm font-bold text-[#0F172A] uppercase">Consolidado Total</span>
            <span className="text-xl font-mono font-extrabold text-[#7C3AED]">S/ {totalGeneral.toFixed(2)}</span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleCopyReport}
            className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <IconFileText className="w-4 h-4 shrink-0" />
            <span>{copyMsg ? '¡Copiado al Portapapeles!' : 'Copiar Resumen para WhatsApp'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#334155] hover:text-[#0F172A] text-xs font-semibold py-3 px-5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <span>Imprimir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
