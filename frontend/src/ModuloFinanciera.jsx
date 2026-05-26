import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Search, Filter, TrendingUp } from 'lucide-react';
import ModalNuevoPEP from './ModalNuevoPEP';

export default function ModuloFinanciera({ perfilActual, usuarioActual }) {
  const [activeTab, setActiveTab] = useState('peps');
  const [peps, setPeps] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Filtros
  const currentYear = new Date().getFullYear();
  const [vigenciaFilter, setVigenciaFilter] = useState(currentYear.toString());
  const [columnFilters, setColumnFilters] = useState({
    folio: '',
    codigo_sap: '',
    codigo_pep: '',
    cliente: '',
    nombre_proyecto: '',
    pm: '',
    am: '',
    observaciones: ''
  });
  
  const vigenciasOptions = ['Todos los años', ...Array.from({length: currentYear - 2020 + 1}, (_, i) => 2020 + i).reverse()];

  useEffect(() => {
    fetch('http://localhost:8000/api/peps')
      .then(res => res.json())
      .then(data => setPeps(data))
      .catch(err => console.error("Error fetching PEPs:", err));
  }, []);

  const handleColumnFilterChange = (column, value) => {
    setColumnFilters(prev => ({ ...prev, [column]: value }));
  };

  const pepsFiltrados = useMemo(() => {
    return peps.filter(p => {
      // Filtro Vigencia
      if (vigenciaFilter !== 'Todos los años' && p.vigencia !== parseInt(vigenciaFilter)) {
        return false;
      }
      
      // Filtros por Columna
      for (const [key, value] of Object.entries(columnFilters)) {
        if (value) {
          const valStr = p[key] ? p[key].toString().toLowerCase() : '';
          if (!valStr.includes(value.toLowerCase())) {
            return false;
          }
        }
      }
      
      return true;
    });
  }, [peps, vigenciaFilter, columnFilters]);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end border-b border-slate-200 mb-6">
        <div className="flex gap-1">
          <button 
            onClick={() => setActiveTab('peps')} 
            className={`px-5 py-3 font-medium text-sm rounded-t-lg transition-all flex items-center gap-2 ${activeTab === 'peps' ? 'bg-white text-blue-700 border-t border-l border-r border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative top-[1px]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            <TrendingUp size={18}/> PEPs Ikusi
          </button>
          {/* Aquí se pueden agregar más pestañas en el futuro */}
        </div>
      </div>

      {activeTab === 'peps' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={24} className="text-blue-600"/> PEPs Ikusi
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Gestión y consulta de Proyectos Estructurados de la Dirección Financiera.
              </p>
            </div>
            
            <div className="flex flex-wrap items-end gap-3">

              {/* Filtro Vigencia */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Vigencia</label>
                <select 
                  value={vigenciaFilter} 
                  onChange={(e) => setVigenciaFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {vigenciasOptions.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 h-[38px]"
              >
                <PlusCircle size={16} /> Nuevo PEP
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 align-top whitespace-nowrap">
                      <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">Folio</div>
                      <input type="text" placeholder="Filtrar..." className="w-full text-xs px-2 py-1 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-500 font-normal bg-white" value={columnFilters.folio} onChange={(e) => handleColumnFilterChange('folio', e.target.value)} />
                    </th>
                    <th className="p-3 align-top whitespace-nowrap">
                      <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">Código SAP</div>
                      <input type="text" placeholder="Filtrar..." className="w-full text-xs px-2 py-1 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-500 font-normal bg-white" value={columnFilters.codigo_sap} onChange={(e) => handleColumnFilterChange('codigo_sap', e.target.value)} />
                    </th>
                    <th className="p-3 align-top whitespace-nowrap">
                      <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">Código PEP</div>
                      <input type="text" placeholder="Filtrar..." className="w-full text-xs px-2 py-1 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-500 font-normal bg-white" value={columnFilters.codigo_pep} onChange={(e) => handleColumnFilterChange('codigo_pep', e.target.value)} />
                    </th>
                    <th className="p-3 align-top whitespace-nowrap">
                      <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">Cliente</div>
                      <input type="text" placeholder="Filtrar..." className="w-full text-xs px-2 py-1 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-500 font-normal bg-white" value={columnFilters.cliente} onChange={(e) => handleColumnFilterChange('cliente', e.target.value)} />
                    </th>
                    <th className="p-3 align-top whitespace-nowrap">
                      <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">Nombre del Proyecto</div>
                      <input type="text" placeholder="Filtrar..." className="w-full text-xs px-2 py-1 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-500 font-normal bg-white min-w-[200px]" value={columnFilters.nombre_proyecto} onChange={(e) => handleColumnFilterChange('nombre_proyecto', e.target.value)} />
                    </th>
                    <th className="p-3 align-top whitespace-nowrap">
                      <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">PM</div>
                      <input type="text" placeholder="Filtrar..." className="w-full text-xs px-2 py-1 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-500 font-normal bg-white" value={columnFilters.pm} onChange={(e) => handleColumnFilterChange('pm', e.target.value)} />
                    </th>
                    <th className="p-3 align-top whitespace-nowrap">
                      <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">AM</div>
                      <input type="text" placeholder="Filtrar..." className="w-full text-xs px-2 py-1 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-500 font-normal bg-white" value={columnFilters.am} onChange={(e) => handleColumnFilterChange('am', e.target.value)} />
                    </th>
                    <th className="p-3 align-top whitespace-nowrap">
                      <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">Observaciones</div>
                      <input type="text" placeholder="Filtrar..." className="w-full text-xs px-2 py-1 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-500 font-normal bg-white" value={columnFilters.observaciones} onChange={(e) => handleColumnFilterChange('observaciones', e.target.value)} />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pepsFiltrados.length > 0 ? (
                    pepsFiltrados.map((pep) => (
                      <tr key={pep.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-3 text-xs font-semibold text-slate-700 whitespace-nowrap">{pep.folio}</td>
                        <td className="px-3 py-3 text-xs text-slate-600 whitespace-nowrap">{pep.codigo_sap}</td>
                        <td className="px-3 py-3 text-xs font-medium text-blue-700 whitespace-nowrap bg-blue-50/30">{pep.codigo_pep}</td>
                        <td className="px-3 py-3 text-xs font-medium text-slate-700 whitespace-nowrap">{pep.cliente}</td>
                        <td className="px-3 py-3 text-xs text-slate-800 whitespace-nowrap">{pep.nombre_proyecto}</td>
                        <td className="px-3 py-3 text-xs text-slate-600 whitespace-nowrap">{pep.pm}</td>
                        <td className="px-3 py-3 text-xs text-slate-600 whitespace-nowrap">{pep.am}</td>
                        <td className="px-3 py-3 text-xs text-slate-500 italic whitespace-nowrap">{pep.observaciones || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-12 text-center text-slate-500">
                        <Search size={48} className="mx-auto text-slate-300 mb-4 opacity-50"/>
                        <p>No se encontraron registros de PEPs que coincidan con los filtros.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <ModalNuevoPEP 
          onClose={() => setShowModal(false)}
          onSave={(nuevo) => {
            setPeps([nuevo, ...peps]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
