import React, { useState, useEffect } from 'react';
import { Mail, Send, X, Paperclip } from 'lucide-react';

export default function ModalEnviarCorreoCliente({ solicitud, isOpen, onClose, onEnviar }) {
  const [destinatario, setDestinatario] = useState('');
  const [copia, setCopia] = useState('');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && solicitud) {
      let cliente = 'Cliente';
      try {
        const detalles = JSON.parse(solicitud.detalles_prestamo || '{}');
        if (detalles.clienteResponsable) {
          cliente = detalles.clienteResponsable.responsable;
        }
      } catch (e) {}

      setAsunto(`${cliente} - Contrato de Préstamo de Equipos`);
      setMensaje(`Estimado ${cliente},\n\nAdjunto a este correo encontrará el contrato de préstamo de equipos. Por favor, revise el documento, fírmelo y devuélvalo respondiendo a este mismo correo.\n\nQuedamos atentos a cualquier inquietud.\n\nSaludos cordiales.`);
      
      let correo = '';
      try {
        const detalles = JSON.parse(solicitud.detalles_prestamo || '{}');
        if (detalles.clienteResponsable && detalles.clienteResponsable.correo) {
          correo = detalles.clienteResponsable.correo;
        }
      } catch (e) {}
      
      setDestinatario(correo);
      setCopia('');
    }
  }, [isOpen, solicitud]);

  if (!isOpen || !solicitud) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destinatario.trim()) {
      alert("Por favor, ingresa el correo del destinatario.");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate email sending delay
    setTimeout(() => {
      onEnviar(solicitud.id, { estado: 'Contrato en gestión de firmas' });
      setIsSubmitting(false);
      onClose();
      alert("¡Correo enviado exitosamente al cliente!");
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <Mail size={24} />
            <h2 className="text-xl font-semibold">Enviar Contrato al Cliente</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition bg-blue-700/50 p-1.5 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          <form id="emailForm" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 mb-4">
              <div className="mt-1 bg-blue-200 text-blue-700 p-1.5 rounded-full">
                <Paperclip size={16} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900">Archivo Adjunto</h4>
                <p className="text-xs text-blue-700 mt-1">El documento <span className="font-bold">Contrato_Prestamo.pdf</span> se generará y adjuntará de manera automática a este correo.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Para (Correo electrónico)</label>
              <input 
                type="email" 
                required
                value={destinatario}
                onChange={e => setDestinatario(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="cliente@empresa.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Copia (Cc)</label>
              <input 
                type="email" 
                value={copia}
                onChange={e => setCopia(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="copia@empresa.com (Opcional)"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Asunto</label>
              <input 
                type="text" 
                required
                value={asunto}
                onChange={e => setAsunto(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Mensaje</label>
              <textarea 
                required
                rows={6}
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
              ></textarea>
            </div>
            
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button 
            type="button"
            onClick={onClose} 
            className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button 
            form="emailForm"
            type="submit" 
            disabled={isSubmitting}
            className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2 shadow-sm shadow-blue-600/30 ${isSubmitting ? 'opacity-75 cursor-wait' : ''}`}
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Send size={18} />
            )}
            {isSubmitting ? 'Enviando...' : 'Enviar Correo'}
          </button>
        </div>
      </div>
    </div>
  );
}
