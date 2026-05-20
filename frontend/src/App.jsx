import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';

function App() {
  const [ausencias, setAusencias] = useState([]);

  useEffect(() => {
    // En producción esto iría al backend: fetch('http://localhost:8000/api/ausencias')
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

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Corporativo */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight">CorpHR Intranet</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-lg text-white font-medium">
            <Calendar size={20} />
            Ausencias
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg text-slate-300 transition">
            <CheckCircle size={20} />
            Aprobaciones
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg text-slate-300 transition">
            <Clock size={20} />
            Entregas
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Bandeja de Aprobaciones (Líder)</h2>
            <p className="text-slate-500 mt-1">Gestiona las solicitudes de tu equipo y evalúa riesgos operativos.</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm">
            Nueva Solicitud
          </button>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-medium mb-1">Solicitudes Pendientes</div>
            <div className="text-3xl font-bold text-slate-800">12</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-medium mb-1">Ausencias Activas</div>
            <div className="text-3xl font-bold text-slate-800">4</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-red-200 bg-red-50 shadow-sm">
            <div className="text-red-600 font-medium mb-1 flex items-center gap-2">
              <AlertCircle size={18} />
              Alertas de Riesgo
            </div>
            <div className="text-3xl font-bold text-red-700">2</div>
          </div>
        </div>

        {/* Tabla Inteligente */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">Funcionario</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Tipo</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Fechas</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Estado</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Riesgo Operativo</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ausencias.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{a.usuario}</div>
                    <div className="text-sm text-slate-500">{a.rol}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{a.tipo}</td>
                  <td className="px-6 py-4 text-slate-700">{a.fechas}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {a.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiesgoColor(a.riesgo)}`}>
                      {a.riesgo}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">Gestionar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default App;
