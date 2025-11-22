// Front-End/src/pages/MedicosDashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; //eslint-disable-line
import { getDecodedToken, getAuthHeaders } from '../utils/auth'; // Importamos utils de autenticación

// --- INICIO: FUNCIONES HELPER ---
/**
 * Formatea una fecha ISO a hora local (ej: "09:30")
 * Usando UTC para evitar corrimientos de día.
 */
const formatHora = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    } catch (e) { //eslint-disable-line
        return 'Hora inválida';
    }
};

/**
 * Verifica si una fecha ISO (UTC) corresponde al día de "hoy" en la zona local.
 */
const isToday = (someDateISO) => {
    if (!someDateISO) return false;
    const today = new Date();
    
    // Convertimos la fecha del turno (que viene en UTC)
    const date = new Date(someDateISO);
    const dateUTC = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

    // Comparamos con la fecha local de "hoy"
    return dateUTC.getDate() === today.getDate() &&
           dateUTC.getMonth() === today.getMonth() &&
           dateUTC.getFullYear() === today.getFullYear();
};
// --- FIN: FUNCIONES HELPER ---


// --- Componente Card (Sin cambios) ---
function Card({ title, description, actionLabel, onAction, icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col">
      <div className="flex items-center gap-3">
        {icon ? (
          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
            {icon}
          </div>
        ) : null}
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>
      {description ? <p className="mt-2 text-slate-600 text-sm">{description}</p> : null}
      {onAction ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-white text-sm font-semibold shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {actionLabel || 'Abrir'}
          </button>
        </div>
      ) : null}
    </div>
  )
}


function MedicosDashboard() {
  const navigate = useNavigate();

  // --- Estados para los datos dinámicos ---
  const [proximoTurno, setProximoTurno] = useState(null);
  const [turnosHoy, setTurnosHoy] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    turnosHoy: 0,
    pacientes: 0,
    calificacion: 4.8, // Mantenemos este como estático (demo)
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // --- Fin de Estados ---


  // --- useEffect para cargar todos los datos del dashboard ---
  const fetchDashboardData = useCallback(async () => {
    const decodedToken = getDecodedToken();
    if (!decodedToken || decodedToken.rol !== 'medico') {
      navigate('/login');
      return;
    }

    const medicoId = decodedToken.id;
    const headers = getAuthHeaders();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch de todos los turnos del médico (el nuevo endpoint)
      const turnosResponse = await fetch(`http://localhost:8000/turnos/medico/${medicoId}`, { headers });
      if (!turnosResponse.ok) {
        const err = await turnosResponse.json();
        throw new Error(err.detail || 'Error al cargar los turnos del médico.');
      }
      const allTurnos = await turnosResponse.json();

      // 2. Fetch de las estadísticas (el nuevo endpoint)
      const statsResponse = await fetch(`http://localhost:8000/medicos/${medicoId}/estadisticas`, { headers });
      if (!statsResponse.ok) {
        const err = await statsResponse.json();
        throw new Error(err.detail || 'Error al cargar las estadísticas.');
      }
      const statsData = await statsResponse.json();

      // 3. Procesar los datos en el frontend
      
      const ahora = new Date();
      
      // Filtrar "Próximo Turno"
      // Buscamos el primer turno 'pendiente' o 'confirmado' que sea en el futuro
      const proximo = allTurnos
        .filter(t => (t.estado === 'pendiente' || t.estado === 'confirmado') && new Date(t.fecha_hora) > ahora)
        .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))[0]; // [0] es el más cercano
      
      setProximoTurno(proximo || null);

      // Filtrar "Turnos de Hoy"
      const hoy = allTurnos
        .filter(t => isToday(t.fecha_hora)) // Usamos el helper corregido
        .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora)); // Ordena por hora
      
      setTurnosHoy(hoy);

      // 4. Actualizar estado de estadísticas
      setEstadisticas(prev => ({
        ...prev,
        turnosHoy: statsData.turnos_hoy,
        pacientes: statsData.pacientes_totales,
      }));

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  // --- Fin useEffect ---


  return (
    <motion.div
      className="relative min-h-[calc(100vh-64px)] overflow-hidden px-4 py-10 sm:py-14"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.25 } }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
    >
      {/* Fondo y gradiente (sin cambios) */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" aria-hidden />
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '4px 4px' }}
        aria-hidden
      />

      {/* Contenido */}
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header (sin cambios) */}
        <header className="text-white mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Panel de Médico</h1>
          <p className="mt-1 text-slate-200/90">Gestiona tu consultorio y pacientes.</p>
        </header>

        {/* --- Mostrar Error si existe --- */}
        {error && (
            <div className="mb-4 bg-rose-100 border border-rose-300 text-rose-900 p-4 rounded-lg">
                <strong>Error:</strong> {error}
            </div>
        )}

        {/* Layout Grid (sin cambios en estructura) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
          {/* Sidebar (Los botones ya estaban correctos) */}
          <aside className="sm:col-span-5 lg:col-span-4 xl:col-span-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
              <h2 className="text-base text-center font-semibold text-slate-900">Opciones del consultorio</h2>
              {/* Botones del Sidebar de Médico (Rutas actualizadas) */}
              <div className="mt-4 flex flex-col divide-y divide-slate-200">
                <button
                  type="button"
                  onClick={() => navigate('/medico/turnos')} // Ruta correcta
                  className="w-full text-left rounded-lg px-4 py-4 text-sm sm:text-base font-medium text-blue-900 bg-blue-100 hover:bg-blue-200 flex items-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                    <path fillRule="evenodd" d="M6.75 3a.75.75 0 0 1 .75.75V5h9V3.75a.75.75 0 0 1 1.5 0V5h.75A2.25 2.25 0 0 1 21 7.25v10.5A2.25 2.25 0 0 1 18.75 20.5H5.25A2.25 2.25 0 0 1 3 17.75V7.25A2.25 2.25 0 0 1 5.25 5H6V3.75A.75.75 0 0 1 6.75 3Zm12 7.5H5.25v7.25c0 .414.336.75.75.75h12.75a.75.75 0 0 0 .75-.75V10.5Z" clipRule="evenodd" />
                  </svg>
                  Ver mis turnos
                </button>
                 <button
                  type="button"
                  onClick={() => navigate('/medico/pacientes')} // Ruta correcta
                  className="w-full text-left rounded-lg px-4 py-4 text-sm sm:text-base font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 flex items-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                     <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 0 1 6 0 3 3 0 0 1-6 0Zm6.75-3a3.75 3.75 0 1 0-7.5 0 3.75 3.75 0 0 0 7.5 0Z" clipRule="evenodd" />
                  </svg>
                   Mis pacientes
                 </button>
                 <button
                  type="button"
                  onClick={() => navigate('/medico/horarios')} // Ruta correcta
                  className="w-full text-left rounded-lg px-4 py-4 text-sm sm:text-base font-medium text-blue-900 bg-blue-100 hover:bg-blue-200 flex items-center gap-3"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                     <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.75 6a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 10.5a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V11.25A.75.75 0 0 1 12 10.5Z" clipRule="evenodd" />
                   </svg>
                   Gestionar horarios
                 </button>
                 <button
                  type="button"
                  onClick={() => navigate('/medico/historial')} // Ruta correcta
                  className="w-full text-left rounded-lg px-4 py-4 text-sm sm:text-base font-medium text-blue-900 bg-blue-100 hover:bg-blue-200 flex items-center gap-3"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                     <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM17.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM19.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM4.5 6.75A.75.75 0 0 1 5.25 6h13.5a.75.75 0 0 1 0 1.5H5.25a.75.75 0 0 1-.75-.75Zm0 4.5A.75.75 0 0 1 5.25 10.5h13.5a.75.75 0 0 1 0 1.5H5.25a.75.75 0 0 1-.75-.75ZM2.25 21a.75.75 0 0 1-.75-.75V3.75a.75.75 0 0 1 .75-.75h6.75c.414 0 .75.336.75.75v3a.75.75 0 0 0 .75.75h3.75a.75.75 0 0 0 .75-.75v-3a.75.75 0 0 1 .75-.75h6.75a.75.75 0 0 1 .75.75v16.5a.75.75 0 0 1-.75.75H2.25Z" />
                   </svg>
                   Historial médico
                 </button>
                 <button
                  type="button"
                  onClick={() => navigate('/medico/reportes')} // Ruta correcta
                  className="w-full text-left rounded-lg px-4 py-4 text-sm sm:text-base font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 flex items-center gap-3"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                     <path d="M11.7 2.004a.75.75 0 0 1 .6 0L20.25 6a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75V6.75a.75.75 0 0 1 .75-.75l7.95-3.996ZM12 4.093l-7.5 3.75v8.157h15V7.849L12 4.093Z" />
                   </svg>
                   Mis reportes
                 </button>
              </div>
            </div>
          </aside>

          {/* Contenido Principal (CORREGIDO) */}
          <main className="sm:col-span-7 lg:col-span-8 xl:col-span-8">
            
            {/* --- Card Próximo Turno (CORREGIDO) --- */}
            <div className="rounded-xl border border-emerald-200 bg-white shadow-sm p-5 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Tu próximo turno</h2>
                  {isLoading ? (
                    <p className="mt-1 text-slate-600 text-sm">Cargando...</p>
                  ) : proximoTurno ? (
                    <>
                      <p className="mt-1 text-slate-600 text-sm">
                        Paciente: <span className="font-medium text-slate-800">{proximoTurno.cliente_nombre_completo || 'N/A'}</span> · Hora: <span className="font-medium text-slate-800">{formatHora(proximoTurno.fecha_hora)}</span>
                      </p>
                      <p className="mt-1 text-slate-600 text-sm">
                        Motivo: <span className="font-medium text-slate-800">{proximoTurno.motivo || 'N/A'}</span> · Consultorio: <span className="font-medium text-slate-800">{proximoTurno.consultorio?.numero || 'N/A'}</span>
                      </p>
                    </>
                  ) : (
                     <p className="mt-1 text-slate-600 text-sm">No tienes turnos próximos.</p>
                  )}
                </div>
                {proximoTurno && !isLoading && (
                  <div className="shrink-0">
                    <button
                      type="button"
                      // onClick={() => navigate(`/medico/turno/${proximoTurno.id}`)} // (Ruta futura)
                      className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-white text-sm font-semibold shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      Ver detalles
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* --- Estadísticas del Día (Dinámico) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
               {/* Card Turnos Hoy */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path fillRule="evenodd" d="M6.75 3a.75.75 0 0 1 .75.75V5h9V3.75a.75.75 0 0 1 1.5 0V5h.75A2.25 2.25 0 0 1 21 7.25v10.5A2.25 2.25 0 0 1 18.75 20.5H5.25A2.25 2.25 0 0 1 3 17.75V7.25A2.25 2.25 0 0 1 5.25 5H6V3.75A.75.75 0 0 1 6.75 3Zm12 7.5H5.25v7.25c0 .414.336.75.75.75h12.75a.75.75 0 0 0 .75-.75V10.5Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{isLoading ? '...' : estadisticas.turnosHoy}</p>
                    <p className="text-sm text-slate-600">Turnos hoy</p>
                  </div>
                </div>
              </div>
               {/* Card Pacientes */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
                 <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M4.5 6.375a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 .75.75v11.25a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V6.375Z" />
                     </svg>
                  </div>
                   <div>
                    <p className="text-2xl font-bold text-slate-900">{isLoading ? '...' : estadisticas.pacientes}</p>
                    <p className="text-sm text-slate-600">Pacientes totales</p>
                  </div>
                 </div>
              </div>
               {/* Card Calificación (Estático) */}
               <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
                 <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                     </svg>
                   </div>
                   <div>
                    <p className="text-2xl font-bold text-slate-900">{estadisticas.calificacion}</p>
                    <p className="text-sm text-slate-600">Calificación</p>
                  </div>
                 </div>
               </div>
            </div>

            {/* --- Lista de Turnos de Hoy (CORREGIDO) --- */}
            <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Turnos de hoy</h2>
              {isLoading ? (
                <p className="text-sm text-slate-600">Cargando...</p>
              ) : turnosHoy.length > 0 ? (
                <div className="space-y-3">
                  {turnosHoy.map((turno) => {
                    // Determinar estado y color
                    const ahora = new Date();
                    const fechaTurno = new Date(turno.fecha_hora);
                    let estadoLabel = turno.estado;
                    let color = 'bg-blue-500';
                    let bgText = 'bg-blue-100 text-blue-800';

                    if (turno.estado === 'confirmado' || turno.estado === 'pendiente') {
                        if (fechaTurno < ahora) {
                            estadoLabel = 'Atrasado';
                            color = 'bg-red-500';
                            bgText = 'bg-red-100 text-red-800';
                        } else if (proximoTurno && turno.id === proximoTurno.id) {
                            estadoLabel = 'Próximo';
                            color = 'bg-emerald-500';
                            bgText = 'bg-emerald-100 text-emerald-800';
                        } else {
                            estadoLabel = 'Programado';
                        }
                    } else if (turno.estado === 'cancelado') {
                         estadoLabel = 'Cancelado';
                         color = 'bg-slate-400';
                         bgText = 'bg-slate-100 text-slate-800';
                    }

                    return (
                      <div key={turno.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className={`h-2.5 w-2.5 ${color} rounded-full flex-shrink-0`}></div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{formatHora(turno.fecha_hora)} - {turno.cliente_nombre_completo || 'N/A'}</p>
                            <p className="text-xs text-slate-500">{turno.motivo}</p>
                          </div>
                        </div>
                        <span className={`text-xs ${bgText} px-2 py-0.5 rounded-full font-medium capitalize`}>{estadoLabel}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No tienes turnos programados para hoy.</p>
              )}
            </div>
          </main>
        </div>
      </div>
    </motion.div>
  );
}

export default MedicosDashboard;