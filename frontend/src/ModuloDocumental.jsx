import React, { useState, useMemo } from 'react';
import { FolderOpen, FileText, Search, Download, ExternalLink } from 'lucide-react';

// MOCK DATA DE DOCUMENTOS
const DOCUMENTOS_MOCK = [
  // FINANCIERA
  { id: 1, intranet: "Financiera", proceso: "Presupuestos", carpeta: "1. Público", documento: "Plantilla_Presupuesto_2026.xlsx", version: "V1.0", fecha: "2026-01-15" },
  { id: 2, intranet: "Financiera", proceso: "Contabilidad", carpeta: "2. Interno/Procedimiento", documento: "Manual_Cierre_Contable.docx", version: "V3.1", fecha: "2026-02-10" },
  { id: 3, intranet: "Financiera", proceso: "Auditoría", carpeta: "3. Interno/Registros", documento: null, version: "-", fecha: "-" },

  // OPERACIONES - CX
  { id: 4, intranet: "Operaciones", proceso: "CX", carpeta: "1. Público", documento: "Guía_Atención_Cliente.pdf", version: "V2.0", fecha: "2026-01-10" },
  { id: 5, intranet: "Operaciones", proceso: "CX", carpeta: "2. Interno/Procedimiento", documento: "Protocolo_Escalamiento.pdf", version: "V1.2", fecha: "2025-08-15" },
  { id: 6, intranet: "Operaciones", proceso: "CX", carpeta: "3. Interno/Registros", documento: null, version: "-", fecha: "-" },

  // OPERACIONES - PROYECTOS
  { id: 7, intranet: "Operaciones", proceso: "Proyectos", carpeta: "1. Público", documento: null, version: "-", fecha: "-" },
  { id: 8, intranet: "Operaciones", proceso: "Proyectos", carpeta: "2. Interno/Procedimiento", documento: "Metodología_Gestión_Proyectos.docx", version: "V4.0", fecha: "2026-04-05" },
  { id: 9, intranet: "Operaciones", proceso: "Proyectos", carpeta: "3. Interno/Registros", documento: null, version: "-", fecha: "-" },

  // OPERACIONES - SERVICIOS
  { id: 10, intranet: "Operaciones", proceso: "Servicios", carpeta: "1. Público", documento: "Catálogo_Servicios_Operativos.pdf", version: "V3.0", fecha: "2026-02-28" },
  { id: 11, intranet: "Operaciones", proceso: "Servicios", carpeta: "2. Interno/Procedimiento", documento: null, version: "-", fecha: "-" },
  { id: 12, intranet: "Operaciones", proceso: "Servicios", carpeta: "3. Interno/Registros", documento: null, version: "-", fecha: "-" },

  // OPERACIONES - DELIVERY
  { id: 13, intranet: "Operaciones", proceso: "Delivery", carpeta: "1. Público", documento: "Estándares_Despliegue_Cloud.pdf", version: "V2.5", fecha: "2026-05-12" },
  { id: 14, intranet: "Operaciones", proceso: "Delivery", carpeta: "2. Interno/Procedimiento", documento: "Manual_Arquitectura_Segura.pdf", version: "V1.1", fecha: "2025-12-01" },
  { id: 15, intranet: "Operaciones", proceso: "Delivery", carpeta: "3. Interno/Registros", documento: null, version: "-", fecha: "-" }
];

export default function ModuloDocumental({ intranet, usuarioCargo }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Lógica de Filtrado por Cargo e Intranet
  const documentosVisibles = useMemo(() => {
    return DOCUMENTOS_MOCK.filter(doc => {
      // 1. Filtro por Intranet
      if (doc.intranet !== intranet) return false;

      // 2. Filtro de Procesos según Cargo
      if (intranet === 'Financiera') {
        // Todos los cargos de financiera ven la carpeta Financiera
        return true;
      }

      if (intranet === 'Operaciones') {
        const procesosPermitidos = [];
        
        if (usuarioCargo === 'Director de Operaciones' || usuarioCargo === 'Coordinadora Operativa') {
          return true; // Ven todos los procesos de operaciones
        } else if (usuarioCargo === 'Gerente de Proyectos y Servicios') {
          procesosPermitidos.push('CX', 'Proyectos', 'Servicios');
        } else if (usuarioCargo === 'Gerente de Ingeniería') {
          procesosPermitidos.push('Delivery');
        } else {
          return false;
        }

        return procesosPermitidos.includes(doc.proceso);
      }

      return false;
    }).filter(doc => {
      // 3. Filtro por Búsqueda
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (doc.documento && doc.documento.toLowerCase().includes(term)) ||
        doc.carpeta.toLowerCase().includes(term) ||
        doc.proceso.toLowerCase().includes(term)
      );
    });
  }, [intranet, usuarioCargo, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER MÓDULO */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FolderOpen size={24} className="text-blue-600"/> Gestión Documental
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Explora la documentación vigente de los Sistemas de Gestión Integrados (SGI).
          </p>
          <div className="mt-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-flex items-center gap-1">
            <ExternalLink size={12}/> Origen: SharePoint SGI Colombia
          </div>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 bg-slate-50"
          />
        </div>
      </div>

      {/* CONTENIDO (TABLA) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <FileText size={18} className="text-slate-600"/>
          <h3 className="font-bold text-slate-700">Documentación Vigente ({documentosVisibles.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-bold">Proceso</th>
                <th className="p-4 font-bold">Carpeta Interna</th>
                <th className="p-4 font-bold">Documento</th>
                <th className="p-4 font-bold">Versión</th>
                <th className="p-4 font-bold">Fecha</th>
                <th className="p-4 font-bold text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documentosVisibles.length > 0 ? (
                documentosVisibles.map((doc) => (
                  <tr key={doc.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-slate-700">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${doc.intranet === 'Operaciones' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {doc.proceso}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <FolderOpen size={14} className="text-yellow-500"/>
                        {doc.carpeta}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-semibold">
                      {doc.documento ? (
                        <span className="text-slate-800">{doc.documento}</span>
                      ) : (
                        <span className="text-red-500 font-bold">No se registran documentos en la ruta</span>
                      )}
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-500">
                      {doc.version}
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {doc.fecha}
                    </td>
                    <td className="p-4 text-center">
                      {doc.documento && (
                        <button 
                          onClick={() => alert(`Simulando descarga de SharePoint para: ${doc.documento}`)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-full transition-colors"
                          title="Descargar Documento"
                        >
                          <Download size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No se encontraron documentos vigentes para tu perfil o criterio de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
