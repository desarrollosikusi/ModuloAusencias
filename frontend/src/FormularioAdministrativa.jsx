import React, { useState } from 'react';
import { FileText, CheckCircle, UploadCloud, Briefcase } from 'lucide-react';

const TIPOS_SOLICITUD = ["Ajuste compra CISCO", "Compra", "Contrato préstamo de equipos", "Cotización", "Entrega de bienes", "Facturación"];
const TIPOS_COMPRA = ["CECO", "Proyecto", "Servicio"];
const CECOS = ["CECO-1001 (Operaciones)", "CECO-1002 (Soporte)", "CECO-1003 (IT Interno)", "CECO-1004 (Ventas)"];
const PROVEEDORES = ["AWS", "CISCO", "Dell", "Lenovo", "Microsoft", "Otro"];

export default function FormularioAdministrativa({ peps = [], onCancel, onSubmit }) {
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

  // States para Prestamo de equipos
  const [numEquipos, setNumEquipos] = useState(1);
  const [equipos, setEquipos] = useState([{ referencia: '', serial: '', fechaInicio: '', fechaFin: '' }]);
  const [mismoTiempo, setMismoTiempo] = useState(false);
  const [clienteResponsable, setClienteResponsable] = useState({ responsable: '', cargo: '', correo: '', celular: '' });
  const [entrega, setEntrega] = useState({ direccion: '', fechaHora: '', responsableRecepcion: '', telefono: '', observaciones: '' });
  const [clienteAuto, setClienteAuto] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'pep' && (formData.tipoSolicitud === "Contrato préstamo de equipos" || value)) {
      const pepObj = peps.find(p => p.codigo_pep === value || p.folio === value);
      setClienteAuto(pepObj ? pepObj.cliente : '');

      let prefix = '';
      if (value.startsWith('57') || value.startsWith('5C')) prefix = '(+57) 3';
      else if (value.startsWith('5P')) prefix = '(+51) 9';
      
      setClienteResponsable(prev => ({ ...prev, celular: prefix }));
      setEntrega(prev => ({ ...prev, telefono: prefix }));
    }
  };

  const handleNumEquiposChange = (e) => {
    const val = parseInt(e.target.value) || 1;
    setNumEquipos(val);
    setEquipos(prev => {
      const newEquipos = [...prev];
      if (val > prev.length) {
        for (let i = prev.length; i < val; i++) {
          newEquipos.push({ 
            referencia: '', 
            serial: '', 
            fechaInicio: mismoTiempo ? newEquipos[0].fechaInicio : '', 
            fechaFin: mismoTiempo ? newEquipos[0].fechaFin : '' 
          });
        }
      } else if (val < prev.length) {
        newEquipos.length = val;
      }
      return newEquipos;
    });
  };

  const handleEquipoChange = (index, field, value) => {
    setEquipos(prev => {
      const newEquipos = [...prev];
      newEquipos[index][field] = value;
      
      if (mismoTiempo && index === 0 && (field === 'fechaInicio' || field === 'fechaFin')) {
        for (let i = 1; i < newEquipos.length; i++) {
          newEquipos[i][field] = value;
        }
      }
      
      return newEquipos;
    });
  };

  const handleMismoTiempoChange = (e) => {
    const isChecked = e.target.checked;
    setMismoTiempo(isChecked);
    if (isChecked && equipos.length > 0) {
      // Sync all to the first one
      setEquipos(prev => {
        const newEquipos = [...prev];
        const fi = newEquipos[0].fechaInicio;
        const ff = newEquipos[0].fechaFin;
        for (let i = 1; i < newEquipos.length; i++) {
          newEquipos[i].fechaInicio = fi;
          newEquipos[i].fechaFin = ff;
        }
        return newEquipos;
      });
    }
  };

  const formatPhoneInput = (value, pep) => {
    if (!pep) return value;
    if (pep.startsWith('57') || pep.startsWith('5C')) {
      const prefix = '(+57) 3';
      if (!value.startsWith(prefix)) {
        if (value.length < prefix.length) return prefix;
        let digits = value.replace(/\D/g, '');
        if (digits.startsWith('573')) digits = digits.slice(3);
        else if (digits.startsWith('57')) digits = digits.slice(2);
        else if (digits.startsWith('3')) digits = digits.slice(1);
        return prefix + digits.slice(0, 9);
      }
      return prefix + value.slice(prefix.length).replace(/\D/g, '').slice(0, 9);
    } else if (pep.startsWith('5P')) {
      const prefix = '(+51) 9';
      if (!value.startsWith(prefix)) {
        if (value.length < prefix.length) return prefix;
        let digits = value.replace(/\D/g, '');
        if (digits.startsWith('519')) digits = digits.slice(3);
        else if (digits.startsWith('51')) digits = digits.slice(2);
        else if (digits.startsWith('9')) digits = digits.slice(1);
        return prefix + digits.slice(0, 8);
      }
      return prefix + value.slice(prefix.length).replace(/\D/g, '').slice(0, 8);
    }
    return value;
  };

  const handleClienteResponsableChange = (e) => {
    let { name, value } = e.target;
    if (name === 'celular') {
      value = formatPhoneInput(value, formData.pep);
    }
    setClienteResponsable(prev => ({ ...prev, [name]: value }));
  };

  const handleEntregaChange = (e) => {
    let { name, value } = e.target;
    if (name === 'telefono') {
      value = formatPhoneInput(value, formData.pep);
    }
    setEntrega(prev => ({ ...prev, [name]: value }));
  };

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
    // Formato 'YYYY-MM-DDThh:mm'
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  };

  const getMinFechaInicio = () => {
    let date = new Date();
    let addedDays = 0;
    while (addedDays < 2) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 0 && day !== 6) {
        addedDays++;
      }
    }
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  };

  const getMinFechaFin = (fechaInicioStr) => {
    if (!fechaInicioStr) return '';
    const [y, m, d] = fechaInicioStr.split('-');
    let date = new Date(y, m - 1, d);
    let addedDays = 0;
    while (addedDays < 5) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 0 && day !== 6) {
        addedDays++;
      }
    }
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = { ...formData, cotizacion: archivo };
    
    if (formData.tipoSolicitud === "Contrato préstamo de equipos") {
      dataToSend.detallesPrestamo = JSON.stringify({
        clienteAuto,
        equipos,
        clienteResponsable
      });
    }
    
    onSubmit(dataToSend);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  const isCompra = formData.tipoSolicitud === "Compra";
  const isPrestamo = formData.tipoSolicitud === "Contrato préstamo de equipos";
  const showPep = formData.tipoCompra === "Proyecto" || formData.tipoCompra === "Servicio";
  const showCeco = formData.tipoCompra === "CECO";
  const showCiscoFields = formData.proveedor === "CISCO";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl mx-auto">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Nueva Solicitud Administrativa</h2>
        <p className="text-sm text-slate-500 mt-1">Completa los datos para registrar el requerimiento hacia la Dirección Financiera.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
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
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                      className="w-full px-3 py-2 border border-blue-300 bg-blue-50/50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"/>
                  </div>
                  <div className="animate-in fade-in">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Deal ID *</label>
                    <input type="text" name="dealId" value={formData.dealId} onChange={handleChange} required={showCiscoFields}
                      className="w-full px-3 py-2 border border-blue-300 bg-blue-50/50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"/>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">Monto *</label>
                <input type="number" name="monto" value={formData.monto} onChange={handleChange} required={isCompra} min="0" step="0.01"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">Moneda *</label>
                <select name="moneda" value={formData.moneda} onChange={handleChange} required={isCompra}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Seleccionar...</option>
                  <option value="COP">COP</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">Compra Planeada *</label>
                <select name="compraPlaneada" value={formData.compraPlaneada} onChange={handleChange} required={isCompra}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Seleccionar...</option>
                  <option value="Si">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Observaciones</label>
              <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows="3"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"></textarea>
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

        {isPrestamo && (
          <section className="pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-blue-600"/> 2. Detalles del Préstamo de Equipos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">PEP *</label>
                <select 
                  name="pep" 
                  value={formData.pep} 
                  onChange={handleChange}
                  required={isPrestamo}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Seleccionar PEP...</option>
                  {peps.map(p => <option key={p.id} value={p.codigo_pep || p.folio}>{p.codigo_pep || p.folio} - {p.nombre_proyecto}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cliente</label>
                <input 
                  type="text" 
                  value={clienteAuto} 
                  readOnly
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-100 text-slate-600 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-slate-700 mb-2">N° Equipos a prestar *</label>
                <select 
                  value={numEquipos} 
                  onChange={handleNumEquiposChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 mt-4 md:mt-6">
                <input 
                  type="checkbox" 
                  id="mismoTiempo" 
                  checked={mismoTiempo} 
                  onChange={handleMismoTiempoChange}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="mismoTiempo" className="text-sm font-medium text-slate-700">Tiempo de préstamo igual para todos los equipos</label>
              </div>
            </div>

            {equipos.map((eq, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4 animate-in fade-in">
                <h4 className="font-semibold text-slate-700 text-sm mb-3">Equipo {idx + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Referencia *</label>
                    <input type="text" value={eq.referencia} onChange={(e) => handleEquipoChange(idx, 'referencia', e.target.value)} required={isPrestamo} className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Serial *</label>
                    <input type="text" value={eq.serial} onChange={(e) => handleEquipoChange(idx, 'serial', e.target.value)} required={isPrestamo} className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Fecha Inicio *</label>
                    <input type="date" value={eq.fechaInicio} min={getMinFechaInicio()} onChange={(e) => handleEquipoChange(idx, 'fechaInicio', e.target.value)} required={isPrestamo} readOnly={mismoTiempo && idx > 0} className={`w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${mismoTiempo && idx > 0 ? 'bg-slate-100 cursor-not-allowed' : ''}`}/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Fecha Fin *</label>
                    <input type="date" value={eq.fechaFin} min={getMinFechaFin(eq.fechaInicio)} onChange={(e) => handleEquipoChange(idx, 'fechaFin', e.target.value)} required={isPrestamo} readOnly={mismoTiempo && idx > 0} className={`w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${mismoTiempo && idx > 0 ? 'bg-slate-100 cursor-not-allowed' : ''}`}/>
                  </div>
                </div>
              </div>
            ))}

            <h4 className="font-semibold text-slate-800 text-md mt-6 mb-3 border-b border-slate-200 pb-2">Información del cliente (responsable equipos)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Responsable del cliente *</label><input type="text" name="responsable" value={clienteResponsable.responsable} onChange={handleClienteResponsableChange} required={isPrestamo} className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"/></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Cargo del responsable *</label><input type="text" name="cargo" value={clienteResponsable.cargo} onChange={handleClienteResponsableChange} required={isPrestamo} className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"/></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Correo electrónico *</label><input type="email" name="correo" value={clienteResponsable.correo} onChange={handleClienteResponsableChange} required={isPrestamo} className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"/></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Número de celular *</label><input type="text" name="celular" value={clienteResponsable.celular} onChange={handleClienteResponsableChange} required={isPrestamo} className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"/></div>
            </div>
          </section>
        )}

        <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition">
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
            <CheckCircle size={16}/>
            Enviar Solicitud
          </button>
        </div>

      </form>
    </div>
  );
}
