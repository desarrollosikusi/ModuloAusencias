import React, { useState } from 'react';
import { Truck, CheckCircle, List, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import ModalDetalleSolicitud from './ModalDetalleSolicitud';
import ModalGestionarLogistica from './ModalGestionarLogistica';

export default function BandejaLogistica({ solicitudes, perfilActual, usuarioActual, onSolicitudActualizada }) {
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [modalGestion, setModalGestion] = useState(null);
  const [activeTab, setActiveTab] = useState('bandeja');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('mensual');

  const equiposPrestados = [];
  solicitudes.forEach(sol => {
    if (sol.detalles_prestamo) {
      try {
        const detalles = JSON.parse(sol.detalles_prestamo);
        if (detalles.equipos && Array.isArray(detalles.equipos)) {
          detalles.equipos.forEach((eq, idx) => {
            equiposPrestados.push({
              ...eq,
              pep: sol.pep,
              cliente: detalles.clienteResponsable?.responsable || 'N/A',
              estado: sol.estado || 'Abierto',
              id: `${sol.id}-${idx}`
            });
          });
        }
      } catch(e) {}
    }
  });

  const FESTIVOS_COLOMBIA = [
    '2026-01-01', '2026-01-12', '2026-03-23', '2026-04-02', '2026-04-03',
    '2026-05-01', '2026-05-18', '2026-06-08', '2026-06-15', '2026-06-29',
    '2026-07-20', '2026-08-07', '2026-08-17', '2026-10-12', '2026-11-02',
    '2026-11-16', '2026-12-08', '2026-12-25'
  ];

  const esDiaNoHabil = (dateObj) => {
    const day = dateObj.getDay();
    if (day === 0 || day === 6) return true;
    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    return FESTIVOS_COLOMBIA.includes(dateStr);
  };

  const entregasProgramadas = solicitudes
    .filter(s => s.estado !== 'Abierto' && s.estado !== 'Sin gestionar')
    .map(sol => {
      let entrega = null;
      let cliente = 'N/A';
      if (sol.detalles_prestamo) {
        try {
          const det = JSON.parse(sol.detalles_prestamo);
          entrega = det.entrega;
          if (det.clienteResponsable) cliente = det.clienteResponsable.responsable;
        } catch(e) {}
      }
      return {
        id: sol.id,
        pep: sol.pep,
        estado: sol.estado,
        fechaHora: entrega?.fechaHora || null,
        direccion: entrega?.direccion || 'Sin dirección',
        cliente: cliente
      };
    })
    .filter(e => e.fechaHora);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const prevPeriod = () => {
    if (calendarView === 'mensual') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  };

  const nextPeriod = () => {
    if (calendarView === 'mensual') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const monthName = currentDate.toLocaleString('es-ES', { month: 'long' });

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-1 border border-slate-100 bg-slate-50 min-h-[60px]"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      const entregasDelDia = entregasProgramadas.filter(e => e.fechaHora.startsWith(dateStr));
      const noHabil = esDiaNoHabil(dateObj);

      days.push(
        <div key={`day-${d}`} className={`p-1 border border-slate-100 min-h-[60px] flex flex-col ${noHabil ? 'bg-slate-100' : 'bg-white'}`}>
          <div className={`font-semibold text-xs mb-1 ${noHabil ? 'text-slate-400' : 'text-slate-700'}`}>{d}</div>
          <div className="flex-1 space-y-0.5 overflow-y-auto">
            {entregasDelDia.map((ent, i) => (
              <div key={i} className="text-[9px] p-1 bg-blue-50 border border-blue-200 rounded text-blue-800 cursor-pointer hover:bg-blue-100 transition leading-tight" title={`PEP: ${ent.pep}\nCliente: ${ent.cliente}\nDirección: ${ent.direccion}\nHora: ${ent.fechaHora.split('T')[1]}`}>
                <strong>{ent.pep}</strong> - {ent.fechaHora.split('T')[1]}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 capitalize text-lg">{monthName} {year}</h3>
          <div className="flex gap-4 items-center">
            <div className="flex bg-slate-200 p-1 rounded-lg">
              <button onClick={() => setCalendarView('mensual')} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${calendarView === 'mensual' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>Mensual</button>
              <button onClick={() => setCalendarView('semanal')} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${calendarView === 'semanal' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>Semanal</button>
            </div>
            <div className="flex gap-2">
              <button onClick={prevPeriod} className="p-1.5 rounded-md hover:bg-slate-300 transition text-slate-700"><ChevronLeft size={20}/></button>
              <button onClick={nextPeriod} className="p-1.5 rounded-md hover:bg-slate-300 transition text-slate-700"><ChevronRight size={20}/></button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-7 bg-slate-100 text-center text-xs font-semibold text-slate-600 uppercase">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="py-2 border-b border-slate-200">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 border-l border-t border-slate-100">
          {days}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    // Determine the Monday of the current week
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const startOfWeek = new Date(d.setDate(diff));

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      weekDays.push(dayDate);
    }

    const startMonthName = startOfWeek.toLocaleString('es-ES', { month: 'short' });
    const endMonthName = weekDays[6].toLocaleString('es-ES', { month: 'short' });
    const yearStr = startOfWeek.getFullYear();

    const hours = Array.from({length: 15}, (_, i) => i + 6); // 06:00 to 20:00

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300 flex flex-col h-[55vh] min-h-[400px]">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
          <h3 className="font-bold text-slate-800 capitalize text-base">Semana {startOfWeek.getDate()} {startMonthName} - {weekDays[6].getDate()} {endMonthName} {yearStr}</h3>
          <div className="flex gap-4 items-center">
            <div className="flex bg-slate-200 p-1 rounded-lg">
              <button onClick={() => setCalendarView('mensual')} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${calendarView === 'mensual' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>Mensual</button>
              <button onClick={() => setCalendarView('semanal')} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${calendarView === 'semanal' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>Semanal</button>
            </div>
            <div className="flex gap-2">
              <button onClick={prevPeriod} className="p-1.5 rounded-md hover:bg-slate-300 transition text-slate-700"><ChevronLeft size={20}/></button>
              <button onClick={nextPeriod} className="p-1.5 rounded-md hover:bg-slate-300 transition text-slate-700"><ChevronRight size={20}/></button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-1 overflow-y-auto relative bg-slate-50">
          {/* Timeline axis */}
          <div className="w-12 shrink-0 border-r border-slate-200 bg-white z-10 sticky left-0">
            <div className="h-8 border-b border-slate-200 bg-slate-50"></div> {/* Header spacer */}
            {hours.map(hour => (
              <div key={hour} className="h-10 border-b border-slate-100 relative">
                <span className="absolute -top-2 left-1 text-[9px] font-semibold text-slate-500">{String(hour).padStart(2, '0')}:00</span>
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="flex-1 flex w-full">
            {weekDays.map((dateObj, i) => {
              const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dateObj.getDay()];
              const isToday = new Date().toDateString() === dateObj.toDateString();
              const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
              const noHabil = esDiaNoHabil(dateObj);
              
              return (
                <div key={i} className={`flex-1 flex flex-col border-r border-slate-200 relative min-w-0 ${noHabil ? 'bg-slate-100' : 'bg-white'}`}>
                  {/* Day header sticky to top */}
                  <div className={`h-8 border-b border-slate-200 flex flex-col items-center justify-center sticky top-0 z-10 ${isToday ? 'bg-blue-50 border-b-blue-200' : (noHabil ? 'bg-slate-100' : 'bg-white')}`}>
                    <span className={`text-[9px] font-bold uppercase leading-none mb-0.5 ${noHabil ? 'text-slate-400' : 'text-slate-500'}`}>{dayName}</span>
                    <span className={`text-xs font-bold leading-none ${isToday ? 'text-blue-700 bg-blue-200 w-4 h-4 flex items-center justify-center rounded-full' : (noHabil ? 'text-slate-400' : 'text-slate-700')}`}>{dateObj.getDate()}</span>
                  </div>
                  
                  {/* Hours slots */}
                  <div className="flex-1 relative">
                    {hours.map(hour => {
                      // Filter events exactly in this hour slot
                      const startHour = String(hour).padStart(2, '0');
                      const nextHour = String(hour + 1).padStart(2, '0');
                      
                      const eventsInHour = entregasProgramadas.filter(e => {
                        if(!e.fechaHora) return false;
                        const evDate = e.fechaHora.split('T')[0];
                        if(evDate !== dateStr) return false;
                        const evHourStr = e.fechaHora.split('T')[1].split(':')[0];
                        return evHourStr === startHour;
                      });

                      return (
                        <div key={hour} className="h-10 border-b border-slate-100 p-0.5 relative group overflow-hidden">
                          {/* Sombreado de horas inactivas */}
                          {(hour < 8 || hour === 12 || hour === 13 || hour >= 16) && (
                            <div className="absolute inset-0 bg-slate-200/60 pointer-events-none" title="Horario inactivo"></div>
                          )}
                          {hour === 8 && (
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-slate-200/60 pointer-events-none" title="Horario inactivo hasta las 08:30"></div>
                          )}
                          
                          <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-50 transition pointer-events-none"></div>
                          {eventsInHour.map((ent, i) => (
                            <div key={i} className="mb-0.5 px-1 py-0.5 bg-blue-100 border border-blue-300 rounded text-blue-900 text-[8px] leading-[1] cursor-pointer hover:bg-blue-200 transition shadow-sm" title={`PEP: ${ent.pep}\nCliente: ${ent.cliente}\nDirección: ${ent.direccion}\nHora: ${ent.fechaHora.split('T')[1]}`}>
                              <strong className="block truncate">{ent.pep}</strong>
                              <span className="truncate block opacity-80">{ent.fechaHora.split('T')[1]}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const getSemaforoColor = (dias) => {
    if (dias <= 2) return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
    if (dias <= 5) return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]';
    return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]';
  };

  const handleGestionar = async (id, formData) => {
    try {
      const response = await fetch(`http://localhost:8000/api/logistica/${id}/gestionar`, {
        method: 'POST',
        body: formData
      });
      if(response.ok) {
        alert("¡Solicitud gestionada exitosamente!");
        setModalGestion(null);
        if(onSolicitudActualizada) onSolicitudActualizada();
      } else {
        alert("Hubo un error al guardar la gestión.");
      }
    } catch(err) {
      console.error(err);
      alert("Error conectando con el servidor.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Truck size={24} className="text-blue-600"/> Gestión Logística
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Administra las solicitudes de envío, recepción y préstamos de equipos.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold">
          {solicitudes.filter(s => s.estado === 'Abierto' || s.estado === 'Sin gestionar' || s.estado === 'Pendiente envío equipos').length} Pendientes
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('bandeja')}
          className={`px-6 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'bandeja' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <List size={18}/> Bandeja de Gestión
        </button>
        <button 
          onClick={() => setActiveTab('calendario')}
          className={`px-6 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'calendario' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Calendar size={18}/> Calendario Entregas
        </button>
        <button 
          onClick={() => setActiveTab('equipos')}
          className={`px-6 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'equipos' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Truck size={18}/> Equipos Prestados
        </button>
      </div>

      {activeTab === 'bandeja' && (

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">Semáforo</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">PEP</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Solicitante</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Destino / Envío a</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Tiempo en bandeja</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {solicitudes.filter(s => s.estado === 'Abierto' || s.estado === 'Sin gestionar' || s.estado === 'Pendiente envío equipos').length > 0 ? (
              solicitudes.filter(s => s.estado === 'Abierto' || s.estado === 'Sin gestionar' || s.estado === 'Pendiente envío equipos').map((sol, index) => {
                const dias = sol.diasHabiles !== undefined ? sol.diasHabiles : 0; 
                let destino = 'Sin especificar';
                if (sol.detalles_prestamo) {
                  try {
                    const detalles = JSON.parse(sol.detalles_prestamo);
                    if (detalles.entrega && detalles.entrega.direccion) {
                      destino = detalles.entrega.direccion;
                    }
                  } catch (e) {
                    console.error("Error parseando detalles", e);
                  }
                }
                
                return (
                  <tr key={index} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <div 
                          className={`w-4 h-4 rounded-full cursor-pointer hover:scale-150 transition-all ${getSemaforoColor(dias)}`} 
                          title="Ver detalles de solicitud" 
                          onClick={() => setSelectedSolicitud(sol)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 text-sm">
                        {sol.pep || 'N/A'}
                      </div>
                      <div className="text-xs text-slate-500">{sol.tipoSolicitud}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 text-sm">{sol.solicitante || 'Juan Perez'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 text-sm truncate max-w-[200px]" title={destino}>{destino}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {dias} días hábiles
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setModalGestion(sol)}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 px-4 py-1.5 rounded-md font-semibold text-sm transition"
                      >
                        Gestionar
                      </button>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                  <CheckCircle size={48} className="mx-auto text-slate-300 mb-4"/>
                  No hay solicitudes logísticas pendientes en la bandeja.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {activeTab === 'calendario' && (
        calendarView === 'mensual' ? renderMonthView() : renderWeekView()
      )}

      {activeTab === 'equipos' && (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">PEP</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Cliente</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Referencia</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Serial</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Fecha Inicio</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Fecha Fin</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Estado Solicitud</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {equiposPrestados.length > 0 ? (
              equiposPrestados.map(eq => (
                <tr key={eq.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-semibold text-slate-800 text-sm">{eq.pep}</td>
                  <td className="px-6 py-4 text-slate-700 text-sm">{eq.cliente}</td>
                  <td className="px-6 py-4 font-medium text-slate-800 text-sm">{eq.referencia}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{eq.serial}</td>
                  <td className="px-6 py-4 text-slate-700 text-sm">{eq.fechaInicio}</td>
                  <td className="px-6 py-4 text-slate-700 text-sm">{eq.fechaFin}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {eq.estado}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                  <Truck size={48} className="mx-auto text-slate-300 mb-4 opacity-50"/>
                  No hay equipos prestados registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      <ModalDetalleSolicitud 
        isOpen={!!selectedSolicitud} 
        onClose={() => setSelectedSolicitud(null)} 
        solicitud={selectedSolicitud} 
      />

      <ModalGestionarLogistica 
        isOpen={!!modalGestion}
        onClose={() => setModalGestion(null)}
        solicitud={modalGestion}
        usuarioActual={usuarioActual}
        onGestionar={handleGestionar}
      />
    </div>
  );
}
