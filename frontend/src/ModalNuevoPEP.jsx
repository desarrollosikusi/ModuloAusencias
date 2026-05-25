import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

export default function ModalNuevoPEP({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    folio: '',
    codigo_sap: '',
    codigo_pep: '',
    cliente: '',
    nombre_proyecto: '',
    pm: '',
    am: '',
    observaciones: '',
    vigencia: new Date().getFullYear()
  });

  const [guardando, setGuardando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'vigencia' ? parseInt(value) || new Date().getFullYear() : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const response = await fetch('http://localhost:8000/api/peps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const nuevoPEP = await response.json();
        onSave(nuevoPEP);
      } else {
        alert("Error al guardar el PEP");
      }
    } catch (error) {
      console.error("Error saving PEP:", error);
      alert("Error de conexión con el servidor");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-slate-800">Nuevo PEP</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Folio *</label>
              <input type="text" name="folio" required value={formData.folio} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. FOL-001" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Código SAP *</label>
              <input type="text" name="codigo_sap" required value={formData.codigo_sap} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. SAP-1234" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Código PEP *</label>
              <input type="text" name="codigo_pep" required value={formData.codigo_pep} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. PEP-5678" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Cliente *</label>
              <input type="text" name="cliente" required value={formData.cliente} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nombre del cliente" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre del proyecto *</label>
              <input type="text" name="nombre_proyecto" required value={formData.nombre_proyecto} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Descripción del proyecto" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">PM (Project Manager) *</label>
              <input type="text" name="pm" required value={formData.pm} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nombre del PM" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">AM (Account Manager) *</label>
              <input type="text" name="am" required value={formData.am} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nombre del AM" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Vigencia (Año) *</label>
              <input type="number" name="vigencia" required min="2020" max="2100" value={formData.vigencia} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Observaciones</label>
            <textarea name="observaciones" rows="3" value={formData.observaciones} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Opcional"></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={guardando} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">
              <Save size={18} /> {guardando ? 'Guardando...' : 'Guardar PEP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
