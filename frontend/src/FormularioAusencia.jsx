import React, { useState } from 'react';
import { Calendar, Clock, FileText, Briefcase, AlertTriangle, CheckCircle, UploadCloud, Users } from 'lucide-react';

const TIPOS_AUSENCIA = [
  "Ausencias Operativas Especiales",
  "Incapacidad por enfermedad general",
  "Licencias",
  "Permisos internos de compañía",
  "Vacaciones"
];

const TIPOS_LICENCIA = [
  "Calamidad doméstica",
  "Citaciones judiciales o administrativas",
  "Jurado de votación",
  "Licencia de Maternidad",
  "Licencia de Paternidad",
  "Licencia para sufragio",
  "Licencia por Luto",
  "Licencia por matrimonio"
];

const TIPOS_PERMISO = [
  "Compensatorio",
  "Cumpleaños",
  "Día de la familia",
  "Estudios/certificaciones",
  "Mudanza"
];

const TIPOS_AUSENCIA_OPERATIVA = [
  "Capacitación técnica",
  "Descanso post implementación",
  "Ventana de mantenimiento"
];

const ACTIVIDADES_CRITICAS = [
  "Atención cliente", "Gestión administrativa", "Implementación", 
  "Otro", "Proyecto crítico", "Soporte", "Ventana de mantenimiento"
];

export default function FormularioAusencia({ onCancel, onSubmit }) {
  const [formData, setFormData] = useState({
    tipoAusencia: '',
    tipoLicencia: '',
    tipoPermiso: '',
    tipoAusenciaOperativa: '',
    fechaInicio: '',
    fechaFin: '',
    horaInicio: '',
    horaFin: '',
    diaCompleto: true,
    incluyeNoHabiles: false,
    motivo: '',
    observaciones: '',
    cantidadResponsables: 1,
    responsablesBackup: [{ nombre: '', correo: '', gestion: '' }],
    actividadesCriticas: [],
    tienePendientes: false,
    descripcionPendientes: ''
  });

  const [archivo, setArchivo] = useState(null);

  const isOperacionCritica = formData.actividadesCriticas.includes("Atención cliente") || 
                             formData.actividadesCriticas.includes("Proyecto crítico");
  
  const requiresAdjunto = ['Incapacidad por enfermedad general', 'Licencias'].includes(formData.tipoAusencia);

  const isDiaCompletoVisible = formData.tipoAusencia === 'Ausencias Operativas Especiales' || 
                               (formData.tipoAusencia === 'Licencias' && formData.tipoLicencia === 'Licencia para sufragio');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCantidadResponsablesChange = (e) => {
    const cantidad = parseInt(e.target.value, 10);
    setFormData(prev => {
      let nuevosResponsables = [...prev.responsablesBackup];
      if (cantidad > nuevosResponsables.length) {
        for (let i = nuevosResponsables.length; i < cantidad; i++) {
          nuevosResponsables.push({ nombre: '', correo: '', gestion: '' });
        }
      } else {
        nuevosResponsables = nuevosResponsables.slice(0, cantidad);
      }
      return { ...prev, cantidadResponsables: cantidad, responsablesBackup: nuevosResponsables };
    });
  };

  const handleResponsableChange = (index, field, value) => {
    setFormData(prev => {
      const nuevosResponsables = [...prev.responsablesBackup];
      nuevosResponsables[index] = { ...nuevosResponsables[index], [field]: value };
      return { ...prev, responsablesBackup: nuevosResponsables };
    });
  };

  const handleActividadToggle = (actividad) => {
    setFormData(prev => {
      const isSelected = prev.actividadesCriticas.includes(actividad);
      if (isSelected) {
        return { ...prev, actividadesCriticas: prev.actividadesCriticas.filter(a => a !== actividad) };
      } else {
        return { ...prev, actividadesCriticas: [...prev.actividadesCriticas, actividad] };
      }
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (requiresAdjunto && !archivo) {
      alert("Para el tipo de ausencia 'Incapacidad' es OBLIGATORIO adjuntar el soporte médico.");
      return;
    }
    onSubmit({ ...formData, archivoAdjunto: archivo });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-50 px-8 py-6 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800">Nueva Solicitud de Ausencia</h2>
        <p className="text-slate-500 mt-1">Completa los datos para registrar y justificar tu ausencia operativa.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-10">
        
        {/* SECCION 1: TIPO DE AUSENCIA */}
        <section>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-blue-600"/> 1. Información Principal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Ausencia *</label>
              <select 
                name="tipoAusencia" 
                value={formData.tipoAusencia} 
                onChange={handleChange}
                required
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              >
                <option value="">Selecciona un tipo...</option>
                {TIPOS_AUSENCIA.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
            
            {formData.tipoAusencia === "Licencias" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de licencia *</label>
                <select 
                  name="tipoLicencia" 
                  value={formData.tipoLicencia} 
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option value="">Selecciona una licencia...</option>
                  {TIPOS_LICENCIA.map(lic => (
                    <option key={lic} value={lic}>{lic}</option>
                  ))}
                </select>
              </div>
            )}
            
            {formData.tipoAusencia === "Permisos internos de compañía" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de permiso *</label>
                <select 
                  name="tipoPermiso" 
                  value={formData.tipoPermiso} 
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option value="">Selecciona un permiso...</option>
                  {TIPOS_PERMISO.map(perm => (
                    <option key={perm} value={perm}>{perm}</option>
                  ))}
                </select>
              </div>
            )}
            
            {formData.tipoAusencia === "Ausencias Operativas Especiales" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de ausencia operativa *</label>
                <select 
                  name="tipoAusenciaOperativa" 
                  value={formData.tipoAusenciaOperativa} 
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option value="">Selecciona una opción...</option>
                  {TIPOS_AUSENCIA_OPERATIVA.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </section>

        {/* SECCION 2: FECHAS Y HORARIOS */}
        <section className="pt-6 border-t border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600"/> 2. Fechas y Horarios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fecha Inicio *</label>
              <input type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleChange} required
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fecha Fin *</label>
              <input type="date" name="fechaFin" value={formData.fechaFin} onChange={handleChange} required
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-6">
            {isDiaCompletoVisible && (
              <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                <input type="checkbox" name="diaCompleto" checked={formData.diaCompleto} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"/>
                Día Completo
              </label>
            )}
            <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
              <input type="checkbox" name="incluyeNoHabiles" checked={formData.incluyeNoHabiles} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"/>
              Incluye Días No Hábiles (Fines de semana/Festivos)
            </label>
          </div>

          {!formData.diaCompleto && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2"><Clock size={16}/> Hora Inicio</label>
                <input type="time" name="horaInicio" value={formData.horaInicio} onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2"><Clock size={16}/> Hora Fin</label>
                <input type="time" name="horaFin" value={formData.horaFin} onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
              </div>
            </div>
          )}
        </section>

        {/* SECCION 3: JUSTIFICACION */}
        <section className="pt-6 border-t border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-blue-600"/> 3. Justificación y Soporte
          </h3>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Adjuntar Soportes (Opcional {requiresAdjunto && <span className="text-red-500 font-bold ml-1">* OBLIGATORIO</span>})</label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition cursor-pointer relative">
                <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                <UploadCloud size={32} className="mx-auto text-slate-400 mb-2"/>
                <p className="text-sm text-slate-600 font-medium">{archivo ? archivo.name : "Arrastra o haz clic para subir archivo"}</p>
                <p className="text-xs text-slate-400 mt-1">Formatos: PDF, JPG, PNG (Max 5MB)</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Observaciones Adicionales</label>
              <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows="4"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Cualquier otra información relevante..."></textarea>
            </div>
          </div>
        </section>

        {/* SECCION 4: IMPACTO OPERATIVO */}
        <section className="pt-6 border-t border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Briefcase size={20} className="text-blue-600"/> 4. Impacto Operativo (Obligatorio)
          </h3>
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">
            <div className="mb-6 pb-4 border-b border-blue-200">
              <label className="block text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Users size={18}/> ¿Cuántas personas quedan responsables de tus funciones? *
              </label>
              <select 
                value={formData.cantidadResponsables} 
                onChange={handleCantidadResponsablesChange}
                className="w-48 p-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-blue-900"
              >
                <option value={1}>1 persona</option>
                <option value={2}>2 personas</option>
                <option value={3}>3 personas</option>
              </select>
            </div>

            <div className="space-y-6">
              {formData.responsablesBackup.map((resp, index) => (
                <div key={index} className="bg-white p-5 rounded-lg border border-blue-100 shadow-sm relative">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                    {index + 1}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo *</label>
                      <input type="text" value={resp.nombre} onChange={(e) => handleResponsableChange(index, 'nombre', e.target.value)} required
                        className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico *</label>
                      <input type="email" value={resp.correo} onChange={(e) => handleResponsableChange(index, 'correo', e.target.value)} required
                        className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gestión Asignada *</label>
                    <textarea value={resp.gestion} onChange={(e) => handleResponsableChange(index, 'gestion', e.target.value)} required rows="2"
                      className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      placeholder="Describe qué tareas o procesos estarán a cargo de esta persona..."></textarea>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">Actividades Críticas Afectadas</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ACTIVIDADES_CRITICAS.map(act => (
                <label key={act} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition ${formData.actividadesCriticas.includes(act) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  <input type="checkbox" checked={formData.actividadesCriticas.includes(act)} onChange={() => handleActividadToggle(act)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"/>
                  <span className="text-sm font-medium">{act}</span>
                </label>
              ))}
            </div>
            {isOperacionCritica && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
                <AlertTriangle size={18} className="mt-0.5 shrink-0"/>
                <p><strong>Alerta de Riesgo Operativo:</strong> Has marcado actividades altamente críticas. Esta solicitud requerirá revisión especial por parte de Talento Humano y tu líder directo.</p>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
            <label className="flex items-center gap-2 text-sm text-slate-800 font-semibold cursor-pointer mb-4">
              <input type="checkbox" name="tienePendientes" checked={formData.tienePendientes} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"/>
              ¿Tienes tareas o entregables críticos pendientes para esas fechas?
            </label>
            
            {formData.tienePendientes && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-slate-700 mb-2">Descripción de Pendientes *</label>
                <textarea name="descripcionPendientes" value={formData.descripcionPendientes} onChange={handleChange} required={formData.tienePendientes} rows="3"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Detalla las tareas que deben ser cubiertas..."></textarea>
              </div>
            )}
          </div>
        </section>

        {/* ACTIONS */}
        <div className="pt-8 border-t border-slate-200 flex justify-end gap-4">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition">
            Cancelar
          </button>
          <button type="submit" disabled={requiresAdjunto && !archivo} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <CheckCircle size={18}/>
            Enviar Solicitud
          </button>
        </div>

      </form>
    </div>
  );
}
