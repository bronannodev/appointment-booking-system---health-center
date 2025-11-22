import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Alert from '../components/Alert';

// Reutilizamos el layout de la página de médico
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


function MedicoPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchPacientes = useCallback(async (medicoId, token) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Obtener todos los turnos del médico
      const turnosResponse = await fetch(`http://localhost:8000/turnos/medico/${medicoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!turnosResponse.ok) throw new Error('Error al obtener los turnos');
      const turnosData = await turnosResponse.json();
      setTurnos(turnosData); // Guardamos los turnos por si los necesitamos

      // 2. Extraer IDs de pacientes únicos
      const pacienteIds = [...new Set(turnosData.map(turno => turno.clientes_id))];

      if (pacienteIds.length === 0) {
        setPacientes([]);
        return;
      }

      // 3. Buscar la información de cada paciente
      // (Usando el endpoint de 'services/cliente.py' -> get_cliente_by_id)
      const fetchesPacientes = pacienteIds.map(id =>
        fetch(`http://localhost:8000/clientes/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` } // Asumiendo que este endpoint también requiere auth
        }).then(res => {
          if (!res.ok) {
            console.warn(`No se pudo encontrar el cliente con ID: ${id}`);
            return null; // Devolver null si falla para no romper Promise.all
          }
          return res.json();
        })
      );

      const pacientesData = await Promise.all(fetchesPacientes);
      // Filtramos los nulos (pacientes no encontrados)
      setPacientes(pacientesData.filter(Boolean)); 

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.rol !== 'medico' || !decodedToken.id) {
        throw new Error("Token inválido o rol incorrecto.");
      }
      fetchPacientes(decodedToken.id, token);
    } catch (err) {
      console.error("Error al decodificar token o fetch:", err);
      setError("No se pudo verificar su identidad.");
      setIsLoading(false);
    }
  }, [navigate, fetchPacientes]);

  // Derivamos los pacientes activos (que tienen turnos pendientes o confirmados)
  const pacientesActivos = useMemo(() => {
    const idsActivos = new Set(
        turnos
            .filter(t => t.estado === 'pendiente' || t.estado === 'confirmado')
            .map(t => t.clientes_id)
    );
    return pacientes.filter(p => idsActivos.has(p.id));
  }, [turnos, pacientes]);

  return (
    <MedicoPageLayout title="Mis Pacientes">
      {isLoading && <p>Cargando pacientes...</p>}
      {error && <Alert variant="error" title="Error">{error}</Alert>}
      {!isLoading && !error && (
        pacientes.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Pacientes Activos ({pacientesActivos.length})</h2>
            <p className="text-sm text-slate-600 mb-4">Pacientes con turnos pendientes o confirmados.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {pacientesActivos.map(paciente => (
                    <div key={paciente.id} className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <p className="font-semibold text-emerald-900">{paciente.nombre} {paciente.apellido}</p>
                        <p className="text-sm text-emerald-700">DNI: {paciente.dni}</p>
                        <p className="text-sm text-emerald-700">Email: {paciente.email}</p>
                    </div>
                ))}
                {pacientesActivos.length === 0 && <p className='text-slate-500 text-sm'>No hay pacientes activos en este momento.</p>}
            </div>

             <h2 className="text-xl font-semibold mb-4">Todos los Pacientes ({pacientes.length})</h2>
             <p className="text-sm text-slate-600 mb-4">Historial de todos los pacientes que has atendido.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pacientes.map(paciente => (
                    <div key={paciente.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="font-semibold text-slate-900">{paciente.nombre} {paciente.apellido}</p>
                        <p className="text-sm text-slate-600">DNI: {paciente.dni}</p>
                    </div>
                ))}
            </div>
          </div>
        ) : (
          <Alert variant="info" title="Sin pacientes">Aún no se registran pacientes asociados a tus turnos.</Alert>
        )
      )}
    </MedicoPageLayout>
  );
}

export default MedicoPacientes;