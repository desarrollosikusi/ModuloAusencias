import React, { useState } from 'react';
import { CreditCard, CheckCircle, Clock, LayoutDashboard, List } from 'lucide-react';
import ModalDetalleSolicitud from './ModalDetalleSolicitud';
import ModalGestionarSolicitud from './ModalGestionarSolicitud';
import DashboardCompras from './DashboardCompras';

export default function BandejaCompras({ solicitudes, perfilActual, onSolicitudActualizada }) {
  const [activeTab, setActiveTab] = useState('bandeja'); // 'bandeja' o 'dashboard'
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [modalGestion, setModalGestion] = useState(null);

  const getSemaforoColor = (dias) => {
    if (dias <= 2) return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
    if (dias <= 5) return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]';
    return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]';
  };

  const handleGestionar = async (id, datos) => {
    try {
      const response = await fetch(`http://localhost:8000/api/administrativa/${id}/gestionar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
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
            <CreditCard size={24} className="text-blue-600"/> Gestión de Compras
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Administra las solicitudes de compra remitidas por las diferentes direcciones.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold">
          {solicitudes.length} Pendientes
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('bandeja')}
          className={`px-6 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'bandeja' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <List size={18}/> Bandeja de Gestión
        </button>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`px-6 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'dashboard' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <LayoutDashboard size={18}/> Dashboard
        </button>
      </div>

      {activeTab === 'bandeja' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">Semáforo</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">PEP/CECO</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Solicitante</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Proveedor</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Tiempo en bandeja</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {solicitudes.length > 0 ? (
                solicitudes.map((sol, index) => {
                  // Mockeando días para demostración visual si no viene definido
                  const dias = sol.diasHabiles !== undefined ? sol.diasHabiles : 0; 
                  
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
                          {sol.tipoCompra === 'CECO' ? sol.ceco : sol.pep}
                        </div>
                        <div className="text-xs text-slate-500">{sol.tipoCompra}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 text-sm">{sol.solicitante || 'Juan Perez'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 text-sm">{sol.proveedor}</div>
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
                    No hay solicitudes de compra pendientes en la bandeja.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'dashboard' && (
        <DashboardCompras solicitudes={solicitudes} />
      )}

      <ModalDetalleSolicitud 
        isOpen={!!selectedSolicitud} 
        onClose={() => setSelectedSolicitud(null)} 
        solicitud={selectedSolicitud} 
      />

      <ModalGestionarSolicitud 
        isOpen={!!modalGestion}
        onClose={() => setModalGestion(null)}
        solicitud={modalGestion}
        perfilActual={perfilActual}
        onGestionar={handleGestionar}
      />

    </div>
  );
}
