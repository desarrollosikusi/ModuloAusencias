import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Search, Filter, TrendingUp } from 'lucide-react';
import ModalNuevoPEP from './ModalNuevoPEP';

export default function ModuloFinanciera({ perfilActual, usuarioActual }) {
  const [activeTab, setActiveTab] = useState('peps');
  const [peps, setPeps] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Filtros
  const [filtroPrincipal, setFiltroPrincipal] = useState(''); // Folio, Código PEP, Cliente, PM, AM
  const [filtroValor, setFiltroValor] = useState(''); // Dynamic value
  const [vigenciaFilter, setVigenciaFilter] = useState('Todos los años');
  
  const currentYear = new Date().getFullYear();
  const vigenciasOptions = ['Todos los años', ...Array.from({length: currentYear - 2020 + 1}, (_, i) => 2020 + i).reverse()];

  useEffect(() => {
    fetch('http://localhost:8000/api/peps')
      .then(res => res.json())
      .then(data => setPeps(data))
      .catch(err => console.error("Error fetching PEPs:", err));
  }, []);

  // Opciones dinámicas para el segundo filtro
  const opcionesSecundarias = useMemo(() => {
    if (!filtroPrincipal) return [];
    
    // Mapeo del label a la propiedad en el objeto
    const propMap = {
      'Folio': 'folio',
      'Código PEP': 'codigo_pep',
      'Cliente': 'cliente',
      'PM': 'pm',
      'AM': 'am'
    };
    
    const prop = propMap[filtroPrincipal];
    if (!prop) return [];

    // Extraer valores únicos
    const values = peps.map(p => p[prop]).filter(Boolean);
    return [...new Set(values)].sort();
  }, [peps, filtroPrincipal]);

  // Al cambiar el filtro principal, resetear el valor seleccionado
  useEffect(() => {
    setFiltroValor('');
  }, [filtroPrincipal]);

  const pepsFiltrados = useMemo(() => {
    return peps.filter(p => {
      // Filtro Vigencia
      if (vigenciaFilter !== 'Todos los años' && p.vigencia !== parseInt(vigenciaFilter)) {
        return false;
      }
      
      // Filtro Dinámico
      if (filtroPrincipal && filtroValor) {
        const propMap = {
          'Folio': 'folio',
          'Código PEP': 'codigo_pep',
          'Cliente': 'cliente',
          'PM': 'pm',
          'AM': 'am'
        };
        const prop = propMap[filtroPrincipal];
        if (p[prop] !== filtroValor) return false;
      }
      
      return true;
    });
  }, [peps, vigenciaFilter, filtroPrincipal, filtroValor]);

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
              {/* Filtro Principal */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Filtro</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Filter size={14} className="text-slate-400" />
                  </div>
                  <select 
                    value={filtroPrincipal} 
                    onChange={(e) => setFiltroPrincipal(e.target.value)}
                    className="pl-8 pr-8 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Seleccione filtro...</option>
                    <option value="Folio">Folio</option>
                    <option value="Código PEP">Código PEP</option>
                    <option value="Cliente">Cliente</option>
                    <option value="PM">PM</option>
                    <option value="AM">AM</option>
                  </select>
                </div>
              </div>

              {/* Filtro Secundario Dinámico */}
              {filtroPrincipal && (
                <div className="animate-in fade-in zoom-in duration-200">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{filtroPrincipal}</label>
                  <select 
                    value={filtroValor} 
                    onChange={(e) => setFiltroValor(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none min-w-[150px]"
                  >
                    <option value="">Todos</option>
                    {opcionesSecundarias.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}

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
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="px-3 py-2 font-bold w-8 max-w-[40px]">Folio</th>
                    <th className="px-3 py-2 font-bold">Código SAP</th>
                    <th className="px-3 py-2 font-bold">Código PEP</th>
                    <th className="px-3 py-2 font-bold">Cliente</th>
                    <th className="px-3 py-2 font-bold">Nombre del Proyecto</th>
                    <th className="px-3 py-2 font-bold">PM</th>
                    <th className="px-3 py-2 font-bold">AM</th>
                    <th className="px-3 py-2 font-bold max-w-[200px]">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pepsFiltrados.length > 0 ? (
                    pepsFiltrados.map((pep) => (
                      <tr key={pep.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2 text-xs font-semibold text-slate-700 whitespace-nowrap w-8 max-w-[40px] overflow-hidden text-ellipsis">{pep.folio}</td>
                        <td className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">{pep.codigo_sap}</td>
                        <td className="px-3 py-2 text-xs font-medium text-blue-700 whitespace-nowrap bg-blue-50/30">{pep.codigo_pep}</td>
                        <td className="px-3 py-2 text-xs font-medium text-slate-700">{pep.cliente}</td>
                        <td className="px-3 py-2 text-xs text-slate-800 leading-tight">{pep.nombre_proyecto}</td>
                        <td className="px-3 py-2 text-xs text-slate-600 leading-tight">{pep.pm}</td>
                        <td className="px-3 py-2 text-xs text-slate-600 leading-tight">{pep.am}</td>
                        <td className="px-3 py-2 text-[10px] text-slate-500 italic max-w-[250px] break-words">{pep.observaciones || '-'}</td>
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
