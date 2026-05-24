import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Calendar, Save } from 'lucide-react';

export default function ModalGestionarSolicitud({ isOpen, onClose, solicitud, usuarioActual, onGestionar }) {
  const [formData, setFormData] = useState({
    fecha_orden_compra: new Date().toISOString().split('T')[0],
    orden_compra: '',
    valor_final: '',
    moneda_final: '',
    cisco_quote: '',
    cisco_so: '',
    cisco_web_order_final: ''
  });

  useEffect(() => {
    if(solicitud) {
       setFormData(prev => ({
         ...prev,
         fecha_orden_compra: solicitud.fechaOrdenCompra ? solicitud.fechaOrdenCompra.split(' ')[0] : new Date().toISOString().split('T')[0],
         orden_compra: solicitud.ordenCompra || '',
         valor_final: solicitud.valorFinal || '',
         moneda_final: solicitud.monedaFinal || '',
         cisco_quote: solicitud.ciscoQuote || '',
         cisco_so: solicitud.ciscoSo || '',
         cisco_web_order_final: solicitud.ciscoWebOrderFinal || ''
       }));
    }
  }, [solicitud]);

  if (!isOpen || !solicitud) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGestionar(solicitud.id, {
      ...formData,
      valor_final: parseFloat(formData.valor_final),
      gestor: usuarioActual
    });
  };

  const isCisco = solicitud.proveedor === 'CISCO';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle size={24} /> Gestionar Solicitud #{solicitud.id}
          </h2>
          <button onClick={onClose} className="text-blue-100 hover:bg-blue-700 p-2 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-8 bg-slate-50">
          
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Información Original</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
               <div><span className="block text-slate-400 text-xs uppercase">Tipo</span><span className="font-semibold">{solicitud.tipoCompra}</span></div>
               <div><span className="block text-slate-400 text-xs uppercase">PEP/CECO</span><span className="font-semibold">{solicitud.ceco || solicitud.pep}</span></div>
               <div><span className="block text-slate-400 text-xs uppercase">Proveedor</span><span className="font-semibold">{solicitud.proveedor}</span></div>
               <div><span className="block text-slate-400 text-xs uppercase">Monto Estimado</span><span className="font-semibold text-blue-600">{solicitud.monto} {solicitud.moneda}</span></div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Save size={20} className="text-blue-600"/> Completar Gestión Financiera
            </h3>

            <form id="form-gestionar" onSubmit={handleSubmit} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Fecha de Orden de Compra *</label>
                    <input type="date" name="fecha_orden_compra" value={formData.fecha_orden_compra} onChange={handleChange} required
                           className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"/>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Orden de Compra N° *</label>
                    <input type="text" name="orden_compra" value={formData.orden_compra} onChange={handleChange} maxLength={8} required
                           placeholder="Ej. OC123456"
                           className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"/>
                    <p className="text-xs text-slate-400 mt-1">Máx. 8 caracteres</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Gestor de Compras</label>
                    <input 
                      type="text" 
                      value={usuarioActual} 
                      disabled
                      className="w-full p-2 border border-slate-300 rounded-md bg-slate-100 text-slate-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Valor Final de Compra *</label>
                    <input type="number" name="valor_final" value={formData.valor_final} onChange={handleChange} required step="0.01" min="0"
                           className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Moneda *</label>
                    <select name="moneda_final" value={formData.moneda_final} onChange={handleChange} required
                           className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="">Seleccionar...</option>
                      <option value="COP">COP</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
               </div>

               {isCisco && (
                 <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mt-6">
                    <h4 className="text-sm font-bold text-blue-800 mb-4">Campos Requeridos por CISCO</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Quote *</label>
                        <input type="text" name="cisco_quote" value={formData.cisco_quote} onChange={handleChange} required={isCisco}
                               className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">SO N° *</label>
                        <input type="text" name="cisco_so" value={formData.cisco_so} onChange={handleChange} required={isCisco}
                               className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Web Order ID *</label>
                        <input type="text" name="cisco_web_order_final" value={formData.cisco_web_order_final} onChange={handleChange} required={isCisco}
                               className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                      </div>
                    </div>
                 </div>
               )}
            </form>
          </section>

        </div>

        <div className="bg-white px-6 py-4 border-t border-slate-200 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition">
            Cancelar
          </button>
          <button type="submit" form="form-gestionar" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center gap-2">
            <Save size={18} /> Procesar y Cerrar Solicitud
          </button>
        </div>

      </div>
    </div>
  );
}
