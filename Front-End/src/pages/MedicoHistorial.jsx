import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Alert from '../components/Alert';
import { PDFDownloadLink } from '@react-pdf/renderer';
import HistorialMedicoPDF from '../components/HistorialMedicoPDF'; // Importamos el nuevo PDF

// Reutilizamos el layout
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


function MedicoHistorial() {
  const [historial, setHistorial] = useState([]);
  const [pacientesMap, setPacientesMap] = useState(new Map());
  const [medicoInfo, setMedicoInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchHistorial = useCallback(async (medicoId, token) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Obtener todos los turnos del médico
      const turnosResponse = await fetch(`http://localhost:8000/turnos/medico/${medicoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!turnosResponse.ok) throw new Error('Error al obtener los turnos');
      const turnosData = await turnosResponse.json();
      
      // Guardamos la info del médico del primer turno (será la misma para todos)
      if (turnosData.length > 0) {
        setMedicoInfo(turnosData[0].medico);
      }

      // 2. Filtrar por historial (completados o cancelados)
      const turnosPasados = turnosData.filter(
        t => t.estado === 'completado' || t.estado === 'cancelado'
      );
      setHistorial(turnosPasados);

      // 3. Obtener IDs de pacientes únicos de esos turnos
      const pacienteIds = [...new Set(turnosPasados.map(t => t.clientes_id))];

      if (pacienteIds.length === 0) return;

      // 4. Buscar la información de cada paciente
      const fetchesPacientes = pacienteIds.map(id =>
        fetch(`http://localhost:8000/clientes/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.ok ? res.json() : null)
      );

      const pacientesData = await Promise.all(fetchesPacientes);
      const newPacientesMap = new Map();
      pacientesData.filter(Boolean).forEach(p => newPacientesMap.set(p.id, p));
      setPacientesMap(newPacientesMap);

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
      fetchHistorial(decodedToken.id, token);
    } catch (err) {    //eslint-disable-line
      setError("Error de autenticación.");
      setIsLoading(false);
    }
  }, [navigate, fetchHistorial]);

  const getPaciente = (id) => {
    return pacientesMap.get(id) || { nombre: 'Cargando...', apellido: '', dni: '', email: '', fecha_nacimiento: '' };
  };

  return (
    <MedicoPageLayout title="Historial Médico de Pacientes">
      {isLoading && <p>Cargando historial...</p>}
      {error && <Alert variant="error" title="Error">{error}</Alert>}
      {!isLoading && !error && (
        historial.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DNI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historial.map((turno) => {
                  const paciente = getPaciente(turno.clientes_id);
                  return (
                    <tr key={turno.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(turno.fecha_hora).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {paciente.nombre} {paciente.apellido}
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {paciente.dni}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          turno.estado === 'cancelado' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {turno.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {/* El botón de CRUD (Editar notas) iría aquí */}
                        {/* <button className="text-indigo-600 hover:text-indigo-900 mr-4">Editar Notas</button> */}
                        
                        <PDFDownloadLink
                          document={<HistorialMedicoPDF turno={turno} paciente={paciente} medico={medicoInfo} />}
                          fileName={`historial_turno_${turno.id}_${paciente.apellido}.pdf`}
                          className="inline-flex items-center justify-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-white text-xs font-semibold shadow hover:bg-blue-700"
                        >
                          {({ loading }) => (loading ? 'Cargando PDF...' : 'Generar PDF')}
                        </PDFDownloadLink>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Alert variant="info" title="Sin historial">No hay turnos completados o cancelados para mostrar.</Alert>
        )
      )}
    </MedicoPageLayout>
  );
}

export default MedicoHistorial;