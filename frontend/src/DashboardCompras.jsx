import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Filter, PieChart as PieChartIcon, BarChart3, LineChart as LineChartIcon, Users } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function DashboardCompras({ solicitudes }) {
  const [periodo, setPeriodo] = useState('Ultimo trimestre');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoGrafico, setTipoGrafico] = useState('Gráfico de barras');

  // Procesamiento de Datos para la gráfica (Agrupado por mes)
  const dataArea = useMemo(() => {
    // 1. Filtrar por fecha
    let filtradas = [...solicitudes];
    const hoy = new Date();
    
    if (periodo === 'Ultimo trimestre') {
      const tresMesesAtras = new Date(hoy.setMonth(hoy.getMonth() - 3));
      filtradas = filtradas.filter(s => new Date(s.fechaOrdenCompra || s.fecha_creacion || Date.now()) >= tresMesesAtras);
    } else if (periodo === 'Ultimo semestre') {
      const seisMesesAtras = new Date(hoy.setMonth(hoy.getMonth() - 6));
      filtradas = filtradas.filter(s => new Date(s.fechaOrdenCompra || s.fecha_creacion || Date.now()) >= seisMesesAtras);
    } else if (periodo === 'Ultimo año') {
      const unAnoAtras = new Date(hoy.setFullYear(hoy.getFullYear() - 1));
      filtradas = filtradas.filter(s => new Date(s.fechaOrdenCompra || s.fecha_creacion || Date.now()) >= unAnoAtras);
    } else if (periodo === 'Periodo específico' && fechaInicio && fechaFin) {
      filtradas = filtradas.filter(s => {
        const d = new Date(s.fechaOrdenCompra || s.fecha_creacion || Date.now());
        return d >= new Date(fechaInicio) && d <= new Date(fechaFin);
      });
    }

    // 2. Agrupar por Mes
    const agrupado = {};
    const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    
    filtradas.forEach(s => {
      // Como fecha_creacion no viene en la API si no la mapeamos, usamos un fallback a Date.now o si existe.
      // Pero sí tenemos id, podemos mockear un poco el mes si no hay fechas, o usar la actual.
      const d = new Date(s.fechaOrdenCompra || Date.now()); 
      const mesKey = mesesNombres[d.getMonth()] + ' ' + d.getFullYear();
      if(!agrupado[mesKey]) agrupado[mesKey] = 0;
      agrupado[mesKey]++;
    });

    // 3. Convertir a Array para Recharts
    const result = Object.keys(agrupado).map(k => ({ mes: k, cantidad: agrupado[k] }));
    return result.reverse(); // Para que queden en orden cronológico si leímos de recientes a viejas
  }, [solicitudes, periodo, fechaInicio, fechaFin]);

  // Procesamiento para Gestores
  const dataGestores = useMemo(() => {
    const gestores = {};
    solicitudes.forEach(s => {
      const gestorName = s.gestor || 'Sin Asignar';
      if(!gestores[gestorName]) {
        gestores[gestorName] = { nombre: gestorName, atendidas: 0, sumaDias: 0 };
      }
      gestores[gestorName].atendidas++;
      gestores[gestorName].sumaDias += (s.diasHabiles || 0);
    });

    return Object.values(gestores).map(g => ({
      ...g,
      promedioDias: g.atendidas > 0 ? (g.sumaDias / g.atendidas).toFixed(1) : 0
    })).sort((a,b) => b.atendidas - a.atendidas);
  }, [solicitudes]);

  const renderGrafico = () => {
    if (dataArea.length === 0) {
      return <div className="flex items-center justify-center h-64 text-slate-400">No hay datos en el periodo seleccionado</div>;
    }

    if (tipoGrafico === 'Gráfico de barras') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataArea}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
            <XAxis dataKey="mes" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
            <Bar dataKey="cantidad" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (tipoGrafico === 'Gráfico de líneas') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dataArea}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
            <XAxis dataKey="mes" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
            <Line type="monotone" dataKey="cantidad" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (tipoGrafico === 'Gráfico circular') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={dataArea} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="cantidad" nameKey="mes" label>
              {dataArea.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* SECCIÓN SUPERIOR: ÁREA */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BarChart3 className="text-blue-600" /> Indicadores del Área (Solicitudes Atendidas)
        </h3>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-8 bg-slate-50 p-4 rounded-lg border border-slate-100 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
               <Calendar size={14}/> Periodo de revisión
            </label>
            <select 
              value={periodo} 
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            >
              <option value="Ultimo trimestre">Último trimestre</option>
              <option value="Ultimo semestre">Último semestre</option>
              <option value="Ultimo año">Último año</option>
              <option value="Periodo específico">Periodo específico...</option>
            </select>
          </div>

          {periodo === 'Periodo específico' && (
            <>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Fecha Inicio</label>
                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)}
                       className="w-full p-2.5 bg-white border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-sm"/>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Fecha Fin</label>
                <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}
                       className="w-full p-2.5 bg-white border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-sm"/>
              </div>
            </>
          )}

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
               <Filter size={14}/> Tipo de Gráfico
            </label>
            <select 
              value={tipoGrafico} 
              onChange={(e) => setTipoGrafico(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            >
              <option value="Gráfico de barras">Gráfico de barras</option>
              <option value="Gráfico de líneas">Gráfico de líneas</option>
              <option value="Gráfico circular">Gráfico circular</option>
            </select>
          </div>
        </div>

        {/* Gráfica */}
        <div className="pt-4">
          {renderGrafico()}
        </div>
      </div>

      {/* SECCIÓN INFERIOR: GESTORES */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Users className="text-blue-600" /> Indicadores de Gestores
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Gestor</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">Solicitudes Atendidas</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">Tiempo Promedio (Días)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataGestores.map((gestor, index) => (
                <tr key={index} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-semibold text-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                       {gestor.nombre.substring(0, 2).toUpperCase()}
                    </div>
                    {gestor.nombre}
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-slate-700">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{gestor.atendidas}</span>
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-slate-700">
                    <span className={`${gestor.promedioDias <= 2 ? 'text-green-600' : gestor.promedioDias <= 5 ? 'text-orange-600' : 'text-red-600'}`}>
                       {gestor.promedioDias} días
                    </span>
                  </td>
                </tr>
              ))}
              {dataGestores.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-slate-500">No hay gestores asignados aún.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
