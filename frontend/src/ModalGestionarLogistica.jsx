import React, { useState } from 'react';
import { X, CheckCircle, Save, Package } from 'lucide-react';

export default function ModalGestionarLogistica({ isOpen, onClose, solicitud, usuarioActual, onGestionar }) {
  const [fechaLimite, setFechaLimite] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [archivo, setArchivo] = useState(null);

  if (!isOpen || !solicitud) return null;

  const getMinFechaHabil = () => {
    let date = new Date();
    let addedDays = 0;
    while (addedDays < 1) { // siguiente día hábil
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 0 && day !== 6) {
        addedDays++;
      }
    }
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!archivo) {
      alert("Debe cargar la Versión Inicial del Contrato.");
      return;
    }
    
    const formData = new FormData();
    formData.append('gestor', usuarioActual);
    formData.append('fechaLimite', fechaLimite);
    if (observaciones) formData.append('observaciones', observaciones);
    formData.append('contratoInicial', archivo);

    onGestionar(solicitud.id, formData);
  };

  let detalles = {};
  try {
    detalles = solicitud.detallesPrestamo ? JSON.parse(solicitud.detallesPrestamo) : {};
  } catch(e) {}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package size={24} /> Gestionar Logística - Préstamo #{solicitud.id}
          </h2>
          <button onClick={onClose} className="text-blue-100 hover:bg-blue-700 p-2 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-8 bg-slate-50">
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Detalle de la solicitud</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
               <div><span className="block text-slate-400 text-xs uppercase">PEP</span><span className="font-semibold">{solicitud.pep}</span></div>
               <div><span className="block text-slate-400 text-xs uppercase">Cliente Responsable</span><span className="font-semibold">{detalles.clienteResponsable?.responsable}</span></div>
               <div><span className="block text-slate-400 text-xs uppercase">Dirección Envío</span><span className="font-semibold">{detalles.entrega?.direccion}</span></div>
               <div><span className="block text-slate-400 text-xs uppercase">Fecha de Entrega</span><span className="font-semibold">{detalles.entrega?.fechaHora?.replace('T', ' ')}</span></div>
            </div>
            
            <h4 className="font-semibold text-slate-700 mb-2 mt-4">Equipos Solicitados</h4>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              {detalles.equipos && detalles.equipos.map((eq, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <span className="font-medium text-slate-800">{eq.referencia}</span>
                    <span className="text-slate-500 text-xs ml-2">SN: {eq.serial}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {eq.fechaInicio} al {eq.fechaFin}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-blue-600"/> Observaciones Logística
            </h3>

            <form id="form-logistica" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Gestor</label>
                  <input type="text" value={usuarioActual} disabled className="w-full p-2 border border-slate-300 rounded-md bg-slate-100 text-slate-500 font-medium"/>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha límite de entrega del documento *</label>
                  <input type="date" value={fechaLimite} min={getMinFechaHabil()} onChange={(e) => setFechaLimite(e.target.value)} required className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"/>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Versión Inicial Contrato *</label>
                <input type="file" onChange={handleFileChange} required accept=".pdf,.doc,.docx" className="w-full p-2 border border-slate-300 rounded-md bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Observaciones</label>
                <textarea rows="3" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Anotaciones adicionales (opcional)..."></textarea>
              </div>
            </form>
          </section>
        </div>

        <div className="bg-white px-6 py-4 border-t border-slate-200 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition">
            Cancelar
          </button>
          <button type="submit" form="form-logistica" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center gap-2">
            <Save size={18} /> Remitir contrato
          </button>
        </div>
      </div>
    </div>
  );
}
