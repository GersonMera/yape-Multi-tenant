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
      `✅ _Generado por Sistema Yape POS_`
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
      <div className="glass w-full max-w-lg rounded-3xl p-6 border border-white/20 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Reporte de Cierre de Caja</h3>
              <p className="text-xs text-gray-400 capitalize">{todayStr}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-lg font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Local info */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Comercio / Tienda</p>
          <p className="text-lg font-black text-yape-light mt-0.5">{tenant?.nombre_negocio || 'Panel de Caja'}</p>
        </div>

        {/* Cifras contables del cierre */}
        <div className="space-y-3">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Total Cobrado (Real)</p>
              <p className="text-2xl font-black text-white mt-1">S/ {totalReal.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full">
                {countReal} transacci{countReal === 1 ? 'ón' : 'ones'}
              </span>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Modo Test (Simulado)</p>
              <p className="text-xl font-black text-amber-300 mt-1">S/ {totalTest.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <span className="bg-amber-500/20 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full">
                {countTest} prueba{countTest === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleCopyWhatsApp}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
          >
            <span>{copied ? '✅' : '💬'}</span>
            <span>{copied ? '¡Copiado al Portapapeles!' : 'Copiar para WhatsApp'}</span>
          </button>
          
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 text-sm"
          >
            <span>🖨️</span>
            <span>Imprimir / PDF</span>
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-white underline transition-colors"
          >
            Volver a la Caja
          </button>
        </div>
      </div>
    </div>
  );
};
