import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Alert from '../components/Alert';
// Importamos 'getAuthHeaders' para las peticiones
import { getAuthHeaders } from '../utils/auth'; 

// --- Componente de Layout (Sin cambios) ---
function MedicoPageLayout({ title, children }) {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden px-4 py-10 sm:py-14">
      {/* Fondo y gradiente */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" aria-hidden />
      <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '4px 4px' }} aria-hidden />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-white mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
        </header>

        {/* Contenido */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md text-slate-900">
          {children}
        </div>

        {/* Botón Volver */}
        <div className="mt-8 flex justify-start">
          <button
            type="button"
            onClick={() => navigate('/medico/dashboard')} // Vuelve al dashboard de médico
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white/90 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg hover:bg-white transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg>
            Volver al Panel
          </button>
        </div>
      </div>
    </div>
  );
}


function MedicoTurnos() {
  const [turnos, setTurnos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Estados para manejar las acciones
  const [medicoId, setMedicoId] = useState(null);
  const [token, setToken] = useState(null);
  const [processingId, setProcessingId] = useState(null); // Para deshabilitar botones

  const fetchTurnosMedico = useCallback(async (mId, authToken) => {
    setIsLoading(true);
    setError(null);
    try {
      // Usamos el endpoint que ya trae los datos detallados
      const response = await fetch(`http://localhost:8000/turnos/medico/${mId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Error al obtener los turnos');
      }
      const data = await response.json();
      
      // Ordenamos por fecha (ASC) para ver próximos primero
      data.sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));
      
      setTurnos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const authToken = localStorage.getItem('accessToken');
    if (!authToken) {
      navigate('/login');
      return;
    }
    try {
      const decodedToken = jwtDecode(authToken);
      if (decodedToken.rol !== 'medico' || !decodedToken.id) {
        throw new Error("Token inválido o rol incorrecto.");
      }
      // Guardamos ID y Token para usar en los handlers
      setMedicoId(decodedToken.id);
      setToken(authToken);
      fetchTurnosMedico(decodedToken.id, authToken);
    } catch (err) {
      console.error("Error al decodificar token o fetch:", err);
      setError("No se pudo verificar su identidad. Por favor, inicie sesión de nuevo.");
      setIsLoading(false);
      localStorage.clear();
      navigate('/login');
    }
  }, [navigate, fetchTurnosMedico]);

  // Lógica para Aceptar/Rechazar
  const handleUpdateTurno = async (turnoId, accion) => {
    if (processingId) return; // Evitar doble click
    
    const esConfirmar = accion === 'confirmar';
    const confirmMsg = esConfirmar 
        ? "¿Estás seguro de ACEPTAR este turno?"
        : "¿Estás seguro de RECHAZAR (cancelar) este turno?";

    if (!window.confirm(confirmMsg)) return;

    setProcessingId(turnoId);
    setError(null);

    const endpoint = esConfirmar
      ? `http://localhost:8000/turnos/${turnoId}/confirmar`
      : `http://localhost:8000/turnos/${turnoId}/cancelar`;

    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: getAuthHeaders() // Usamos la función de auth.jsx
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || `Error al ${accion} el turno`);
      }

      // Si fue exitoso, actualizamos la lista para reflejar el cambio
      // Volvemos a pedir todos los turnos
      await fetchTurnosMedico(medicoId, token);

    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null); // Habilitamos los botones de nuevo
    }
  };

  const formatFechaHora = (fechaHoraISO) => {
    try {
      const fecha = new Date(fechaHoraISO);
      return fecha.toLocaleString('es-AR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch (e) { //eslint-disable-line no-unused-vars
      return 'Fecha inválida';
    }
  };

  return (
    <MedicoPageLayout title="Gestión de Turnos">
      {isLoading && <p>Cargando turnos...</p>}
      {error && <Alert variant="error" title="Error" onClose={() => setError(null)}>{error}</Alert>}
      {!isLoading && !error && (
        turnos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consultorio</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {turnos.map((turno) => {
                  const isProcessing = processingId === turno.id;
                  const isPendiente = turno.estado === 'pendiente';
                  const isConfirmado = turno.estado === 'confirmado';

                  return (
                    <tr key={turno.id} className={isProcessing ? 'opacity-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatFechaHora(turno.fecha_hora)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{turno.cliente_nombre_completo || `ID: ${turno.clientes_id}`}</td>
                      
                      {/* --- MODIFICACIÓN: Corregida la línea del error --- */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {`${turno.consultorio_numero} (${turno.consultorio_ubicacion || 'N/A'})`}
                      </td>
                      {/* --- FIN DE LA MODIFICACIÓN --- */}

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          turno.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          turno.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                          turno.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {turno.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{turno.motivo}</td>
                      
                      {/* Columna de Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {isPendiente && (
                          <>
                            <button
                              onClick={() => handleUpdateTurno(turno.id, 'confirmar')}
                              disabled={isProcessing}
                              className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                            >
                              Aceptar
                            </button>
                            <button
                              onClick={() => handleUpdateTurno(turno.id, 'cancelar')}
                              disabled={isProcessing}
                              className="inline-flex items-center rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        {isConfirmado && (
                            <button
                              onClick={() => handleUpdateTurno(turno.id, 'cancelar')}
                              disabled={isProcessing}
                              className="inline-flex items-center rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                        )}
                        {!isPendiente && !isConfirmado && (
                            <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Alert variant="info" title="Sin turnos">No tienes turnos asignados por el momento.</Alert>
        )
      )}
    </MedicoPageLayout>
  );
}

export default MedicoTurnos;