import React, { useState, useEffect } from 'react';
import { IconBarChart, IconFileText, IconWhatsApp } from './Icons';

export const CashierCloseModal = ({ isOpen, onClose, tenant, transactions = [], summary, dateLabel }) => {
  const [copyMsg, setCopyMsg] = useState(false);
  const [bossPhone, setBossPhone] = useState('');

  // Cargar teléfono del jefe si ya se guardó antes para este comercio
  useEffect(() => {
    if (tenant?.id) {
      const saved = localStorage.getItem(`yape_boss_phone_${tenant.id}`) || '';
      setBossPhone(saved);
    }
  }, [tenant]);

  if (!isOpen) return null;

  const now = new Date();
  const todayDateStr = now.toLocaleDateString('es-PE');
  const horaCierre = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const totalReal = summary?.total_real || 0;
  const countReal = summary?.count_real || 0;

  const generateReportText = () => {
    const lines = [
      `🧾 *CIERRE DE CAJA — YAPE POS*`,
      `==============================`,
      `🏪 *Comercio:* ${tenant?.nombre_negocio || 'Panel de Caja'}`,
      `📅 *Período:* ${dateLabel || todayDateStr}`,
      `⏰ *Hora Cierre:* ${horaCierre}`,
      `------------------------------`,
      `💰 *TOTAL RECAUDADO:* S/ ${totalReal.toFixed(2)}`,
      `⚡ *TOTAL PAGOS:* ${countReal} cobro${countReal === 1 ? '' : 's'}`,
      `==============================`,
      `✅ *Estado:* Cuadre de caja verificado`
    ];
    return lines.join('\n');
  };

  const handleSendWhatsApp = () => {
    const text = generateReportText();
    const encoded = encodeURIComponent(text);

    // Si guardó un número, limpiarlo y poner prefijo Perú 51 si es de 9 dígitos
    let url = '';
    const cleanNumber = bossPhone.replace(/\D/g, '');
    if (cleanNumber.length === 9) {
      url = `https://wa.me/51${cleanNumber}?text=${encoded}`;
    } else if (cleanNumber.length > 9) {
      url = `https://wa.me/${cleanNumber}?text=${encoded}`;
    } else {
      // Abre WhatsApp para elegir contacto de la lista
      url = `https://api.whatsapp.com/send?text=${encoded}`;
    }

    if (tenant?.id && bossPhone) {
      localStorage.setItem(`yape_boss_phone_${tenant.id}`, bossPhone);
    }

    window.open(url, '_blank');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-7 border border-[#E2E8F0] space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Cabecera del Reporte */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-[#7C3AED] border border-[#E9D5FF] flex items-center justify-center shrink-0">
              <IconBarChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Reporte de Cierre de Caja</h3>
              <p className="text-xs text-[#64748B]">{dateLabel || todayDateStr} • {horaCierre}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0F172A] text-base font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Comercio info */}
        <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#E2E8F0] text-center">
          <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Sucursal / Comercio</p>
          <p className="text-base font-extrabold text-[#0F172A] mt-0.5">{tenant?.nombre_negocio || 'Panel de Caja'}</p>
        </div>

        {/* Cifras contables puntuales */}
        <div className="space-y-3">
          {/* Tarjeta Destacada de Dinero Real */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 text-center space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Total Recaudado en Yape
            </span>
            <p className="text-3xl font-mono font-extrabold text-[#059669]">
              S/ {totalReal.toFixed(2)}
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-emerald-800 border border-emerald-200 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                <span>{countReal} transacci{countReal === 1 ? 'ón' : 'ones'} recibida{countReal === 1 ? '' : 's'}</span>
              </span>
            </div>
          </div>

          {/* Campo opcional de WhatsApp del Jefe */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 space-y-1.5 text-xs">
            <label className="font-semibold text-[#475569] flex items-center justify-between">
              <span>Número WhatsApp del Jefe (Opcional):</span>
              <span className="text-[10px] text-[#94A3B8]">Se guarda solo</span>
            </label>
            <input
              type="text"
              placeholder="ej: 987654321"
              value={bossPhone}
              onChange={(e) => setBossPhone(e.target.value)}
              className="w-full saas-input rounded-lg px-3 py-2 text-xs font-mono bg-white"
            />
            <p className="text-[10px] text-[#64748B]">
              Si lo dejas en blanco, se abrirá tu WhatsApp para elegir el contacto de tu lista.
            </p>
          </div>
        </div>

        {/* Botón Principal: Enviar por WhatsApp */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleSendWhatsApp}
            className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <IconWhatsApp className="w-5 h-5 shrink-0" />
            <span>Enviar por WhatsApp</span>
          </button>

          {/* Acciones Secundarias */}
          <div className="flex gap-2.5">
            <button
              onClick={handleCopyReport}
              className="flex-1 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#334155] text-xs font-semibold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <IconFileText className="w-3.5 h-3.5 text-[#64748B]" />
              <span>{copyMsg ? '¡Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#334155] text-xs font-semibold py-2 px-4 rounded-xl transition-colors"
            >
              Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
