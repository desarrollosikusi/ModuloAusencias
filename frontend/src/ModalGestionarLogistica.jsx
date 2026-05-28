import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Save, Package, FileText, AlertCircle } from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, Image, PDFViewer } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 120, // 120 (logo height, 0 gap)
    paddingBottom: 85, // 3cm
    paddingLeft: 70.9, // 2.5cm
    paddingRight: 70.9, // 2.5cm
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 70.9,
    right: 70.9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logo: {
    height: 120,
  },
  title: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginTop: 56.7, // 2cm from top
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  signatureSection: {
    marginTop: 50,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBlock: {
    width: '45%',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 5,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f1f5f9',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  tableCell: {
    margin: 5,
    fontSize: 9,
  },
  anexoTitle: {
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    marginTop: 30,
    marginBottom: 15,
  },
  italic: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 9,
  }
});

export default function ModalGestionarLogistica({ isOpen, onClose, solicitud, usuarioActual, onGestionar }) {
  const [isAclaracionMode, setIsAclaracionMode] = useState(false);
  const [observacionesAjuste, setObservacionesAjuste] = useState('');
  const [viewingContract, setViewingContract] = useState(false);

  if (!isOpen || !solicitud) return null;

  let detalles = {};
  try {
    detalles = solicitud.detallesPrestamo ? JSON.parse(solicitud.detallesPrestamo) : {};
  } catch(e) {}

  const handleRemitirObservacion = () => {
    if (!observacionesAjuste.trim()) {
      alert("Debes ingresar una observación.");
      return;
    }
    
    // We send this as a JSON or FormData to the backend
    const data = {
      estado: 'Observado', // Or a state that indicates it goes back to PM
      observacionesLogistica: observacionesAjuste,
      gestorLogistica: usuarioActual
    };

    onGestionar(solicitud.id, data);
  };

  const handleRemitirContrato = () => {
    const data = {
      estado: 'Pendiente firma contrato',
      gestorLogistica: usuarioActual
    };
    onGestionar(solicitud.id, data);
  };

  const handleVisualizarContrato = () => {
    setViewingContract(true);
  };

  // Safe extract dates
  let minFecha = 'N/A';
  let maxFecha = 'N/A';
  if (detalles.equipos && detalles.equipos.length > 0) {
    const fechasInicio = detalles.equipos.map(e => e.fechaInicio).filter(Boolean);
    const fechasFin = detalles.equipos.map(e => e.fechaFin).filter(Boolean);
    if (fechasInicio.length > 0) minFecha = fechasInicio.sort()[0];
    if (fechasFin.length > 0) maxFecha = fechasFin.sort().reverse()[0];
  }
  const toTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package size={24} /> Gestionar Logística - Préstamo #{solicitud.id}
          </h2>
          <button onClick={onClose} className="text-blue-100 hover:bg-blue-700 p-2 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6 bg-slate-50">
          {!viewingContract ? (
            <>
              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Información de la Solicitud</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                   <div><span className="block text-slate-400 text-xs uppercase">PEP</span><span className="font-semibold">{solicitud.pep}</span></div>
                   <div><span className="block text-slate-400 text-xs uppercase">Cliente</span><span className="font-semibold">{detalles.clienteAuto || 'No especificado'}</span></div>
                   <div><span className="block text-slate-400 text-xs uppercase">Responsable del cliente</span><span className="font-semibold">{detalles.clienteResponsable?.responsable || 'No especificado'}</span></div>
                   <div><span className="block text-slate-400 text-xs uppercase">Cargo del responsable</span><span className="font-semibold">{detalles.clienteResponsable?.cargo || 'No especificado'}</span></div>
                   <div><span className="block text-slate-400 text-xs uppercase">Tipo de Identificación</span><span className="font-semibold">{detalles.clienteResponsable?.tipoIdentificacion || 'CC'}</span></div>
                   <div><span className="block text-slate-400 text-xs uppercase">Número de Identificación</span><span className="font-semibold">{detalles.clienteResponsable?.numeroIdentificacion || 'No especificado'}</span></div>
                   <div><span className="block text-slate-400 text-xs uppercase">Correo electrónico</span><span className="font-semibold">{detalles.clienteResponsable?.correo || 'No especificado'}</span></div>
                   <div><span className="block text-slate-400 text-xs uppercase">Número de celular</span><span className="font-semibold">{detalles.clienteResponsable?.celular || 'No especificado'}</span></div>
                   <div><span className="block text-slate-400 text-xs uppercase">Project Manager (PM)</span><span className="font-semibold">{solicitud.solicitante}</span></div>
                </div>
                
                <h4 className="font-semibold text-slate-700 mb-2 mt-6">Relación de equipos solicitados</h4>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  {detalles.equipos && detalles.equipos.length > 0 ? (
                    detalles.equipos.map((eq, i) => (
                      <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                        <div>
                          <span className="font-medium text-slate-800">{eq.referencia || 'Sin referencia'}</span>
                          <span className="text-slate-500 text-xs ml-2">Serial: {eq.serial || 'N/A'}</span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          Inicio: {eq.fechaInicio || 'N/A'} | Fin: {eq.fechaFin || 'N/A'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No hay equipos registrados.</p>
                  )}
                </div>

                {solicitud.observaciones && (
                  <>
                    <h4 className="font-semibold text-slate-700 mb-2 mt-6">Observaciones de la Solicitud</h4>
                    <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100 text-slate-700 text-sm whitespace-pre-wrap">
                      {solicitud.observaciones}
                    </div>
                  </>
                )}
              </section>

              {isAclaracionMode && (
                <section className="bg-orange-50 p-6 rounded-xl border border-orange-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                  <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                    <AlertCircle size={20} className="text-orange-600"/> Solicitar Aclaración al PM
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Observaciones de ajuste *</label>
                    <textarea 
                      rows="4" 
                      value={observacionesAjuste} 
                      onChange={(e) => setObservacionesAjuste(e.target.value)} 
                      className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 outline-none" 
                      placeholder="Detalla qué información o ajuste requiere el PM para continuar..."
                    ></textarea>
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-slate-200 rounded-xl overflow-hidden shadow-inner flex flex-col" style={{ minHeight: '75vh' }}>
              <PDFViewer width="100%" height="100%" className="flex-1 border-0">
                <Document>
                  <Page size="LETTER" style={styles.page}>
                    <View style={styles.header} fixed>
                      <Image src="/logo.png" style={styles.logo} />
                      <Text style={styles.title}>CONTRATO DE PRÉSTAMOS</Text>
                    </View>

                    <View style={styles.dateRow}>
                      <Text>Bogotá, {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: '2-digit' })}</Text>
                      <Text>Ikusi Redes Colombia SAS     {solicitud.pep}</Text>
                    </View>

                    <Text style={styles.paragraph}>
                      <Text style={styles.bold}>IKUSI REDES COLOMBIA SAS</Text>, PRESTA LOS EQUIPOS QUE SE RELACIONAN EN EL ANEXO ADJUNTO A <Text style={styles.bold}>{detalles.clienteAuto?.toUpperCase() || '(RAZON SOCIAL CLIENTE)'}</Text> POR UN PERIODO COMPRENDIDO ENTRE <Text style={styles.bold}>{minFecha}</Text> A <Text style={styles.bold}>{maxFecha}</Text>.
                    </Text>

                    <Text style={styles.paragraph}>
                      En conjunto con esta demostración de equipos, información confidencial de IKUSI REDES COLOMBIA SAS, será entregada para la cual el cliente se hace responsable y bajo ninguna circunstancia esta será compartida o entregada a otros para uso interno; también el cliente se compromete a que durante el periodo de préstamo se hará uso adecuado de las licencias de software las cuales están instaladas en todos los equipos de IKUSI REDES COLOMBIA SAS, y queda prohibida la copia o reproducción de dichas imágenes de software.
                    </Text>

                    <Text style={styles.paragraph}>
                      En ninguna circunstancia los equipos serán puestos en ambientes de producción para beneficio comercial o lucrativo de la empresa y podrán ser registrados en los sistemas del fabricante. Los equipos de IKUSI REDES COLOMBIA SAS, no podrán ser vendidos ni modificados en ninguna circunstancia durante el periodo de préstamo.
                    </Text>

                    <Text style={styles.paragraph}>
                      Además, el cliente se responsabiliza a devolverlos en el mismo estado en que le fueron entregados; cualquier daño ocasionado a los equipos será responsabilidad del cliente, este responderá por el valor comercial de las piezas o equipos que deban ser reemplazadas.
                    </Text>

                    <Text style={styles.paragraph}>
                      IKUSI REDES COLOMBIA SAS, no se hace responsable de ningún problema ocasionado por el préstamo de los equipos. IKUSI REDES COLOMBIA SAS, bajo ninguna circunstancia será «demandable» de cualquier accidente, perdida de información, perdida comercial o problema alguno derivado del préstamo de nuestros equipos, aunque IKUSI REDES COLOMBIA SAS, hubiese sido informado de dicha posibilidad.
                    </Text>

                    <Text style={{ marginBottom: 60 }}>En constancia se firma entre:</Text>

                    <View style={styles.signatureRow}>
                      <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine}></View>
                        <Text style={styles.bold}>IKUSI REDES COLOMBIA SAS</Text>
                        <Text><Text style={styles.bold}>Nombre:</Text> {toTitleCase(solicitud.solicitante)}</Text>
                        <Text><Text style={styles.bold}>Cargo:</Text> Project Manager</Text>
                        <Text><Text style={styles.bold}>C.C.:</Text> xxxxxxxx</Text>
                      </View>
                      <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine}></View>
                        <Text style={styles.bold}>{(detalles.clienteAuto || '').toUpperCase()}</Text>
                        <Text><Text style={styles.bold}>Responsable:</Text> {toTitleCase(detalles.clienteResponsable?.responsable || '')}</Text>
                        <Text><Text style={styles.bold}>Cargo:</Text> {toTitleCase(detalles.clienteResponsable?.cargo || '')}</Text>
                        <Text><Text style={styles.bold}>C.C.:</Text> {detalles.clienteResponsable?.numeroIdentificacion || 'xxxxxxxx'}</Text>
                      </View>
                    </View>

                    <Text style={styles.anexoTitle}>
                      ANEXO DESCRIPCIÓN DETALLADA DE LOS EQUIPOS{'\n'}IKUSI REDES COLOMBIA SAS
                    </Text>

                    <View style={styles.table}>
                      <View style={styles.tableRow}>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>CANTIDAD</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>REFERENCIA</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>SERIAL</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>FECHAS</Text></View>
                      </View>
                      {detalles.equipos && detalles.equipos.map((eq, idx) => (
                        <View style={styles.tableRow} key={idx}>
                          <View style={styles.tableCol}><Text style={{...styles.tableCell, textAlign: 'center'}}>1</Text></View>
                          <View style={styles.tableCol}><Text style={styles.tableCell}>{eq.referencia}</Text></View>
                          <View style={styles.tableCol}><Text style={styles.tableCell}>{eq.serial}</Text></View>
                          <View style={styles.tableCol}><Text style={styles.tableCell}>{eq.fechaInicio} / {eq.fechaFin}</Text></View>
                        </View>
                      ))}
                    </View>

                    <Text style={{...styles.paragraph, ...styles.italic, marginTop: 10}}>
                      Los equipos aquí relacionados se entregan en perfectas condiciones físicas y de funcionamiento para lo cual el aquí firmante se responsabiliza por cualquier daño o suceso que afecte dichos equipos.
                    </Text>

                    <View style={{ ...styles.signatureBlock, marginTop: 40 }}>
                      <View style={styles.signatureLine}></View>
                      <Text style={{...styles.bold, fontSize: 9}}>FIRMA RECIBIDO:</Text>
                      <Text style={{fontSize: 9, marginTop: 5, textTransform: 'uppercase'}}>{detalles.clienteResponsable?.responsable || 'RESPONSABLE DEL CLIENTE'}</Text>
                      <Text style={{fontSize: 9, textTransform: 'uppercase'}}>{detalles.clienteResponsable?.cargo || 'CARGO DEL RESPONSABLE'}</Text>
                      <Text style={{fontSize: 9, textTransform: 'uppercase'}}>{detalles.clienteAuto || 'RAZÓN SOCIAL DEL CLIENTE'}</Text>
                    </View>

                  </Page>
                </Document>
              </PDFViewer>
            </div>
          )}
        </div>

        <div className="bg-white px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          {!viewingContract ? (
            !isAclaracionMode ? (
              <>
                <button onClick={onClose} className="px-5 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition">
                  Cancelar
                </button>
                <button onClick={handleVisualizarContrato} className="px-5 py-2 border border-blue-200 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition flex items-center gap-2">
                  <FileText size={18} /> Visualizar Contrato
                </button>
                <button onClick={() => setIsAclaracionMode(true)} className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition flex items-center gap-2">
                  <AlertCircle size={18} /> Solicitar aclaración
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsAclaracionMode(false)} className="px-5 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition">
                  Cancelar
                </button>
                <button onClick={handleRemitirObservacion} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2">
                  <Save size={18} /> Remitir observación
                </button>
              </>
            )
          ) : (
            <>
              <button onClick={() => setViewingContract(false)} className="px-5 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition">
                Volver al detalle
              </button>
              <button onClick={() => { setViewingContract(false); setIsAclaracionMode(true); }} className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition flex items-center gap-2">
                <AlertCircle size={18} /> Remitir observación
              </button>
              <button onClick={handleRemitirContrato} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition flex items-center gap-2">
                <Save size={18} /> Remitir contrato
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
