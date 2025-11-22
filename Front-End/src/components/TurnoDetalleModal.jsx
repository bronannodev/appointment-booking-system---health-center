import React from 'react';
import { motion } from 'framer-motion'; //eslint-disable-line
import { PDFDownloadLink } from '@react-pdf/renderer';
import ComprobantePDF from './ComprobantePDF';

// --- 1. AÑADIR ESTOS HELPERS ---
const formatFecha = (isoString) => {
    if (!isoString) return 'N/A';
    // Usamos timeZone: 'UTC' para que no mueva la fecha al convertir
    return new Date(isoString).toLocaleDateString('es-AR', { timeZone: 'UTC' });
};

const formatHora = (isoString) => {
    if (!isoString) return 'N/A';
    // Extraer solo la hora: HH:MM
    const date = new Date(isoString);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

const getNombreCompleto = (obj) => {
    if (!obj) return 'N/A';
    return `${obj.nombre || ''} ${obj.apellido || ''}`.trim() || 'N/A';
};
// --- FIN HELPERS ---


// --- (IconoPDF component remains the same) ---
function IconoPDF() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      {/* Tu SVG Path aquí */}
      <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 18.75 9h-4.5A.75.75 0 0 1 13.5 8.25V3.75A3.75 3.75 0 0 0 9.75 0h-4.125C4.64 0 3.75.84 3.75 1.875V1.5H5.625ZM15 3.75v4.5h4.5a.75.75 0 0 1-.75.75h-3.75a.75.75 0 0 1-.75-.75V3.75Z M12.75 15a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Z" />
      <path d="M11.25 15h-.75a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5Z M11.25 18h-.75a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5Z M9.75 15h-.75a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5Z M9.75 18h-.75a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5Z M8.25 15h-.75a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5Z M8.25 18h-.75a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5Z M15 15h-.75a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5Z M15 18h-.75a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5Z M12.75 18a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Z" />
    </svg>
  );
}

function TurnoDetalleModal({ turno, onClose }) {

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  // --- 2. USAR HELPERS AQUÍ ---
  const fecha = formatFecha(turno.fecha_hora);
  const hora = formatHora(turno.fecha_hora);
  const profesionalNombre = getNombreCompleto(turno.medico);
  // --- FIN HELPERS ---

  return (
    // Fondo (Backdrop)
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Contenido del Modal */}
      <motion.div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-xl bg-white text-slate-900 shadow-2xl flex flex-col"
        onClick={handleModalContentClick}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { delay: 0.1 } }}
        exit={{ y: 20, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-start justify-between border-b border-slate-200 p-5">
           <h2 className="text-xl font-semibold">Detalle del Turno #{turno.id}</h2>
           <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400" aria-label="Cerrar modal">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
           </button>
        </div>

        {/* Body (Scrollable) -- AQUI ESTÁN LAS CORRECCIONES */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
           
           <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Especialidad</p>
            {/* CORREGIDO: leer de turno.medico */}
            <p className="text-lg font-semibold text-slate-900">{turno.medico?.especialidad || 'N/A'}</p>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Profesional</p>
                {/* CORREGIDO: usar helper */}
                <p className="font-medium text-slate-900">{profesionalNombre}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Consultorio</p>
                {/* CORREGIDO: leer de turno.consultorio */}
                <p className="font-medium text-slate-900">{turno.consultorio?.numero || 'N/A'}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Fecha y Hora</p>
                {/* CORREGIDO: usar helpers */}
                <p className="font-medium text-slate-900">{fecha} a las {hora}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Estado</p>
                <p className="font-medium text-slate-900 capitalize">{turno.estado || 'N/A'}</p>
            </div>
           </div>

           <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Paciente</p>
                {/* Este campo ya funcionaba, lo dejamos como está */}
                <p className="font-medium text-slate-900">{turno.cliente_nombre_completo || 'N/A'}</p>
           </div>
           
           {turno.motivo && (<div className="rounded-md border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-600">Motivo de la consulta</p><p className="mt-1 text-sm text-slate-800">{turno.motivo}</p></div>)}
           {turno.fecha_creacion && (<div className="rounded-md border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-600">Turno solicitado el:</p><p className="mt-1 text-sm text-slate-800">{new Date(turno.fecha_creacion).toLocaleString()}</p></div>)}
        </div>

        {/* Footer (Acciones) */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-200 p-5 bg-slate-50 rounded-b-xl">
           <button type="button" onClick={onClose} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60">Cerrar</button>

           <PDFDownloadLink
              document={<ComprobantePDF turno={turno} />}
              fileName={`comprobante_turno_${turno.id}.pdf`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60"
           >
             {({ loading, blob: _blob, url: _url, error: _error }) => { //eslint-disable-line
                return loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generando...
                  </>
                ) : (
                  <>
                    <IconoPDF />
                    Descargar Comprobante
                  </>
                );
             }}
           </PDFDownloadLink>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default TurnoDetalleModal;