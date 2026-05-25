import React, { useState, useEffect } from 'react';
import { 
  Calendar, BookOpen, Briefcase, CreditCard, FileText, Truck, TrendingUp, Menu, X 
} from 'lucide-react';

import ModuloAusencias from './ModuloAusencias';
import ModuloDocumental from './ModuloDocumental';

const USUARIOS_FINANCIERA = [
  { nombre: "JUAN CAMILO RODRIGUEZ MORALES", cargo: "Director Financiero" },
  { nombre: "JULIAN ANDRES QUINTERO QUINTERO", cargo: "Lider Gestion Cadena de Suministro" },
  { nombre: "MARYI KATALINA RODRIGUEZ", cargo: "Analista de Recaudo" },
  { nombre: "MIGUEL ANGEL ROJAS LEON", cargo: "Especialista Comercio Exterior" },
  { nombre: "GINNA MARCELA MOGOLLON PULIDO", cargo: "Analista de Facturacion y Recaudo" },
  { nombre: "JENNIFER VALENCIA CASTAÑO", cargo: "Analista Controlling" },
  { nombre: "IVAN STIVEN BONILLA RAMIREZ", cargo: "Controller" }
];

const USUARIOS_OPERACIONES = [
  { nombre: "OJGM", cargo: "Director de Operaciones" },
  { nombre: "TEOT", cargo: "Service Delivery Manager" },
  { nombre: "CJCV", cargo: "Gerente de Proyectos y Servicios" },
  { nombre: "JEBC", cargo: "Gerente de Ingenieria" },
  { nombre: "SEBS", cargo: "Coordinadora Operativa" }
];

const ROLES_POR_CARGO_FINANCIERA = {
  "Director Financiero": "Director Financiero",
  "Lider Gestion Cadena de Suministro": "Gestor Compras",
  "Analista de Recaudo": "Gestor Compras",
  "Especialista Comercio Exterior": "Gestor Logistica",
  "Analista de Facturacion y Recaudo": "Gestor Facturacion",
  "Analista Controlling": "Gestor Financiero",
  "Controller": "Gestor Financiero"
};

const ROLES_POR_CARGO_OPERACIONES = {
  "Director de Operaciones": "Lider",
  "Service Delivery Manager": "Lider",
  "Gerente de Proyectos y Servicios": "Lider",
  "Gerente de Ingenieria": "Lider",
  "Coordinadora Operativa": "Funcionario"
};

export default function App() {
  const [intranet, setIntranet] = useState('Operaciones');
  const [usuarioCargo, setUsuarioCargo] = useState(USUARIOS_OPERACIONES[0].cargo);
  const [usuarioNombre, setUsuarioNombre] = useState(USUARIOS_OPERACIONES[0].nombre);
  const [perfil, setPerfil] = useState(ROLES_POR_CARGO_OPERACIONES[USUARIOS_OPERACIONES[0].cargo]);
  
  const [currentModule, setCurrentModule] = useState('ausencias');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedEquipo, setSelectedEquipo] = useState('CX');
  const [ausencias, setAusencias] = useState([]);

  const usuariosDisponibles = intranet === 'Operaciones' ? USUARIOS_OPERACIONES : USUARIOS_FINANCIERA;

  const handleUserChange = (e) => {
    const selectedName = e.target.value;
    const userObj = usuariosDisponibles.find(u => u.nombre === selectedName);
    if (userObj) {
      setUsuarioNombre(userObj.nombre);
      setUsuarioCargo(userObj.cargo);
      if (intranet === 'Operaciones') {
        setPerfil(ROLES_POR_CARGO_OPERACIONES[userObj.cargo] || 'Funcionario');
      } else {
        setPerfil(ROLES_POR_CARGO_FINANCIERA[userObj.cargo] || 'Gestor Financiero');
      }
    }
  };

  useEffect(() => {
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

  const isFuncionario = perfil === 'Funcionario' || perfil === 'Lider' || perfil.startsWith('Gestor') || perfil === 'Director Financiero';
  const isLider = perfil === 'Lider' || perfil === 'Director Financiero';

  useEffect(() => {
    if (intranet === 'Operaciones') {
      if (currentModule === 'ausencias') setActiveTab(isFuncionario ? 'dashboard' : 'aprobaciones');
      if (currentModule === 'administrativa') setActiveTab('mis-solicitudes');
    } else {
      setActiveTab('dashboard');
    }
  }, [perfil, currentModule, intranet]);

  const canSee = (moduloId) => {
    if (intranet === 'Operaciones') return true; 
    if (moduloId === 'ausencias') return true; 
    if (perfil === 'Director Financiero') return true; 
    if (moduloId === 'compras' && perfil === 'Gestor Compras') return true;
    if (moduloId === 'facturacion' && perfil === 'Gestor Facturacion') return true;
    if (moduloId === 'logistica' && perfil === 'Gestor Logistica') return true;
    if (moduloId === 'financiera' && perfil === 'Gestor Financiero') return true;
    return false;
  };

  useEffect(() => {
    const mockData = [
      { id: 1, usuario: "Juan Perez", rol: "Operador", tipo: "Vacaciones", fechas: "01 Oct - 15 Oct", estado: "PENDIENTE", riesgo: "BAJO" },
      { id: 2, usuario: "Ana Gomez", rol: "Analista", tipo: "Incapacidad", fechas: "05 Oct - 07 Oct", estado: "APROBADA", riesgo: "MEDIO" },
      { id: 3, usuario: "Carlos Ruiz", rol: "Supervisor", tipo: "Licencia", fechas: "10 Oct - 12 Oct", estado: "PENDIENTE", riesgo: "ALTO" },
    ];
    setAusencias(mockData);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10 shrink-0">
        <div className="p-6 border-b border-slate-800 flex flex-col items-center">
          <div className="bg-white rounded-xl w-full flex justify-center shadow-md mb-3 overflow-hidden h-20 items-center">
            <img src="/logo.png" alt="Ikusi Velatia" className="w-full h-full object-contain scale-[2]" />
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold text-center w-full leading-tight">
            Intranet {intranet === 'Operaciones' ? 'Direccion Operaciones' : 'Direccion Financiera'}
          </p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button 
            onClick={() => setCurrentModule('ausencias')}
            className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${currentModule === 'ausencias' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <Calendar className="shrink-0" size={18} />
            <span className="truncate">Gestion Ausencias</span>
          </button>
          
          <button 
            onClick={() => setCurrentModule('documental')}
            className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${currentModule === 'documental' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <BookOpen className="shrink-0" size={18} />
            <span className="truncate">Gestion Documental</span>
          </button>
          
          {intranet === 'Operaciones' && (
            <button 
              onClick={() => setCurrentModule('administrativa')}
              className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${currentModule === 'administrativa' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <Briefcase className="shrink-0" size={18} />
              <span className="truncate">Gestion Administrativa</span>
            </button>
          )}

          {intranet === 'Financiera' && canSee('compras') && (
            <button onClick={() => setCurrentModule('compras')} className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${currentModule === 'compras' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}>
              <CreditCard className="shrink-0" size={18} />
              <span className="truncate">Gestion Compras</span>
            </button>
          )}
          {intranet === 'Financiera' && canSee('facturacion') && (
            <button onClick={() => setCurrentModule('facturacion')} className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${currentModule === 'facturacion' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}>
              <FileText className="shrink-0" size={18} />
              <span className="truncate">Gestion Facturacion</span>
            </button>
          )}
          {intranet === 'Financiera' && canSee('logistica') && (
            <button onClick={() => setCurrentModule('logistica')} className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${currentModule === 'logistica' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Truck className="shrink-0" size={18} />
              <span className="truncate">Gestion Logistica</span>
            </button>
          )}
          {intranet === 'Financiera' && canSee('financiera') && (
            <button onClick={() => setCurrentModule('financiera')} className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${currentModule === 'financiera' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}>
              <TrendingUp className="shrink-0" size={18} />
              <span className="truncate">Gestion Financiera</span>
            </button>
          )}
        </nav>
        
        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Entorno Intranet</label>
              <select 
                value={intranet} 
                onChange={(e) => setIntranet(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2 rounded focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="Operaciones">Intranet Operaciones</option>
                <option value="Financiera">Intranet Financiera</option>
              </select>
            </div>
            
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Simular Usuario ({intranet})</label>
              <select 
                value={usuarioNombre} 
                onChange={handleUserChange}
                className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2 rounded focus:ring-1 focus:ring-blue-500 outline-none"
              >
                {usuariosDisponibles.map(u => (
                  <option key={u.nombre} value={u.nombre}>{u.nombre} ({u.cargo})</option>
                ))}
              </select>
              <div className="mt-2 text-[10px] flex items-center justify-between">
                <span className="text-slate-400">Rol asignado:</span>
                <span className="text-blue-400 font-bold px-2 py-0.5 bg-blue-500/10 rounded">{perfil}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        <header className="bg-white border-b border-slate-200 h-16 shrink-0 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800">
              {currentModule === 'ausencias' && 'Gestion de Ausencias y Vacaciones'}
              {currentModule === 'documental' && 'Gestion Documental'}
              {currentModule === 'administrativa' && 'Gestion Administrativa'}
              {currentModule === 'compras' && 'Bandeja de Compras'}
              {currentModule === 'facturacion' && 'Bandeja de Facturacion'}
              {currentModule === 'logistica' && 'Bandeja de Logistica'}
              {currentModule === 'financiera' && 'Bandeja Financiera'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
              {usuarioNombre.substring(0,2).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-slate-700">{usuarioNombre}</p>
              <p className="text-xs text-slate-500">{usuarioCargo}</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 relative">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
          
          {currentModule === 'ausencias' && (
            <ModuloAusencias 
              perfil={perfil}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              ausencias={ausencias}
              isLider={isLider}
              isFuncionario={isFuncionario}
            />
          )}

          {currentModule === 'documental' && (
            <ModuloDocumental 
              intranet={intranet} 
              usuarioCargo={usuarioCargo} 
            />
          )}

          {currentModule !== 'ausencias' && currentModule !== 'documental' && (
            <div className="flex items-center justify-center h-full text-slate-400">
              Modulo en construccion: {currentModule}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
