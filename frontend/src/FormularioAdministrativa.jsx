import React, { useState } from 'react';
import { FileText, CheckCircle, UploadCloud, Briefcase } from 'lucide-react';

const TIPOS_SOLICITUD = ["Compra", "Cotización", "Entrega de bienes", "Facturación"];
const TIPOS_COMPRA = ["CECO", "Proyecto", "Servicio"];
const CECOS = ["CECO-1001 (Operaciones)", "CECO-1002 (Soporte)", "CECO-1003 (IT Interno)", "CECO-1004 (Ventas)"];
const PROVEEDORES = ["AWS", "CISCO", "Dell", "Lenovo", "Microsoft", "Otro"];

export default function FormularioAdministrativa({ onCancel, onSubmit }) {
  const [formData, setFormData] = useState({
    tipoSolicitud: '',
    tipoCompra: '',
    pep: '',
    ceco: '',
    proveedor: '',
    monto: '',
    moneda: '',
    compraPlaneada: '',
    observaciones: '',
    webOrder: '',
    dealId: ''
  });

  const [archivo, setArchivo] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, cotizacion: archivo });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  const isCompra = formData.tipoSolicitud === "Compra";
  const showPep = formData.tipoCompra === "Proyecto" || formData.tipoCompra === "Servicio";
  const showCeco = formData.tipoCompra === "CECO";
  const showCiscoFields = formData.proveedor === "CISCO";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-50 px-8 py-6 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800">Nueva Solicitud Administrativa</h2>
        <p className="text-slate-500 mt-1">Completa los datos para registrar el requerimiento hacia la Dirección Financiera.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-10">
        
        <section>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Briefcase size={20} className="text-blue-600"/> 1. Información de la Solicitud
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Solicitud *</label>
              <select 
                name="tipoSolicitud" 
                value={formData.tipoSolicitud} 
                onChange={handleChange}
                required
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="">Selecciona una opción...</option>
                {TIPOS_SOLICITUD.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </section>

        {isCompra && (
          <section className="pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-blue-600"/> 2. Detalles de la Compra
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de compra *</label>
                <select 
                  name="tipoCompra" 
                  value={formData.tipoCompra} 
                  onChange={handleChange}
                  required={isCompra}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Selecciona...</option>
                  {TIPOS_COMPRA.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {showPep && (
                <div className="animate-in fade-in">
                  <label className="block text-sm font-medium text-slate-700 mb-2">PEP *</label>
                  <input 
                    type="text" 
                    name="pep" 
                    value={formData.pep} 
                    onChange={handleChange} 
                    maxLength={20}
                    required={showPep}
                    placeholder="Ej. PEP-2024-001"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-xs text-slate-400 mt-1">Máximo 20 caracteres ({formData.pep.length}/20)</p>
                </div>
              )}

              {showCeco && (
                <div className="animate-in fade-in">
                  <label className="block text-sm font-medium text-slate-700 mb-2">CECO *</label>
                  <select 
                    name="ceco" 
                    value={formData.ceco} 
                    onChange={handleChange}
                    required={showCeco}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Buscar CECO...</option>
                    {CECOS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Proveedor *</label>
                <select 
                  name="proveedor" 
                  value={formData.proveedor} 
                  onChange={handleChange}
                  required={isCompra}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Buscar Proveedor...</option>
                  {PROVEEDORES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {showCiscoFields && (
                <>
                  <div className="animate-in fade-in">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Web Order *</label>
                    <input type="text" name="webOrder" value={formData.webOrder} onChange={handleChange} required={showCiscoFields}
                      className="w-full p-3 border border-blue-300 bg-blue-50/50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                  </div>
                  <div className="animate-in fade-in">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Deal ID *</label>
                    <input type="text" name="dealId" value={formData.dealId} onChange={handleChange} required={showCiscoFields}
                      className="w-full p-3 border border-blue-300 bg-blue-50/50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">Monto *</label>
                <input type="number" name="monto" value={formData.monto} onChange={handleChange} required={isCompra} min="0" step="0.01"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">Moneda *</label>
                <select name="moneda" value={formData.moneda} onChange={handleChange} required={isCompra}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Seleccionar...</option>
                  <option value="COP">COP</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">Compra Planeada *</label>
                <select name="compraPlaneada" value={formData.compraPlaneada} onChange={handleChange} required={isCompra}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Seleccionar...</option>
                  <option value="Si">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Observaciones</label>
              <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows="3"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cotización (Adjunto) *</label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition cursor-pointer relative">
                <input type="file" onChange={handleFileChange} required={isCompra && !archivo} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                <UploadCloud size={32} className="mx-auto text-slate-400 mb-2"/>
                <p className="text-sm text-slate-600 font-medium">{archivo ? archivo.name : "Arrastra o haz clic para subir 1 solo archivo"}</p>
              </div>
            </div>
          </section>
        )}

        <div className="pt-8 border-t border-slate-200 flex justify-end gap-4">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition">
            Cancelar
          </button>
          <button type="submit" className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition flex items-center gap-2">
            <CheckCircle size={18}/>
            Enviar Solicitud
          </button>
        </div>

      </form>
    </div>
  );
}
