import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

export default function ModalNuevoPEP({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    folio: '',
    codigo_sap: '',
    cliente: '',
    nombre_proyecto: '',
    pm: '',
    am: '',
    observaciones: '',
    vigencia: new Date().getFullYear(),
    pais: '',
    empresa: '',
    vertical: '',
    tipo_pep: '',
    consecutivo: ''
  });

  const [guardando, setGuardando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updates = { [name]: name === 'vigencia' ? parseInt(value) || new Date().getFullYear() : value };
      
      // Regla de negocio: Si observación es anticipada, PM debe ser "Pendiente por asignar PM"
      if (name === 'observaciones') {
        if (value === 'Compra anticipada' || value === 'Facturación anticipada') {
          updates.pm = 'Pendiente por asignar PM';
        } else if (prev.pm === 'Pendiente por asignar PM') {
          updates.pm = '';
        }
      }
      
      return { ...prev, ...updates };
    });
  };

  const getPaisCode = (p) => p === 'Colombia' ? '5C' : p === 'Perú' ? '5P' : '';
  const getEmpresaCode = (e) => e === 'Ikusi Redes' ? '10' : e === 'Ikusinet' ? '30' : '';
  const getVerticalCode = (v) => v === 'Público' ? '01' : v === 'Privado' ? '02' : '';
  const getTipoCode = (t) => {
    const map = { 'Proyecto': 'PR', 'Servicio': 'SE', 'Suministro': 'RE', 'Inversión': 'IN', 'Prueba de concepto/Demo': 'PC', 'Outsourcing': 'OU' };
    return map[t] || '';
  };

  const vigenciaStr = formData.vigencia ? String(formData.vigencia).slice(-2) : '';
  const prefixParts = [
    getPaisCode(formData.pais),
    (getEmpresaCode(formData.empresa) || '') + (getVerticalCode(formData.vertical) || ''),
    vigenciaStr + (getTipoCode(formData.tipo_pep) || '')
  ];
  const isPrefixComplete = formData.pais && formData.empresa && formData.vertical && formData.tipo_pep;
  const pepPrefix = isPrefixComplete ? `${prefixParts[0]}.${prefixParts[1]}.${prefixParts[2]}.` : '';

  const isAnticipada = formData.observaciones === 'Compra anticipada' || formData.observaciones === 'Facturación anticipada';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPrefixComplete || !formData.consecutivo) {
      alert("Por favor complete los campos para generar el Código PEP correctamente.");
      return;
    }
    
    setGuardando(true);
    
    const consecutivoBase = formData.consecutivo.split('-')[0] || '';
    const codigoSapFinal = pepPrefix + consecutivoBase;
    
    const finalData = {
      ...formData,
      codigo_pep: pepPrefix + formData.consecutivo,
      codigo_sap: codigoSapFinal
    };
    
    try {
      const response = await fetch('http://localhost:8000/api/peps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
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
              <label className="block text-sm font-semibold text-slate-700 mb-1">Vigencia (Año) *</label>
              <input type="number" name="vigencia" required min="2020" max="2100" value={formData.vigencia} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">País *</label>
              <select name="pais" required value={formData.pais} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="" disabled>Seleccione país</option>
                <option value="Colombia">Colombia</option>
                <option value="Perú">Perú</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Empresa *</label>
              <select name="empresa" required value={formData.empresa} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="" disabled>Seleccione empresa</option>
                <option value="Ikusi Redes">Ikusi Redes</option>
                <option value="Ikusinet">Ikusinet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Vertical *</label>
              <select name="vertical" required value={formData.vertical} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="" disabled>Seleccione vertical</option>
                <option value="Público">Público</option>
                <option value="Privado">Privado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo de PEP *</label>
              <select name="tipo_pep" required value={formData.tipo_pep} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="" disabled>Seleccione tipo</option>
                <option value="Proyecto">Proyecto</option>
                <option value="Servicio">Servicio</option>
                <option value="Suministro">Suministro</option>
                <option value="Inversión">Inversión</option>
                <option value="Prueba de concepto/Demo">Prueba de concepto/Demo</option>
                <option value="Outsourcing">Outsourcing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Folio *</label>
              <input type="text" name="folio" required value={formData.folio} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. FOL-001" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Código SAP *</label>
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500 select-none min-h-[38px] flex items-center">
                {isPrefixComplete && formData.consecutivo ? (pepPrefix + (formData.consecutivo.split('-')[0] || '')) : 'Se genera automáticamente'}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Código PEP *</label>
              <div className="flex border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                <div className="bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 border-r border-slate-300 select-none flex items-center justify-center min-w-[120px]">
                  {pepPrefix || 'Generando...'}
                </div>
                <input 
                  type="text" 
                  name="consecutivo" 
                  required 
                  disabled={!isPrefixComplete}
                  value={formData.consecutivo} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 text-sm outline-none bg-white disabled:bg-slate-50" 
                  placeholder={isPrefixComplete ? "Ej. 379-2" : "Complete los campos de arriba primero"} 
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">El código se forma automáticamente. Digite únicamente desde el consecutivo (Ej. 379-2).</p>
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
              <select name="pm" required value={formData.pm} onChange={handleChange} disabled={isAnticipada} className={`w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${isAnticipada ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}>
                <option value="" disabled>Seleccione un PM</option>
                {isAnticipada && <option value="Pendiente por asignar PM">Pendiente por asignar PM</option>}
                <option value="OFDQ">OFDQ - Project Manager</option>
                <option value="SLSC">SLSC - Project Manager</option>
                <option value="DKCC">DKCC - Project Manager</option>
                <option value="HDSH">HDSH - Project Manager</option>
                <option value="JASP">JASP - Project Manager</option>
                <option value="MSSL">MSSL - Project Manager</option>
                <option value="AMRV">AMRV - Service Delivery Manager</option>
                <option value="DALB">DALB - Líder SMO</option>
                <option value="IDGG">IDGG - Service Delivery Manager</option>
                <option value="LELD">LELD - Coordinador SDM</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">AM (Account Manager) *</label>
              <select name="am" required value={formData.am} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="" disabled>Seleccione un AM</option>
                <option value="DMRR">DMRR - Account Manager</option>
                <option value="JCSG">JCSG - Account Manager</option>
                <option value="AM1">AM1 - Account Manager</option>
                <option value="AM2">AM2 - Account Manager</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Observaciones *</label>
            <select name="observaciones" required value={formData.observaciones} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="" disabled>Seleccione una opción</option>
              <option value="No registra observación">No registra observación</option>
              <option value="Compra anticipada">Compra anticipada</option>
              <option value="Facturación anticipada">Facturación anticipada</option>
            </select>
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
