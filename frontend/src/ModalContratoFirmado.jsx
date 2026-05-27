import React, { useState } from 'react';
import { X, FileText, Send } from 'lucide-react';

export default function ModalContratoFirmado({ isOpen, onClose, solicitud, onEnviarContrato }) {
  const [archivo, setArchivo] = useState(null);
  const [entrega, setEntrega] = useState({ direccion: '', fechaHora: '', responsableRecepcion: '', telefono: '', observaciones: '' });

  const getMinFechaEntrega = () => {
    let date = new Date();
    let addedDays = 0;
    while (addedDays < 2) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 0 && day !== 6) { // Not Sunday (0) and not Saturday (6)
        addedDays++;
      }
    }
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  };

  const handleEntregaChange = (e) => {
    let { name, value } = e.target;
    // Formatting basic phone number
    if (name === 'telefono' && !value.startsWith('(+')) {
      if (solicitud.pep) {
        if (solicitud.pep.startsWith('57') || solicitud.pep.startsWith('5C')) value = `(+57) 3${value.replace(/\D/g, '')}`;
        else if (solicitud.pep.startsWith('5P')) value = `(+51) 9${value.replace(/\D/g, '')}`;
      }
    }
    setEntrega(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen || !solicitud) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!archivo) {
      alert("Debe cargar el contrato firmado por el cliente.");
      return;
    }
    
    const formData = new FormData();
    formData.append('contratoFirmado', archivo);
    formData.append('direccion', entrega.direccion);
    formData.append('fechaHora', entrega.fechaHora);
    formData.append('responsableRecepcion', entrega.responsableRecepcion);
    formData.append('telefono', entrega.telefono);
    formData.append('observaciones', entrega.observaciones);
    onEnviarContrato(solicitud.id, formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText size={24} /> Remitir Contrato Firmado
          </h2>
          <button onClick={onClose} className="text-blue-100 hover:bg-blue-700 p-2 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-slate-600 text-sm mb-6">
            Por favor, adjunta el contrato de préstamo firmado por el cliente para el PEP <strong>{solicitud.pep}</strong>. Una vez enviado, Logística procederá con el envío de los equipos.
          </p>
          
          <form id="form-contrato-firmado" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Contrato firmado por el cliente *</label>
              <input 
                type="file" 
                onChange={handleFileChange} 
                required 
                accept=".pdf" 
                className="w-full p-2 border border-slate-300 rounded-md bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-800 text-md mb-3 border-b border-slate-200 pb-2">Información de entrega de equipos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Dirección de envío *</label><input type="text" name="direccion" value={entrega.direccion} onChange={handleEntregaChange} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"/></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Fecha y hora de entrega *</label><input type="datetime-local" name="fechaHora" value={entrega.fechaHora} onChange={handleEntregaChange} min={getMinFechaEntrega()} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"/></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Responsable de la recepción *</label><input type="text" name="responsableRecepcion" value={entrega.responsableRecepcion} onChange={handleEntregaChange} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"/></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Número de celular *</label><input type="text" name="telefono" value={entrega.telefono} onChange={handleEntregaChange} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"/></div>
                <div className="md:col-span-2"><label className="block text-xs font-medium text-slate-600 mb-1">Observaciones a tener en cuenta en la entrega</label><textarea name="observaciones" value={entrega.observaciones} onChange={handleEntregaChange} rows="2" className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea></div>
              </div>
            </div>
          </form>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition">
            Cancelar
          </button>
          <button type="submit" form="form-contrato-firmado" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center gap-2">
            <Send size={18} /> Enviar contrato firmado
          </button>
        </div>
      </div>
    </div>
  );
}
