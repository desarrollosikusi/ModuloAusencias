import React, { useState, useMemo } from 'react';
import { FolderOpen, FileText, Search, Download, ExternalLink } from 'lucide-react';
import documentosReales from './documentos.json';

const TODOS_DOCUMENTOS = [...documentosReales];

export default function ModuloDocumental({ intranet, usuarioCargo }) {
  const [searchTerm, setSearchTerm] = useState('');

  const documentosExtendidos = useMemo(() => {
    const docs = [...TODOS_DOCUMENTOS];
    // sort alphabetically by proceso then carpeta to keep it organized
    docs.sort((a, b) => {
        if (a.intranet !== b.intranet) return a.intranet.localeCompare(b.intranet);
        if (a.proceso !== b.proceso) return (a.proceso || '').localeCompare(b.proceso || '');
        return (a.carpeta || '').localeCompare(b.carpeta || '');
    });
    return docs;
  }, []);

  const documentosVisibles = useMemo(() => {
    return documentosExtendidos.filter(doc => {
      if (doc.intranet !== intranet) return false;

      if (intranet === 'Financiera') return true;

      if (intranet === 'Operaciones') {
        const procesosPermitidos = [];
        if (usuarioCargo === 'Director de Operaciones' || usuarioCargo === 'Coordinadora Operativa') {
          return true; 
        } else if (usuarioCargo === 'Gerente de Proyectos y Servicios') {
          procesosPermitidos.push('CX', 'Proyectos', 'Servicios');
        } else if (usuarioCargo && usuarioCargo.includes('Gerente de Ingenier')) {
          procesosPermitidos.push('Delivery');
        } else if (usuarioCargo === 'Project Manager') {
          procesosPermitidos.push('Proyectos');
        } else if (['Service Delivery Manager', 'Líder SMO', 'Coordinador SDM'].includes(usuarioCargo)) {
          procesosPermitidos.push('Servicios');
        } else {
          return false;
        }
        return procesosPermitidos.includes(doc.proceso);
      }
      return false;
    }).filter(doc => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (doc.documento && doc.documento.toLowerCase().includes(term)) ||
        (doc.carpeta && doc.carpeta.toLowerCase().includes(term)) ||
        (doc.proceso && doc.proceso.toLowerCase().includes(term))
      );
    });
  }, [intranet, usuarioCargo, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FolderOpen size={24} className="text-blue-600"/> Gestion Documental
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Explora la documentacion vigente de los Sistemas de Gestion Integrados (SGI).
          </p>
          <div className="mt-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-flex items-center gap-1">
            <ExternalLink size={12}/> Origen: SharePoint SGI Colombia (Sincronizado via IA)
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

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <FileText size={18} className="text-slate-600"/>
          <h3 className="font-bold text-slate-700">Documentacion Vigente ({documentosVisibles.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-3 font-bold">Proceso</th>
                <th className="p-3 font-bold">Carpeta Interna</th>
                <th className="p-3 font-bold">Documento</th>
                <th className="p-3 font-bold">Version</th>
                <th className="p-3 font-bold">Fecha</th>
                <th className="p-3 font-bold">Descripcion de IA</th>
                <th className="p-3 font-bold text-center">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documentosVisibles.length > 0 ? (
                documentosVisibles.map((doc) => (
                  <tr key={doc.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-3 text-xs font-medium text-slate-700">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${doc.intranet === 'Operaciones' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {doc.proceso}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <FolderOpen size={14} className="text-yellow-500 shrink-0"/>
                        {doc.carpeta}
                      </div>
                    </td>
                    <td className="p-3 text-xs font-semibold break-words max-w-[300px]">
                      {doc.documento ? (
                        <span className="text-slate-800">{doc.documento}</span>
                      ) : (
                        <span className="text-red-500 font-bold">No se registran documentos en la ruta</span>
                      )}
                    </td>
                    <td className="p-3 text-xs font-medium text-slate-500 whitespace-nowrap">
                      {doc.version}
                    </td>
                    <td className="p-3 text-xs text-slate-500 whitespace-nowrap">
                      {doc.fecha}
                    </td>
                    <td className="p-3 text-xs text-slate-500 italic max-w-[150px] truncate" title={doc.descripcion || doc["Descripción del Documento"]}>
                      {doc.descripcion || doc["Descripción del Documento"]}
                    </td>
                    <td className="p-3 text-center">
                      {doc.documento && (
                        <button 
                          onClick={() => alert(`Simulando descarga de: ${doc.documento}`)}
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
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No se encontraron documentos vigentes para tu perfil o criterio de busqueda.
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
