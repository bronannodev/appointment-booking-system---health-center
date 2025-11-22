import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TurnoDetalleModal from '../components/TurnoDetalleModal';
import Alert from '../components/Alert';
import { jwtDecode } from 'jwt-decode';
// import ConfirmationModal from '../components/ConfirmationModal';

// --- HELPERS PARA FORMATEAR DATOS ---
const formatFecha = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString('es-AR', { timeZone: 'UTC' });
};

const formatHora = (isoString) => {
    if (!isoString) return 'N/A';
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

// --- Componente TurnoCard (CORREGIDO) ---
function TurnoCard({ turno, onVerDetalle, onCancelar, onEliminar, isProcessing }) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaTurno = turno.fecha_hora ? new Date(turno.fecha_hora) : null;
  const isPast = fechaTurno ? fechaTurno < hoy : false;
  const canInteract = !isPast;

  let cardClasses = 'bg-white border-slate-200 shadow-sm transition-shadow relative';
  let interactionClasses = 'hover:shadow-md cursor-pointer';

  if (isPast) {
    cardClasses = 'bg-white/70 border-slate-300 opacity-75 cursor-not-allowed';
    interactionClasses = '';
  }
  if (isProcessing === turno.id) {
     cardClasses += ' opacity-60 pointer-events-none';
     interactionClasses = '';
  }

  const estadoColors = {
      pendiente: 'bg-amber-100 text-amber-800',
      confirmado: 'bg-emerald-100 text-emerald-800',
      cancelado: 'bg-rose-100 text-rose-800',
      completado: 'bg-slate-100 text-slate-800'
  };
  const estadoColorClass = estadoColors[turno.estado] || estadoColors.pendiente;

  const showCancelar = canInteract && (turno.estado === 'pendiente' || turno.estado === 'confirmado');
  const showEliminar = turno.estado === 'cancelado';
  
  // Usamos los helpers
  const fecha = formatFecha(turno.fecha_hora);
  const hora = formatHora(turno.fecha_hora);
  
  return (
    <div
      className={`rounded-xl border p-5 flex flex-col ${cardClasses} ${interactionClasses}`}
      onClick={canInteract && isProcessing !== turno.id ? () => onVerDetalle(turno) : undefined}
      onKeyPress={canInteract && isProcessing !== turno.id ? (e) => e.key === 'Enter' && onVerDetalle(turno) : undefined}
      role={canInteract && isProcessing !== turno.id ? "button" : undefined}
      tabIndex={canInteract && isProcessing !== turno.id ? 0 : -1}
      aria-disabled={isPast || isProcessing === turno.id}
    >
      {isProcessing === turno.id && (
         <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl z-10">
             <svg className="animate-spin h-6 w-6 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
         </div>
      )}

      {/* Contenido de la Card (CORREGIDO) */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">{turno.medico?.especialidad || 'Especialidad'}</h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${estadoColorClass}`}
        >
          {String(turno.estado) || 'Pendiente'}
        </span>
      </div>
      <p className="mt-1 text-slate-700 text-sm">
        Profesional: <span className="font-medium">{getNombreCompleto(turno.medico)}</span>
      </p>
      <div className="mt-4 border-t border-slate-200 pt-3 text-sm text-slate-600 space-y-1">
        <p>Día: <span className="font-medium text-slate-800">{fecha}</span></p>
        <p>Hora: <span className="font-medium text-slate-800">{hora}</span></p>
      </div>

      {canInteract && (
          <div className="mt-4">
            <span className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
              Tocar para ver detalles
            </span>
          </div>
      )}
      {isPast && (
          <div className="mt-4">
             <span className="text-sm font-medium text-slate-500">Turno pasado</span>
          </div>
      )}

      {/* Botones (sin cambios) */}
      <div className="mt-auto pt-4 border-t border-slate-200">
        {showCancelar && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onCancelar(turno.id); }}
            disabled={isProcessing === turno.id}
            className="w-full inline-flex items-center justify-center rounded-md bg-rose-600 px-3 py-1.5 text-white text-xs font-semibold shadow hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-50"
          >
            Cancelar Turno
          </button>
        )}
        {showEliminar && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEliminar(turno.id); }}
            disabled={isProcessing === turno.id}
            className="w-full inline-flex items-center justify-center rounded-md bg-slate-500 px-3 py-1.5 text-white text-xs font-semibold shadow hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
          >
            Eliminar Reserva
          </button>
        )}
         {!showCancelar && !showEliminar && !isPast && (
             <p className='text-xs text-center text-slate-500 mt-2'>Turno {turno.estado}.</p>
         )}
      </div>
    </div>
  )
}
// --- Fin TurnoCard ---

function DashboardTurnos() {
  const [selectedTurno, setSelectedTurno] = useState(null);
  const navigate = useNavigate();
  const [misTurnos, setMisTurnos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [processingTurnoId, setProcessingTurnoId] = useState(null);

  const fetchMisTurnos = useCallback(async (idUsuario, token) => {
    setError(null);
    try {
        console.log(`DashboardTurnos: Fetching turnos para cliente ID: ${idUsuario}`);
        const response = await fetch(`http://localhost:8000/turnos/cliente/${idUsuario}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error ${response.status} al obtener tus turnos`);
        }
        const data = await response.json();
        console.log("DashboardTurnos: Turnos recibidos:", data);
        setMisTurnos(data);
    } catch (err) {
        console.error("DashboardTurnos: Error en fetchMisTurnos:", err);
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('accessToken');
    let currentUserId = null;

    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            if (!decodedToken.id) { throw new Error("Token no contiene ID de usuario."); }
            currentUserId = decodedToken.id;
            if (isMounted) setUserId(currentUserId);
        } catch (err) {
            console.error("Error decoding token:", err);
            if (isMounted) setError("Tu sesión es inválida. Por favor, inicia sesión de nuevo.");
            localStorage.removeItem('accessToken');
            if (isMounted) setIsLoading(false);
            return;
        }
    } else {
        if (isMounted) setError("Necesitas iniciar sesión para ver tus turnos.");
        if (isMounted) setIsLoading(false);
        return;
    }

    if (currentUserId) {
        fetchMisTurnos(currentUserId, token);
    } else if (isMounted) {
        setError("No se pudo identificar al usuario.");
        setIsLoading(false);
    }

    return () => { isMounted = false; };
  }, [fetchMisTurnos]);

  const handleCancelarTurno = async (turnoId) => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
          setError("Necesitas iniciar sesión para cancelar.");
          return;
      }
      if (!window.confirm("¿Estás seguro de que deseas cancelar este turno?")) {
          return;
      }

      setProcessingTurnoId(turnoId);
      setError(null);

      try {
          console.log(`DashboardTurnos: Enviando PUT a /turnos/${turnoId}/cancelar`);
          const response = await fetch(`http://localhost:8000/turnos/${turnoId}/cancelar`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${token}` }
          });

          const responseText = await response.text();
          console.log(`DashboardTurnos: Respuesta Cancelar (Status ${response.status}):`, responseText);

          let updatedTurnoData;
          try {
                updatedTurnoData = JSON.parse(responseText);
          } catch(parseError) {
                console.error("DashboardTurnos: Error parseando JSON en Cancelar:", parseError);
                if (!response.ok) throw new Error(responseText || `Error ${response.status} al cancelar`);
                
                // Si la respuesta es OK pero no es JSON (raro, pero posible)
                // Recargamos los datos
                if(userId) await fetchMisTurnos(userId, token);
                setProcessingTurnoId(null);
                return;
          }

          if (!response.ok) {
              throw new Error(updatedTurnoData.detail || `Error ${response.status} al cancelar`);
          }

          // Actualización instantánea en el UI
          setMisTurnos(prevTurnos =>
              prevTurnos.map(t => (t.id === turnoId ? { ...t, estado: 'cancelado' } : t))
          );
          alert("Turno cancelado exitosamente.");

      } catch (err) {
          console.error("DashboardTurnos: Error en handleCancelarTurno:", err);
          setError(err.message || "No se pudo cancelar el turno.");
      } finally {
          setProcessingTurnoId(null);
      }
  };

  const handleEliminarTurno = async (turnoId) => {
      const token = localStorage.getItem('accessToken');
       if (!token) {
          setError("Necesitas iniciar sesión para eliminar.");
          return;
      }
       if (!window.confirm("¿Estás seguro de eliminar esta reserva cancelada? Esta acción no se puede deshacer.")) {
           return;
       }

      setProcessingTurnoId(turnoId);
      setError(null);

      try {
          console.log(`DashboardTurnos: Enviando DELETE a /turnos/${turnoId}`);
          const response = await fetch(`http://localhost:8000/turnos/${turnoId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
          });

          const responseText = await response.text();
          console.log(`DashboardTurnos: Respuesta Eliminar (Status ${response.status}):`, responseText);

          let responseData;
          try { responseData = JSON.parse(responseText); } catch(parseError) {
              console.error("DashboardTurnos: Error parseando JSON en Eliminar:", parseError);
              responseData = { message: responseText };
          }


          if (!response.ok) {
              throw new Error(responseData.detail || responseData.message || `Error ${response.status} al eliminar`);
          }

          setMisTurnos(prevTurnos => prevTurnos.filter(t => t.id !== turnoId));
          alert("Reserva eliminada exitosamente.");

      } catch (err) {
          console.error("DashboardTurnos: Error en handleEliminarTurno:", err);
          setError(err.message || "No se pudo eliminar la reserva.");
      } finally {
          setProcessingTurnoId(null);
      }
  };


  return (
    <>
      <div className="relative min-h-[calc(100vh-64px)] overflow-hidden px-4 py-10 sm:py-14">
        {/* Fondo y gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" aria-hidden />
        <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '4px 4px' }} aria-hidden />

        {/* Contenido */}
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <header className="text-white mb-8">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-slate-200">
                <path fillRule="evenodd" d="M6.75 3a.75.75 0 0 1 .75.75V5h9V3.75a.75.75 0 0 1 1.5 0V5h.75A2.25 2.25 0 0 1 21 7.25v10.5A2.25 2.25 0 0 1 18.75 20.5H5.25A2.25 2.25 0 0 1 3 17.75V7.25A2.25 2.25 0 0 1 5.25 5H6V3.75A.75.75 0 0 1 6.75 3Zm12 7.5H5.25v7.25c0 .414.336.75.75.75h12.75a.75.75 0 0 0 .75-.75V10.5Z" clipRule="evenodd" />
              </svg>
              <h1 className="text-2xl sm:text-3xl font-bold">Mis Turnos</h1>
            </div>
            <p className="mt-2 text-slate-200/90">Aquí encontrarás el historial y los próximos turnos asignados a tu cuenta.</p>
          </header>

          {/* Manejo de Carga y Error */}
          {isLoading && (
             <div className="text-center p-10 text-slate-400">Cargando tus turnos...</div>
          )}
          {!isLoading && error && (
              <div className="rounded-xl border border-rose-200 bg-white/95 p-8 text-center shadow-sm">
                  <h2 className="text-lg font-semibold text-rose-900">Error al cargar turnos</h2>
                  <p className="mt-2 text-rose-700 text-sm">{error}</p>
                  {error.includes("Necesitas iniciar sesión") && (
                       <button
                           type="button"
                           onClick={() => navigate('/login')}
                           className="mt-4 inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
                       >
                           Ir a Iniciar Sesión
                       </button>
                  )}
              </div>
          )}

          {/* Grilla de Turnos */}
          {!isLoading && !error && misTurnos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {misTurnos.map((turno) => (
                <TurnoCard
                  key={turno.id}
                  turno={turno}
                  onVerDetalle={setSelectedTurno}
                  onCancelar={handleCancelarTurno}
                  onEliminar={handleEliminarTurno}
                  isProcessing={processingTurnoId}
                />
              ))}
            </div>
          )}

          {/* Placeholder si no hay turnos */}
           {!isLoading && !error && misTurnos.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white/95 p-8 text-center shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">No tienes turnos</h2>
              <p className="mt-2 text-slate-600 text-sm">Aún no has solicitado ningún turno o no hay turnos asociados a tu cuenta.</p>
               <button
                  type="button"
                  onClick={() => navigate('/turnos')}
                  className="mt-4 inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
               >
                   Buscar Turnos Disponibles
               </button>
            </div>
          )}

          {/* Botón Volver */}
          <div className="mt-10 flex justify-start">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className='inline-flex items-center justify-center gap-2 rounded-md bg-white/90 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg hover:bg-white transition-all'
              aria-label='Volver hacia atrás'
              title='Volver hacia atrás'
            >
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className='h-5 w-5'>
                <path fillRule='evenodd' d='M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z' clipRule='evenodd' />
              </svg>
              Volver hacia atrás
            </button>
          </div>

        </div>
      </div>

      {/* Modal Detalles */}
      <AnimatePresence>
        {selectedTurno && (
          <TurnoDetalleModal
            turno={selectedTurno}
            onClose={() => setSelectedTurno(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default DashboardTurnos;