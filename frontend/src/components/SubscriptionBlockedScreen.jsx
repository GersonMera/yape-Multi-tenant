import React from 'react';
import { IconLock, IconWhatsApp, IconRefresh, IconLogOut } from './Icons';

export const SubscriptionBlockedScreen = ({ tenant, onLogout, onRefresh }) => {
  const nombreNegocio = tenant?.nombre_negocio || 'Comercio Afiliado';
  const fechaVencimiento = tenant?.fecha_vencimiento || 'Fecha límite';
  const diaCorte = tenant?.dia_corte_mensual || 30;
  const rawWp = tenant?.whatsapp_soporte || '+51999999999';
  
  // Limpiar número para wa.me (solo dígitos)
  const cleanWp = rawWp.replace(/[^0-9]/g, '');
  const mensajeWp = encodeURIComponent(
    `Hola, soy del negocio *${nombreNegocio}* (${tenant?.email || ''}). Mi suscripción de Yape POS ha concluido y deseo renovar mi servicio para reactivar mi terminal de cobro.`
  );
  const waUrl = `https://wa.me/${cleanWp}?text=${mensajeWp}`;

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '';
    try {
      const parts = fechaStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return fechaStr;
    } catch {
      return fechaStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-lg bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 text-center animate-fade-in">
        
        {/* Icono de Candado / Alerta de Servicio */}
        <div className="w-16 h-16 mx-auto bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
          <IconLock className="w-8 h-8" />
        </div>

        {/* Título y Explicación Cordial */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Suscripción Mensual Vencida
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
            Servicio Temporalmente Pausado
          </h1>
          <p className="text-sm text-[#475569] leading-relaxed">
            El ciclo de facturación mensual para <strong className="text-[#0F172A]">{nombreNegocio}</strong> concluyó el día <strong className="text-red-600">{formatFecha(fechaVencimiento)}</strong>.
          </p>
        </div>

        {/* Tarjeta de Información de Corte */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-left space-y-2.5 text-xs text-[#334155]">
          <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
            <span className="text-[#64748B] font-medium">Negocio / Tienda:</span>
            <span className="font-semibold text-[#0F172A]">{nombreNegocio}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
            <span className="text-[#64748B] font-medium">Día de corte asignado:</span>
            <span className="font-semibold text-[#0F172A]">Día {diaCorte} de cada mes</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-[#64748B] font-medium">Estado del servicio:</span>
            <span className="font-semibold text-red-600">Bloqueado por falta de pago</span>
          </div>
        </div>

        {/* Explicación y Llamado a la Acción */}
        <p className="text-xs text-[#64748B] leading-relaxed">
          Para reactivar de inmediato la terminal de cobro en vivo y continuar registrando tus pagos de Yape con alertas de audio y voz, presiona el botón para contactar al administrador.
        </p>

        {/* Botón Destacado de WhatsApp */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2.5 text-sm tracking-wide"
        >
          <IconWhatsApp className="w-5 h-5 text-white" />
          <span>Contactar por WhatsApp para Renovar</span>
        </a>

        {/* Acciones Secundarias: Verificar pago / Cerrar sesión */}
        <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onRefresh}
            className="flex-1 bg-white hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#334155] hover:text-[#0F172A] text-xs font-semibold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <IconRefresh className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Ya pagué (Comprobar)</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="bg-white hover:bg-red-50 border border-[#E2E8F0] hover:border-red-200 text-[#64748B] hover:text-red-600 text-xs font-semibold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <IconLogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>

      </div>
    </div>
  );
};
