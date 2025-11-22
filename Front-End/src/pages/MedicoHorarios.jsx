import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Alert from '../components/Alert';
import { getAuthHeaders } from '../utils/auth'; // Necesitamos esto para las peticiones

// --- Componente de Layout (Sin cambios) ---
function MedicoPageLayout({ title, children }) {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden px-4 py-10 sm:py-14">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" aria-hidden />
      <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '4px 4px' }} aria-hidden />
      <div className="relative z-10 max-w-6xl mx-auto">
        <header className="text-white mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
        </header>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md text-slate-900">
          {children}
        </div>
        <div className="mt-8 flex justify-start">
          <button
            type="button"
            onClick={() => navigate('/medico/dashboard')}
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

// --- Componente de Gestión de Horarios (NUEVA LÓGICA) ---

// Mapeo de Días (Backend usa 1=Lunes, 0=Domingo)
const diasSemana = [
  { id: 1, nombre: 'Lunes' },
  { id: 2, nombre: 'Martes' },
  { id: 3, nombre: 'Miércoles' },
  { id: 4, nombre: 'Jueves' },
  { id: 5, nombre: 'Viernes' },
  { id: 6, nombre: 'Sábado' },
  { id: 0, nombre: 'Domingo' },
];

// Genera los slots de 30 minutos
const generarSlots = () => {
  const slots = [];
  for (let h = 8; h < 18; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
    slots.push(`${h.toString().padStart(2, '0')}:30`);
  }
  return slots; // ['08:00', '08:30', ..., '17:30']
};
const timeSlots = generarSlots(); 

// Función helper para calcular la hora de fin
const calcularHoraFin = (horaInicio) => {
    const [h, m] = horaInicio.split(':').map(Number);
    const fecha = new Date();
    fecha.setHours(h, m + 30, 0); // Añade 30 min
    return `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}:00`;
};

function MedicoHorarios() {
  const [misHorarios, setMisHorarios] = useState([]); // Slots habilitados
  const [consultorios, setConsultorios] = useState([]);
  const [selectedConsultorioId, setSelectedConsultorioId] = useState(''); // Consultorio a asignar
  
  const [medicoId, setMedicoId] = useState(null);
  const [token, setToken] = useState(null); //eslint-disable-line
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingSlot, setProcessingSlot] = useState(null); // Para UI "cargando"
  
  const navigate = useNavigate();

  // 1. Fetch inicial de horarios habilitados y consultorios disponibles
  const fetchMedicoData = useCallback(async (mId, authToken) => {
    setIsLoading(true);
    setError(null);
    try {
      const headers = { 'Authorization': `Bearer ${authToken}` };

      // Obtenemos los horarios que este médico YA tiene habilitados
      const horariosResponse = await fetch(`http://localhost:8000/horarios_medicos/por-medico/${mId}`, { headers });
      const horariosData = horariosResponse.ok ? await horariosResponse.json() : [];
      setMisHorarios(horariosData);

      // Obtenemos TODOS los consultorios
      const consultoriosResponse = await fetch(`http://localhost:8000/consultorios/`, { headers });
      if (!consultoriosResponse.ok) throw new Error('Error al cargar consultorios');
      const consultoriosData = await consultoriosResponse.json();
      setConsultorios(consultoriosData);
      
      // Seteamos el primer consultorio por defecto
      if (consultoriosData.length > 0) {
        setSelectedConsultorioId(consultoriosData[0].id.toString());
      } else {
        setError("No hay consultorios cargados en el sistema. No puede habilitar horarios.");
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Efecto para obtener datos al cargar
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
      setMedicoId(decodedToken.id);
      setToken(authToken);
      fetchMedicoData(decodedToken.id, authToken);
    } catch (err) { //eslint-disable-line
      setError("Error de autenticación.");
      setIsLoading(false);
    }
  }, [navigate, fetchMedicoData]);

  // 3. Helper para encontrar si un slot está habilitado
  const findHorario = (dia_semana, hora_inicio) => {
    // Compara '1' (num) con '1' (num) y '09:00' (str) con '09:00:00' (time str)
    return misHorarios.find(h => 
      h.dia_semana === dia_semana && 
      h.hora_inicio.startsWith(hora_inicio)
    );
  };

  // 4. Lógica para HABILITAR o DESHABILITAR un slot
  const handleToggleHorario = async (dia_semana, hora_inicio) => {
    setError(null);
    const slotKey = `${dia_semana}-${hora_inicio}`;
    setProcessingSlot(slotKey);

    const horarioEncontrado = findHorario(dia_semana, hora_inicio);

    try {
      // --- Caso A: El horario existe, vamos a DESHABILITAR (DELETE) ---
      if (horarioEncontrado) {
        const response = await fetch(`http://localhost:8000/horarios_medicos/${horarioEncontrado.id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Error al deshabilitar horario');
        }
        // Actualizamos el estado local quitando el horario
        setMisHorarios(prev => prev.filter(h => h.id !== horarioEncontrado.id));

      // --- Caso B: El horario NO existe, vamos a HABILITAR (POST) ---
      } else {
        if (!selectedConsultorioId) {
          throw new Error("Por favor, selecciona un consultorio primero.");
        }
        
        const nuevoHorario = {
            dia_semana: parseInt(dia_semana, 10),
            hora_inicio: `${hora_inicio}:00`,
            hora_fin: calcularHoraFin(hora_inicio),
            medicos_id: medicoId,
            consultorios_id: parseInt(selectedConsultorioId, 10)
        };

        const response = await fetch(`http://localhost:8000/horarios_medicos/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(nuevoHorario)
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Error al habilitar horario');
        }
        // Actualizamos el estado local añadiendo el nuevo horario
        const horarioCreado = await response.json();
        setMisHorarios(prev => [...prev, horarioCreado]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingSlot(null);
    }
  };


  return (
    <MedicoPageLayout title="Gestionar Disponibilidad Semanal">
      {isLoading && <p>Cargando configuración de horarios...</p>}
      {error && <Alert variant="error" title="Error" onClose={() => setError(null)}>{error}</Alert>}
      
      {!isLoading && (
        <>
          {/* Selector de Consultorio */}
          <div className="mb-6 max-w-md">
            <label htmlFor="consultorioId" className="block text-sm font-medium text-gray-700 mb-1">
              Consultorio a asignar
            </label>
            <select 
              id="consultorioId" 
              name="consultorioId" 
              value={selectedConsultorioId} 
              onChange={(e) => setSelectedConsultorioId(e.target.value)} 
              className="mt-1 w-full rounded-md border text-gray-900 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" 
              disabled={consultorios.length === 0}
            >
              {consultorios.length > 0 ? (
                consultorios.map(c => <option key={c.id} value={c.id}>{`${c.numero} (${c.ubicacion})`}</option>)
              ) : (
                <option>Cargando consultorios...</option>
              )}
            </select>
            <p className="mt-2 text-xs text-slate-500">
              Selecciona el consultorio que usarás para los nuevos horarios que habilites.
            </p>
          </div>

          {/* Grilla de Horarios */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">Hora</th>
                  {diasSemana.map(dia => (
                    <th key={dia.id} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{dia.nombre}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeSlots.map(hora => (
                  <tr key={hora}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-800 bg-gray-50 sticky left-0 z-10">{hora}</td>
                    
                    {diasSemana.map(dia => {
                      const slotKey = `${dia.id}-${hora}`;
                      const isProcessing = processingSlot === slotKey;
                      const horario = findHorario(dia.id, hora);
                      const isEnabled = Boolean(horario);
                      
                      // Buscamos el consultorio de este slot (si existe)
                      const consultorioSlot = horario ? consultorios.find(c => c.id === horario.consultorios_id || c.id === horario.cosultorios_id) : null; // 'cosultorios_id' por el typo

                      return (
                        <td key={slotKey} className="px-2 py-2 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleHorario(dia.id, hora)}
                            disabled={isProcessing || (!isEnabled && !selectedConsultorioId)} // Deshabilita si está cargando, o si intenta habilitar sin consultorio
                            className={`w-full h-full rounded p-1.5 text-xs font-semibold transition-all
                              ${isProcessing ? 'animate-pulse bg-gray-300' : ''}
                              ${!isProcessing && isEnabled ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : ''}
                              ${!isProcessing && !isEnabled ? 'bg-gray-100 text-gray-400 hover:bg-gray-200 disabled:opacity-50' : ''}
                            `}
                          >
                            {isProcessing ? '...' : (
                              isEnabled ? (
                                <>
                                  <div>Habilitado</div>
                                  <div className="font-normal text-[10px]">{consultorioSlot ? `(${consultorioSlot.numero})` : '(C: ?)'}</div>
                                </>
                              ) : 'OFF'
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </MedicoPageLayout>
  );
}

export default MedicoHorarios;