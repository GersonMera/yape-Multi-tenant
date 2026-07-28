import React, { useState } from 'react';

export const CashierCloseModal = ({ isOpen, onClose, summary, tenant, transactions }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalReal = summary?.total_real || 0;
  const countReal = summary?.count_real || 0;
  const totalTest = summary?.total_test || 0;
  const countTest = summary?.count_test || 0;

  const todayStr = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleCopyWhatsApp = () => {
    const lines = [
      `📊 *REPORTE DE CIERRE DE CAJA - YAPE*`,
      `🏢 *Local:* ${tenant?.nombre_negocio || 'Panel de Caja'}`,
      `📅 *Fecha:* ${todayStr}`,
      `----------------------------------`,
      `💰 *RECAUDACIÓN REAL:* S/ ${totalReal.toFixed(2)}`,
      `🔢 *Pagos Reales Validados:* ${countReal}`,
      `----------------------------------`,
      `🧪 *Simulaciones (Pruebas):* S/ ${totalTest.toFixed(2)} (${countTest} pruebas)`,
      `----------------------------------`,
      `✅ _Generado por Sistema Yape POS SaaS_`
    ];
    
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg saas-card rounded-2xl p-7 border border-[#1E2030] space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Cabecera del Reporte */}
        <div className="flex items-center justify-between border-b border-[#1E2030] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#131420] border border-[#212436] flex items-center justify-center text-xl">
              📊
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Reporte de Cierre de Caja</h3>
              <p className="text-xs text-gray-400 capitalize">{todayStr}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-base"
          >
            ✕
          </button>
        </div>

        {/* Local info */}
        <div className="bg-[#10111A] rounded-xl p-4 border border-[#1C1E2D] text-center">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sucursal / Comercio</p>
          <p className="text-lg font-bold text-white mt-0.5">{tenant?.nombre_negocio || 'Panel de Caja'}</p>
        </div>

        {/* Cifras contables */}
        <div className="space-y-3">
          <div className="bg-[#11121C] border border-[#1E2030] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Total Recaudado (Real)</p>
              <p className="text-2xl font-mono font-bold text-white mt-1">S/ {totalReal.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <span className="bg-[#161826] text-gray-300 text-xs font-mono font-semibold px-3 py-1 rounded-lg border border-[#23263C]">
                {countReal} transacci{countReal === 1 ? 'ón' : 'ones'}
              </span>
            </div>
          </div>

          <div className="bg-[#11121C] border border-[#1E2030] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Simulaciones (Test)</p>
              <p className="text-lg font-mono font-bold text-gray-300 mt-1">S/ {totalTest.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <span className="bg-[#161826] text-gray-400 text-xs font-mono font-semibold px-3 py-1 rounded-lg border border-[#23263C]">
                {countTest} prueba{countTest === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleCopyWhatsApp}
            className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold py-3 px-4 rounded-xl transition-all text-xs flex items-center justify-center gap-2"
          >
            <span>{copied ? '✅' : '💬'}</span>
            <span>{copied ? '¡Copiado para WhatsApp!' : 'Copiar Reporte WhatsApp'}</span>
          </button>
          
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 bg-[#131522] hover:bg-[#1A1C2C] text-gray-300 hover:text-white font-medium py-3 px-4 rounded-xl transition-all border border-[#212438] text-xs flex items-center justify-center gap-2"
          >
            <span>🖨️</span>
            <span>Imprimir / PDF</span>
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Volver al POS
          </button>
        </div>
      </div>
    </div>
  );
};
