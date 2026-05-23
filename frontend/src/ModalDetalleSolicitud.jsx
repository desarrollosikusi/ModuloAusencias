import React from 'react';
import { X, FileText, CheckCircle, Clock, Building, DollarSign, DownloadCloud } from 'lucide-react';

export default function ModalDetalleSolicitud({ isOpen, onClose, solicitud }) {
  if (!isOpen || !solicitud) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Detalle de Solicitud #{solicitud.id}</h2>
              <p className="text-sm text-slate-500">Registrada el sistema de Gestión Administrativa</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:bg-slate-200 hover:text-slate-700 p-2 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Columna Izquierda */}
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipo de Solicitud</span>
                <span className="text-slate-800 font-medium text-base">{solicitud.tipoSolicitud}</span>
              </div>
              
              {(solicitud.tipoCompra || solicitud.tipoSolicitud === 'Compra') && (
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipo de Compra</span>
                  <span className="text-slate-800 font-medium text-base">{solicitud.tipoCompra || 'N/A'}</span>
                </div>
              )}

              {(solicitud.ceco || solicitud.pep) && (
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Centro de Costo / Proyecto</span>
                  <span className="text-slate-800 font-medium text-base flex items-center gap-2">
                    <Building size={16} className="text-slate-400"/>
                    {solicitud.ceco ? solicitud.ceco : solicitud.pep}
                  </span>
                </div>
              )}

              {solicitud.proveedor && (
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Proveedor</span>
                  <span className="text-slate-800 font-medium text-base">{solicitud.proveedor}</span>
                </div>
              )}

              {(solicitud.webOrder || solicitud.dealId) && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 space-y-2">
                  <div>
                    <span className="block text-xs font-semibold text-blue-600 uppercase">Web Order (CISCO)</span>
                    <span className="text-slate-800 font-medium text-sm">{solicitud.webOrder}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-blue-600 uppercase">Deal ID (CISCO)</span>
                    <span className="text-slate-800 font-medium text-sm">{solicitud.dealId}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Columna Derecha */}
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Estado Actual</span>
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  <span className="text-slate-800 font-bold">{solicitud.estado}</span>
                </div>
                
                <div className="mt-3">
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tiempo en Gestión</span>
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-blue-500" />
                    <span className="text-slate-800 font-bold">{solicitud.diasHabiles} días hábiles</span>
                  </div>
                </div>
              </div>

              {solicitud.monto && (
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Monto Estimado</span>
                  <span className="text-slate-800 font-bold text-lg flex items-center gap-1">
                    <DollarSign size={18} className="text-slate-400"/>
                    {solicitud.monto.toLocaleString()} {solicitud.moneda}
                  </span>
                </div>
              )}

              {solicitud.gestor && (
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Gestor Asignado</span>
                  <span className="text-slate-800 font-medium text-base">{solicitud.gestor}</span>
                </div>
              )}
            </div>
          </div>

          {/* Observaciones */}
          {solicitud.observaciones && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Observaciones</span>
              <p className="text-slate-700 text-sm bg-slate-50 p-4 rounded-lg italic">
                "{solicitud.observaciones}"
              </p>
            </div>
          )}

          {/* Archivo Adjunto */}
          {solicitud.rutaCotizacion && (
            <div className="mt-6">
               <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Soporte Adjunto</span>
               <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                     <FileText size={20} className="text-slate-400"/>
                     <span className="text-sm font-medium text-slate-700 truncate max-w-[200px] sm:max-w-xs">
                        {solicitud.rutaCotizacion.split('/').pop().split('\\').pop()}
                     </span>
                  </div>
                  <button className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition px-3 py-1.5 rounded-md hover:bg-blue-50">
                     <DownloadCloud size={16}/> Descargar
                  </button>
               </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Cerrar Detalles
          </button>
        </div>

      </div>
    </div>
  );
}
