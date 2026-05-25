import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, CheckCircle, Clock, UserCircle, Briefcase, FileText, LayoutDashboard, Users, ArrowRight, CreditCard, Truck, TrendingUp, Building, BookOpen } from 'lucide-react';
import FormularioAusencia from './FormularioAusencia';
import FormularioAdministrativa from './FormularioAdministrativa';
import BandejaCompras from './BandejaCompras';
import ModuloDocumental from './ModuloDocumental';
import ModalDetalleSolicitud from './ModalDetalleSolicitud';

const EQUIPOS = [
  "Administrativa", "Comercial", "Equipo Bancolombia", "Ingeniería Delivery", 
  "Ingeniería Preventa", "Project Managers", "Service Delivery Managers", "Soporte"
];

const ROLES_POR_CARGO_FINANCIERA = {
  "Director Financiero": "Director Financiero",
  "Líder Gestión Cadena de Suministro": "Gestor Compras",
  "Analista de Recaudo": "Gestor Compras",
  "Especialista Comercio Exterior": "Gestor Logística",
  "Analista de Facturación y Recaudo": "Gestor Facturación",
  "Analista Controlling": "Gestor Financiero",
  "Controller": "Gestor Financiero"
};

const ROLES_POR_CARGO_OPERACIONES = {
  "Director de Operaciones": "Líder",
  "Service Delivery Manager": "Líder",
  "Gerente de Proyectos y Servicios": "Líder",
  "Gerente de Ingeniería": "Líder",
  "Coordinadora Operativa": "Funcionario"
};

const USUARIOS_FINANCIERA = [
  { nombre: "JUAN CAMILO RODRIGUEZ MORALES", cargo: "Director Financiero" },
  { nombre: "JULIAN ANDRES QUINTERO QUINTERO", cargo: "Líder Gestión Cadena de Suministro" },
  { nombre: "MARYI KATALINA RODRIGUEZ", cargo: "Analista de Recaudo" },
  { nombre: "MIGUEL ANGEL ROJAS LEON", cargo: "Especialista Comercio Exterior" },
  { nombre: "GINNA MARCELA MOGOLLON PULIDO", cargo: "Analista de Facturación y Recaudo" },
  { nombre: "JENNIFER VALENCIA CASTAÑO", cargo: "Analista Controlling" },
  { nombre: "IVAN STIVEN BONILLA RAMIREZ", cargo: "Controller" }
];

const USUARIOS_OPERACIONES = [
  { nombre: "OJGM", cargo: "Director de Operaciones" },
  { nombre: "TEOT", cargo: "Service Delivery Manager" },
  { nombre: "CJCV", cargo: "Gerente de Proyectos y Servicios" },
  { nombre: "JEBC", cargo: "Gerente de Ingeniería" },
  { nombre: "SEBS", cargo: "Coordinadora Operativa" }
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
  const [solicitudesAdmin, setSolicitudesAdmin] = useState([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  
  const cargarAdministrativas = () => {
    fetch('http://localhost:8000/api/administrativa')
      .then(res => res.json())
      .then(data => setSolicitudesAdmin(data))
      .catch(err => console.error("Error fetching administrativa:", err));
  };

  useEffect(() => {
    cargarAdministrativas();
  }, []);

  const getSemaforoColor = (dias) => {
    if (dias <= 2) return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
    if (dias <= 5) return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]';
    return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]';
  };
  
  // ESTADOS DE ARQUITECTURA (NUEVOS)
  const [intranet, setIntranet] = useState('Operaciones'); // 'Operaciones' o 'Financiera'
  const [perfil, setPerfil] = useState('Líder'); 
  const [usuarioNombre, setUsuarioNombre] = useState('Usuario Demo');
  const [usuarioCargo, setUsuarioCargo] = useState('Cargo Demo');
  
  // ESTADOS DE NAVEGACION
  const [currentModule, setCurrentModule] = useState('ausencias'); // 'ausencias' | 'administrativa' | 'compras' | 'facturacion' | 'logistica' | 'financiera'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'solicitar' | 'mis-solicitudes' | 'aprobaciones'
  const [selectedEquipo, setSelectedEquipo] = useState('Ingeniería Delivery');

  // EFECTOS PARA SINCRONIZAR NAVEGACION SEGUN PERFIL/INTRANET
  useEffect(() => {
    // Resetear modulo al cambiar intranet
    if (intranet === 'Operaciones') {
      const defaultUser = USUARIOS_OPERACIONES[0];
      setUsuarioCargo(defaultUser.cargo);
      setPerfil(ROLES_POR_CARGO_OPERACIONES[defaultUser.cargo] || 'Funcionario');
      setUsuarioNombre(defaultUser.nombre);
      setCurrentModule('ausencias');
      setActiveTab('dashboard');
    } else if (intranet === 'Financiera') {
      const defaultUser = USUARIOS_FINANCIERA[0];
      setUsuarioCargo(defaultUser.cargo);
      setPerfil(ROLES_POR_CARGO_FINANCIERA[defaultUser.cargo] || 'Gestor Financiero');
      setUsuarioNombre(defaultUser.nombre);
      setCurrentModule('compras'); 
    }
  }, [intranet]);

  const isFuncionario = perfil === 'Funcionario' || perfil === 'Líder' || perfil.startsWith('Gestor') || perfil === 'Director Financiero';
  const isLider = perfil === 'Líder' || perfil === 'Director Financiero';

  // Sincronizar las pestañas por defecto
  useEffect(() => {
    if (intranet === 'Operaciones') {
      if (currentModule === 'ausencias') setActiveTab(isFuncionario ? 'dashboard' : 'aprobaciones');
      if (currentModule === 'administrativa') setActiveTab('mis-solicitudes');
    } else {
      // Financiera: por ahora dejamos un fallback simple o dashboard genérico
      setActiveTab('dashboard');
    }
  }, [perfil, currentModule, intranet]);

  // Determinar módulos visibles según Rol Financiero
  const canSee = (moduloId) => {
    if (intranet === 'Operaciones') return true; 
    
    // Reglas Financiera
    if (moduloId === 'ausencias') return true; // Todos ven ausencias
    if (perfil === 'Director Financiero') return true; // Director ve todo
    
    if (moduloId === 'compras' && perfil === 'Gestor Compras') return true;
    if (moduloId === 'facturacion' && perfil === 'Gestor Facturación') return true;
    if (moduloId === 'logistica' && perfil === 'Gestor Logística') return true;
    if (moduloId === 'financiera' && perfil === 'Gestor Financiero') return true;
    
    return false;
  };

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
        <div className="p-6 border-b border-slate-800 flex flex-col items-center">
          <div className="bg-white rounded-xl w-full flex justify-center shadow-md mb-3 overflow-hidden h-20 items-center">
            <img src="/logo.png" alt="Ikusi Velatia" className="w-full h-full object-contain scale-[2]" />
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold text-center w-full leading-tight">
            Intranet {intranet === 'Operaciones' ? 'Dirección Operaciones' : 'Dirección Financiera'}
          </p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {/* Módulos comunes / Operaciones */}
          <button 
            onClick={() => setCurrentModule('ausencias')}
            className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${currentModule === 'ausencias' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <Calendar className="shrink-0" size={18} />
            <span className="truncate">Gestión Ausencias</span>
          </button>
          
          <button 
            onClick={() => setCurrentModule('documental')}
            className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${currentModule === 'documental' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <BookOpen className="shrink-0" size={18} />
            <span className="truncate">Gestión Documental</span>
          </button>
          
          {intranet === 'Operaciones' && (
            <button 
              onClick={() => setCurrentModule('administrativa')}
              className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${currentModule === 'administrativa' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <Briefcase className="shrink-0" size={18} />
              <span className="truncate">Gestión Administrativa</span>
            </button>
          )}

          {/* Módulos Intranet Financiera */}
          {intranet === 'Financiera' && canSee('compras') && (
            <button onClick={() => setCurrentModule('compras')} className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${currentModule === 'compras' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}>
              <CreditCard className="shrink-0" size={18} />
              <span className="truncate">Gestión Compras</span>
            </button>
          )}
          {intranet === 'Financiera' && canSee('facturacion') && (
            <button onClick={() => setCurrentModule('facturacion')} className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${currentModule === 'facturacion' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}>
              <FileText className="shrink-0" size={18} />
              <span className="truncate">Gestión Facturación</span>
            </button>
          )}
          {intranet === 'Financiera' && canSee('logistica') && (
            <button onClick={() => setCurrentModule('logistica')} className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${currentModule === 'logistica' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Truck className="shrink-0" size={18} />
              <span className="truncate">Gestión Logística</span>
            </button>
          )}
          {intranet === 'Financiera' && canSee('financiera') && (
            <button onClick={() => setCurrentModule('financiera')} className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${currentModule === 'financiera' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}>
              <TrendingUp className="shrink-0" size={18} />
              <span className="truncate">Gestión Financiera</span>
            </button>
          )}
        </nav>
        
        {/* Selector de Simulación de Arquitectura */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <div className="flex flex-col gap-4">
            
            <div>
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1 block">Simular Intranet</label>
              <select 
                value={intranet} 
                onChange={(e) => setIntranet(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white py-2 px-3 rounded-md outline-none text-xs font-medium cursor-pointer"
              >
                <option value="Operaciones">Intranet Operaciones</option>
                <option value="Financiera">Intranet Financiera</option>
              </select>
            </div>

            {intranet === 'Financiera' ? (
              <div>
                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1 block">Simular Usuario</label>
                <select 
                  value={usuarioNombre} 
                  onChange={(e) => {
                    const selected = USUARIOS_FINANCIERA.find(u => u.nombre === e.target.value);
                    if (selected) {
                      setUsuarioNombre(selected.nombre);
                      setUsuarioCargo(selected.cargo);
                      setPerfil(ROLES_POR_CARGO_FINANCIERA[selected.cargo] || 'Gestor Financiero');
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 text-white py-2 px-3 rounded-md outline-none text-xs font-medium cursor-pointer"
                >
                  {USUARIOS_FINANCIERA.map(u => <option key={u.nombre} value={u.nombre}>{u.nombre}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1 block">Simular Usuario</label>
                <select 
                  value={usuarioNombre} 
                  onChange={(e) => {
                    const selected = USUARIOS_OPERACIONES.find(u => u.nombre === e.target.value);
                    if (selected) {
                      setUsuarioNombre(selected.nombre);
                      setUsuarioCargo(selected.cargo);
                      setPerfil(ROLES_POR_CARGO_OPERACIONES[selected.cargo] || 'Funcionario');
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 text-white py-2 px-3 rounded-md outline-none text-xs font-medium cursor-pointer"
                >
                  {USUARIOS_OPERACIONES.map(u => <option key={u.nombre} value={u.nombre}>{u.nombre}</option>)}
                </select>
              </div>
            )}

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
                {currentModule === 'ausencias' && 'Módulo de Ausencias Laborales'}
                {currentModule === 'documental' && 'Módulo de Gestión Documental'}
                {currentModule === 'administrativa' && 'Módulo de Gestión Administrativa'}
                {currentModule === 'compras' && 'Módulo de Gestión de Compras'}
                {currentModule === 'facturacion' && 'Módulo de Gestión de Facturación'}
                {currentModule === 'logistica' && 'Módulo de Gestión Logística'}
                {currentModule === 'financiera' && 'Módulo de Gestión Financiera'}
              </h2>
              <p className="text-slate-500 mt-1 text-sm">
                {isFuncionario
                  ? 'Gestiona tus solicitudes y visibilidad del equipo operativo.' 
                  : 'Administra y supervisa los requerimientos operativos de tu equipo.'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-700">{usuarioNombre}</p>
                <p className="text-xs text-slate-500">{usuarioCargo}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
                {usuarioNombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
            </div>
          </div>
          
          {/* Navegación por Pestañas (Tabs) */}
          <div className="flex gap-2 mt-6 overflow-x-auto">
            {/* Tabs Ausencias */}
            {currentModule === 'ausencias' && isFuncionario && (
              <>
                <button onClick={() => setActiveTab('dashboard')} className={`px-5 py-2.5 font-medium text-sm rounded-t-lg transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-slate-50 text-blue-700 border-t border-l border-r border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'}`}><LayoutDashboard size={18}/> Dashboard Ausencias</button>
                <button onClick={() => setActiveTab('solicitar')} className={`px-5 py-2.5 font-medium text-sm rounded-t-lg transition-all flex items-center gap-2 ${activeTab === 'solicitar' ? 'bg-slate-50 text-blue-700 border-t border-l border-r border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'}`}><FileText size={18}/> Solicitar Ausencia</button>
                <button onClick={() => setActiveTab('mis-solicitudes')} className={`px-5 py-2.5 font-medium text-sm rounded-t-lg transition-all flex items-center gap-2 ${activeTab === 'mis-solicitudes' ? 'bg-slate-50 text-blue-700 border-t border-l border-r border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'}`}><Clock size={18}/> Mis Solicitudes</button>
              </>
            )}
            {currentModule === 'ausencias' && isLider && (
              <button onClick={() => setActiveTab('aprobaciones')} className={`px-5 py-2.5 font-medium text-sm rounded-t-lg transition-all flex items-center gap-2 bg-slate-50 text-blue-700 border-t border-l border-r border-slate-200`}><CheckCircle size={18}/> Bandeja de Aprobaciones</button>
            )}

            {/* Tabs Administrativa */}
            {currentModule === 'administrativa' && intranet === 'Operaciones' && (
              <>
                <button onClick={() => setActiveTab('mis-solicitudes')} className={`px-5 py-2.5 font-medium text-sm rounded-t-lg transition-all flex items-center gap-2 ${activeTab === 'mis-solicitudes' ? 'bg-slate-50 text-blue-700 border-t border-l border-r border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'}`}><Clock size={18}/> Mis Solicitudes</button>
                <button onClick={() => setActiveTab('nueva-solicitud')} className={`px-5 py-2.5 font-medium text-sm rounded-t-lg transition-all flex items-center gap-2 ${activeTab === 'nueva-solicitud' ? 'bg-slate-50 text-blue-700 border-t border-l border-r border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'}`}><FileText size={18}/> Nueva solicitud</button>
                <button onClick={() => setActiveTab('compras-pendientes')} className={`px-5 py-2.5 font-medium text-sm rounded-t-lg transition-all flex items-center gap-2 ${activeTab === 'compras-pendientes' ? 'bg-slate-50 text-blue-700 border-t border-l border-r border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'}`}><CreditCard size={18}/> Compras pendientes</button>
                <button onClick={() => setActiveTab('facturacion-pendiente')} className={`px-5 py-2.5 font-medium text-sm rounded-t-lg transition-all flex items-center gap-2 ${activeTab === 'facturacion-pendiente' ? 'bg-slate-50 text-blue-700 border-t border-l border-r border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'}`}><FileText size={18}/> Facturación pendiente</button>
              </>
            )}
          </div>
        </header>

        <div className="p-8">
          
          {/* VISTAS FUNCIONARIO */}
          
          {/* DASHBOARD AUSENCIAS (VISTA DE EQUIPO) */}
          {currentModule === 'ausencias' && isFuncionario && activeTab === 'dashboard' && (
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

          {/* FORMULARIO DE SOLICITUD */}
          {currentModule === 'ausencias' && isFuncionario && activeTab === 'solicitar' && (
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
          {currentModule === 'ausencias' && isFuncionario && activeTab === 'mis-solicitudes' && (
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
          {currentModule === 'ausencias' && isLider && activeTab === 'aprobaciones' && (
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

          {/* Módulo Administrativa (Nueva Lógica) */}
          {currentModule === 'administrativa' && activeTab === 'nueva-solicitud' && (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
               <FormularioAdministrativa 
                 onCancel={() => setActiveTab('mis-solicitudes')}
                 onSubmit={async (data) => {
                   const form = new FormData();
                   Object.keys(data).forEach(key => {
                     if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
                       form.append(key, data[key]);
                     }
                   });
                   
                   try {
                     const response = await fetch('http://localhost:8000/api/administrativa', {
                       method: 'POST',
                       body: form
                     });
                     if(response.ok) {
                       const nuevaSol = await response.json();
                       setSolicitudesAdmin(prev => [nuevaSol, ...prev]);
                       alert("Solicitud enviada y guardada en Base de Datos.");
                       setActiveTab('mis-solicitudes');
                     } else {
                       alert("Error al enviar la solicitud.");
                     }
                   } catch(error) {
                     console.error("Error HTTP", error);
                     alert("No se pudo conectar al Backend.");
                   }
                 }}
               />
            </div>
          )}

          {currentModule === 'administrativa' && activeTab === 'mis-solicitudes' && (
            <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Clock size={24} className="text-blue-600"/> Mis Solicitudes Administrativas
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Historial de todas tus peticiones enviadas a la Dirección Financiera.
                  </p>
                </div>
                <button onClick={() => setActiveTab('nueva-solicitud')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all">Nueva Solicitud</button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">Semáforo</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Tipo de solicitud</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 text-sm">PEP/CECO</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Gestor</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Tiempo en gestión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {solicitudesAdmin.filter(s => s.estado !== 'Gestionado').length > 0 ? solicitudesAdmin.filter(s => s.estado !== 'Gestionado').map((s, i) => {
                      const dias = s.diasHabiles !== undefined ? s.diasHabiles : 0;
                      return (
                      <tr key={i} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                             <div 
                               className={`w-4 h-4 rounded-full cursor-pointer hover:scale-150 transition-all ${getSemaforoColor(dias)}`} 
                               title="Haz clic para ver detalles" 
                               onClick={() => setSelectedSolicitud(s)}
                             />
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800 text-sm">{s.tipoSolicitud}</td>
                        <td className="px-6 py-4 font-medium text-slate-700 text-sm">
                           {s.tipoCompra === 'CECO' || s.ceco ? s.ceco : s.pep}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700 text-sm">{s.gestor || 'Pendiente de asignación'}</td>
                        <td className="px-6 py-4 font-medium text-slate-700 text-sm">{dias} días hábiles</td>
                      </tr>
                    )}) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                          <CheckCircle size={48} className="mx-auto text-slate-300 mb-4 opacity-50"/>
                          <p>No tienes solicitudes administrativas registradas.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentModule === 'administrativa' && activeTab !== 'nueva-solicitud' && activeTab !== 'mis-solicitudes' && (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400">
               <Building size={64} className="mb-4 opacity-50"/>
               <h2 className="text-2xl font-bold text-slate-500">Bandeja: {activeTab.replace(/-/g, ' ').toUpperCase()}</h2>
               <p className="mt-2 text-slate-400">Las solicitudes aparecerán aquí. Haz clic en "Nueva solicitud" para probar el formulario dinámico.</p>
             </div>
          )}

          {/* === MÓDULOS INTRANET FINANCIERA === */}
          {currentModule === 'compras' && (
            <BandejaCompras 
              solicitudes={solicitudesAdmin.filter(s => s.tipoSolicitud === 'Compra')} 
              perfilActual={perfil} 
              usuarioActual={usuarioNombre}
              onSolicitudActualizada={cargarAdministrativas}
            />
          )}

          {['facturacion', 'logistica', 'financiera'].includes(currentModule) && (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-xl border border-slate-200 shadow-sm mt-8">
               <CreditCard size={64} className="mb-4 opacity-30 text-blue-600"/>
               <h2 className="text-2xl font-bold text-slate-700">Módulo Exclusivo Financiero</h2>
               <p className="mt-2 text-slate-500 text-center max-w-md">Estás simulando la Intranet de la Dirección Financiera con el rol de <strong>{perfil}</strong>.</p>
             </div>
          )}

          {currentModule === 'documental' && (
            <ModuloDocumental intranet={intranet} usuarioCargo={usuarioCargo} />
          )}
          
          <ModalDetalleSolicitud 
            isOpen={!!selectedSolicitud} 
            onClose={() => setSelectedSolicitud(null)} 
            solicitud={selectedSolicitud} 
          />

        </div>
      </main>
    </div>
  );
}

export default App;
