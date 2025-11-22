import React from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';

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

// Datos de ejemplo para simular reportes guardados
const dummyReportes = [
    { id: 'rep_001', fecha: '2025-10-30T10:00:00Z', paciente: 'García, María', tipo: 'Historial de Atención' },
    { id: 'rep_002', fecha: '2025-10-28T14:30:00Z', paciente: 'López, Carlos', tipo: 'Historial de Atención' },
    { id: 'rep_003', fecha: '2025-10-25T11:15:00Z', paciente: 'Martínez, Ana', tipo: 'Informe Post-Operatorio' },
];

function MedicoReportes() {

  return (
    <MedicoPageLayout title="Mis Reportes Generados">
        
        <Alert variant="info" title="Página en Construcción (Demo)">
            Actualmente, los PDFs se generan y descargan en su computadora desde la pestaña "Historial Médico".
            Esta sección es una demostración de cómo se vería un panel si los reportes generados se guardaran también en el servidor para consulta futura.
        </Alert>

        <div className="overflow-x-auto mt-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha de Generación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo de Reporte</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dummyReportes.map((reporte) => (
                    <tr key={reporte.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(reporte.fecha).toLocaleString('es-AR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reporte.paciente}
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reporte.tipo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="inline-flex items-center justify-center gap-1 rounded-md bg-gray-600 px-3 py-1.5 text-white text-xs font-semibold shadow hover:bg-gray-700">
                            Descargar (Sim)
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>

    </MedicoPageLayout>
  );
}

export default MedicoReportes;