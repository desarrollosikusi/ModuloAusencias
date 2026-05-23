import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, CheckCircle, Clock, UserCircle, Briefcase, FileText, LayoutDashboard, Users, ArrowRight } from 'lucide-react';
import FormularioAusencia from './FormularioAusencia';

const EQUIPOS = [
  "Comercial", "Ingeniería Preventa", "Project Managers", "Ingeniería Delivery", 
  "Service Delivery Managers", "Soporte", "Administrativa", "Equipo Bancolombia"
];

const MOCK_TEAM_ABSENCES = [
  {
    equipo: "Ingeniería Delivery",
    ausente: { nombre: "Carlos Ruiz", rol: "Ingeniero Cloud", fechas: "10 Oct - 12 Oct", foto: "CR" },
    backups: [
      { nombre: "Pedro Gómez", correo: "pedro@corphr.com", gestion: "Atención de tickets prioritarios y soporte AWS", foto: "PG" },
      { nombre: "Maria Lopez", correo: "maria@corphr.com", gestion: "Despliegues en producción", foto: "ML" }
    ]
  },
  {
    equipo: "Ingeniería Delivery",
    ausente: { nombre: "Ana Gomez", rol: "Desarrolladora Backend", fechas: "05 Oct - 07 Oct", foto: "AG" },
    backups: [
      { nombre: "Juan Perez", correo: "juan@corphr.com", gestion: "Mantenimiento de API Core", foto: "JP" }
    ]
  },
  {
    equipo: "Comercial",
    ausente: { nombre: "Laura Soto", rol: "Ejecutiva de Cuentas", fechas: "15 Oct - 20 Oct", foto: "LS" },
    backups: [
      { nombre: "Diego Torres", correo: "diego@corphr.com", gestion: "Seguimiento a clientes VIP", foto: "DT" }
    ]
  }
];

function App() {
  const [ausencias, setAusencias] = useState([]);
  const [perfil, setPerfil] = useState('Funcionario'); // 'Funcionario' o 'Líder'
  const [currentModule, setCurrentModule] = useState('ausencias'); // 'ausencias' | 'administrativa'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'solicitar' | 'mis-solicitudes' | 'aprobaciones'
  const [selectedEquipo, setSelectedEquipo] = useState('Ingeniería Delivery');

  // Cuando cambia el perfil, reiniciar a la pestaña principal de ese perfil
  useEffect(() => {
    setActiveTab(perfil === 'Funcionario' ? 'dashboard' : 'aprobaciones');
    setCurrentModule('ausencias');
  }, [perfil]);

  useEffect(() => {
    // Mock de base de datos personal/equipo
    const mockData = [
      { id: 1, usuario: "Juan Perez", rol: "Operador", tipo: "Vacaciones", fechas: "01 Oct - 15 Oct", estado: "PENDIENTE", riesgo: "BAJO" },
      { id: 2, usuario: "Ana Gomez", rol: "Analista", tipo: "Incapacidad", fechas: "05 Oct - 07 Oct", estado: "APROBADA", riesgo: "MEDIO" },
      { id: 3, usuario: "Carlos Ruiz", rol: "Supervisor", tipo: "Licencia", fechas: "10 Oct - 12 Oct", estado: "PENDIENTE", riesgo: "ALTO" },
    ];
    setAusencias(mockData);
  }, []);

  const getRiesgoColor = (riesgo) => {
    switch(riesgo) {
      case 'ALTO': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIO': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'BAJO': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const misSolicitudes = ausencias.filter(a => a.usuario === 'Juan Perez');
  const teamAbsences = MOCK_TEAM_ABSENCES.filter(a => a.equipo === selectedEquipo);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* Sidebar Corporativo */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10 shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white">CorpHR</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Intranet Empresarial</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button 
            onClick={() => setCurrentModule('ausencias')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${currentModule === 'ausencias' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <Calendar size={20} />
            Gestión Ausencias
          </button>
          <button 
            onClick={() => setCurrentModule('administrativa')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${currentModule === 'administrativa' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <Briefcase size={20} />
            Gestión Administrativa
          </button>
        </nav>
        
        {/* Selector de Perfil (Para Pruebas) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Simular Rol</label>
            <div className="relative">
              <select 
                value={perfil} 
                onChange={(e) => setPerfil(e.target.value)}
                className="w-full appearance-none bg-slate-800 border border-slate-700 text-white py-2 px-3 pr-8 rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium cursor-pointer"
              >
                <option value="Funcionario">Funcionario (Juan Perez)</option>
                <option value="Líder">Líder (Aprobador)</option>
              </select>
              <UserCircle size={16} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none"/>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        
        {/* Header Global */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-20 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {currentModule === 'ausencias' ? 'Módulo de Ausencias Laborales' : 'Módulo de Gestión Administrativa'}
              </h2>
              <p className="text-slate-500 mt-1 text-sm">
                {perfil === 'Funcionario' 
                  ? 'Gestiona tus solicitudes y visibilidad del equipo operativo.' 
                  : 'Administra y supervisa los requerimientos operativos de tu equipo.'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-700">{perfil === 'Funcionario' ? 'Juan Perez' : 'Líder de Operaciones'}</p>
                <p className="text-xs text-slate-500">{perfil === 'Funcionario' ? 'Operador N1' : 'Director'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center text-blue-700 font-bold">
                {perfil === 'Funcionario' ? 'JP' : 'LO'}
              </div>
            </div>
          </div>
          
          {/* Navegación por Pestañas (Tabs) */}
          {currentModule === 'ausencias' && (
            <div className="flex gap-2 mt-6">
              {perfil === 'Funcionario' ? (
                <>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-5 py-2.5 font-medium text-sm flex items-center gap-2 rounded-t-lg transition-all ${activeTab === 'dashboard' ? 'bg-slate-50 text-blue-700 border-t border-l border-r border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'}`}
                  >
                    <LayoutDashboard size={18}/> Dashboard Ausencias
                  </button>
                  <button 
                    onClick={() => setActiveTab('solicitar')}
                    className={`px-5 py-2.5 font-medium text-sm flex items-center gap-2 rounded-t-lg transition-all ${activeTab === 'solicitar' ? 'bg-slate-50 text-blue-700 border-t border-l border-r border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'}`}
                  >
                    <FileText size={18}/> Solicitar Ausencia
                  </button>
                  <button 
                    onClick={() => setActiveTab('mis-solicitudes')}
                    className={`px-5 py-2.5 font-medium text-sm flex items-center gap-2 rounded-t-lg transition-all ${activeTab === 'mis-solicitudes' ? 'bg-slate-50 text-blue-700 border-t border-l border-r border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'}`}
                  >
                    <Clock size={18}/> Mis Solicitudes
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setActiveTab('aprobaciones')}
                    className={`px-5 py-2.5 font-medium text-sm flex items-center gap-2 rounded-t-lg transition-all ${activeTab === 'aprobaciones' ? 'bg-slate-50 text-blue-700 border-t border-l border-r border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'}`}
                  >
                    <CheckCircle size={18}/> Bandeja de Aprobaciones
                  </button>
                </>
              )}
            </div>
          )}
        </header>

        <div className="p-8">
          
          {/* VISTAS FUNCIONARIO */}
          
          {/* DASHBOARD AUSENCIAS (VISTA DE EQUIPO) */}
          {currentModule === 'ausencias' && perfil === 'Funcionario' && activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Users size={20} className="text-blue-600"/> Visibilidad de Equipos
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Consulta quién está ausente en la organización y quién es su respaldo operativo.</p>
                </div>
                <div className="w-full md:w-auto">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Selecciona un Equipo</label>
                  <select 
                    value={selectedEquipo} 
                    onChange={(e) => setSelectedEquipo(e.target.value)}
                    className="w-full md:w-72 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium bg-slate-50"
                  >
                    {EQUIPOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                {teamAbsences.length > 0 ? teamAbsences.map((abs, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                    
                    {/* Columna Izquierda: Ausente */}
                    <div className="md:w-[35%] bg-gradient-to-br from-slate-50 to-white p-6 border-b md:border-b-0 md:border-r border-slate-200 relative">
                      <div className="absolute top-0 right-0 p-4">
                         <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-green-200">Aprobada</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-1.5"><Calendar size={14}/> Funcionario Ausente</h4>
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xl shrink-0 shadow-sm">
                          {abs.ausente.foto}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">{abs.ausente.nombre}</h3>
                          <p className="text-sm text-blue-600 font-medium mb-3">{abs.ausente.rol}</p>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm">
                            <Clock size={14} className="text-slate-400"/> {abs.ausente.fechas}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Columna Derecha: Backups */}
                    <div className="md:w-[65%] p-6 bg-white">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-1.5"><Briefcase size={14}/> Responsables (Backups Operativos)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {abs.backups.map((bk, j) => (
                          <div key={j} className="flex flex-col p-4 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                                {bk.foto}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 text-sm">{bk.nombre}</p>
                                <p className="text-xs text-slate-500">{bk.correo}</p>
                              </div>
                            </div>
                            <div className="text-xs text-slate-600 bg-white p-3 border border-slate-200 rounded-lg shadow-sm flex-1">
                              <span className="font-bold text-slate-700 block mb-1">Gestión Asignada:</span> 
                              {bk.gestion}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )) : (
                  <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users size={32} className="text-slate-300"/>
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">No hay ausencias en este equipo</h3>
                    <p className="text-slate-500 mt-2 max-w-md mx-auto">Actualmente no hay solicitudes de ausencia aprobadas para el equipo de <span className="font-semibold text-slate-700">{selectedEquipo}</span>.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SOLICITAR AUSENCIA */}
          {currentModule === 'ausencias' && perfil === 'Funcionario' && activeTab === 'solicitar' && (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
               <FormularioAusencia 
                onCancel={() => setActiveTab('mis-solicitudes')} 
                onSubmit={(data) => {
                  console.log("Datos enviados:", data);
                  alert("¡Solicitud enviada con éxito y en espera de aprobación!");
                  setActiveTab('mis-solicitudes');
                }} 
              />
            </div>
          )}

          {/* MIS SOLICITUDES (CON KPIs) */}
          {currentModule === 'ausencias' && perfil === 'Funcionario' && activeTab === 'mis-solicitudes' && (
            <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* KPIs Propios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 pointer-events-none"></div>
                  <div className="text-slate-500 font-medium mb-1 text-sm uppercase tracking-wider">Días de Vacaciones Disponibles</div>
                  <div className="text-4xl font-bold text-slate-800 mt-2">14</div>
                  <div className="text-xs text-slate-400 mt-2">Período 2023-2024</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-slate-500 font-medium mb-1 text-sm uppercase tracking-wider">Ausencias Solicitadas este Año</div>
                  <div className="text-4xl font-bold text-slate-800 mt-2">2</div>
                  <div className="text-xs text-blue-600 font-medium mt-2">Total de días: 18</div>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl shadow-md text-white flex flex-col justify-between">
                  <div>
                    <div className="font-medium text-blue-100 text-sm uppercase tracking-wider flex items-center gap-2">
                       <Calendar size={16}/> Próxima Ausencia Aprobada
                    </div>
                    <div className="text-xl font-bold mt-3">01 Oct - 15 Oct</div>
                    <div className="text-blue-100 text-sm mt-1">Vacaciones Anuales</div>
                  </div>
                </div>
              </div>
              
              {/* Atajo Central */}
              <div className="bg-white rounded-xl border border-blue-100 p-8 text-center shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-white to-blue-50/50">
                 <div className="text-left flex-1">
                   <h3 className="text-xl font-bold text-slate-800 mb-2">Gestiona tus tiempos operativos</h3>
                   <p className="text-slate-600 text-sm">
                     Crea nuevas solicitudes de incapacidad, permisos o vacaciones, y asinga responsablemente a tus backups.
                   </p>
                 </div>
                 <button 
                   onClick={() => setActiveTab('solicitar')} 
                   className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 shrink-0"
                 >
                   <FileText size={20}/>
                   Nueva Solicitud
                 </button>
              </div>

              {/* Tabla de Mis Solicitudes */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                   <h3 className="font-semibold text-slate-800">Historial de Solicitudes</h3>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-slate-600">Tipo de Ausencia</th>
                      <th className="px-6 py-4 font-semibold text-slate-600">Fechas</th>
                      <th className="px-6 py-4 font-semibold text-slate-600">Fecha de Registro</th>
                      <th className="px-6 py-4 font-semibold text-slate-600">Estado</th>
                      <th className="px-6 py-4 font-semibold text-slate-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {misSolicitudes.length > 0 ? misSolicitudes.map((a, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800">{a.tipo}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-700">{a.fechas}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm">Hace 2 días</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${a.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {a.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1">
                            Ver Soporte
                          </button>
                        </td>
                      </tr>
                    )) : (
                       <tr>
                          <td colSpan="5" className="px-6 py-12 text-center">
                             <Clock size={40} className="mx-auto text-slate-300 mb-3"/>
                             <p className="text-slate-500 font-medium">No tienes solicitudes de ausencia registradas.</p>
                          </td>
                       </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VISTAS LIDER */}
          {currentModule === 'ausencias' && perfil === 'Líder' && activeTab === 'aprobaciones' && (
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between border-l-4 border-l-yellow-400">
                  <div>
                    <div className="text-slate-500 font-medium mb-1 text-xs uppercase tracking-wider">Pendientes</div>
                    <div className="text-2xl font-bold text-slate-800">12</div>
                  </div>
                  <Clock size={28} className="text-yellow-400 opacity-80"/>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between border-l-4 border-l-blue-400">
                  <div>
                    <div className="text-slate-500 font-medium mb-1 text-xs uppercase tracking-wider">Ausencias Activas</div>
                    <div className="text-2xl font-bold text-slate-800">4</div>
                  </div>
                  <UserCircle size={28} className="text-blue-400 opacity-80"/>
                </div>
                <div className="bg-red-50 p-5 rounded-xl border border-red-200 shadow-sm flex items-center justify-between col-span-1 md:col-span-2">
                  <div>
                    <div className="text-red-700 font-bold mb-1 text-sm uppercase tracking-wider flex items-center gap-2">
                      <AlertCircle size={16}/> Alerta de Riesgo Operativo
                    </div>
                    <div className="text-red-600 text-sm font-medium">Tienes 2 solicitudes que impactan directamente Proyectos Críticos.</div>
                  </div>
                  <button className="bg-white border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition">
                    Revisar Riesgos
                  </button>
                </div>
              </div>

              {/* Tabla Inteligente Líder */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                   <h3 className="font-semibold text-slate-800">Bandeja de Aprobaciones de Equipo</h3>
                   <div className="relative">
                     <input type="text" placeholder="Buscar funcionario..." className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"/>
                     <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                   </div>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Funcionario</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Tipo</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Fechas</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Estado</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Riesgo Operativo</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ausencias.map((a, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition cursor-pointer">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                              {a.usuario.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 text-sm">{a.usuario}</div>
                              <div className="text-xs text-slate-500">{a.rol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium text-sm">{a.tipo}</td>
                        <td className="px-6 py-4 text-slate-600 text-sm">{a.fechas}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${a.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {a.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiesgoColor(a.riesgo)}`}>
                            {a.riesgo}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-4 py-1.5 rounded-md font-semibold text-sm transition">
                            Gestionar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Módulo Administrativa Placeholder */}
          {currentModule === 'administrativa' && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Briefcase size={64} className="mb-4 opacity-50"/>
              <h2 className="text-2xl font-bold text-slate-500">Módulo Administrativo en Construcción</h2>
              <p className="mt-2 text-slate-400">Esta funcionalidad estará disponible en la siguiente fase.</p>
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
}

export default App;
