import React from 'react'; // Importa React
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; //eslint-disable-line

// El componente Card (puedes moverlo a un archivo separado si lo usas mucho)
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


function AdminDashboard() {
  const navigate = useNavigate();

  return (
    // Estructura principal con animación
    <motion.div
      className="relative min-h-[calc(100vh-64px)] overflow-hidden px-4 py-10 sm:py-14"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.25 } }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
    >
      {/* Fondo y gradiente (igual a Dashboard.jsx) */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" aria-hidden />
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '4px 4px' }}
        aria-hidden
      />

      {/* Contenido */}
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-white mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Panel de Administrador</h1>
          <p className="mt-1 text-slate-200/90">Gestiona el sistema de turnos.</p>
        </header>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="sm:col-span-5 lg:col-span-4 xl:col-span-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
              <h2 className="text-base text-center font-semibold text-slate-900">Opciones de administración</h2>
              {/* Botones del Sidebar de Admin */}
              <div className="mt-4 flex flex-col divide-y divide-slate-200">
                <button
                  type="button"
                  onClick={() => navigate('/admin/usuarios')} // Ruta de ejemplo
                  className="w-full text-left rounded-lg px-4 py-4 text-sm sm:text-base font-medium text-blue-900 bg-blue-100 hover:bg-blue-200 flex items-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                    <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                  </svg>
                  Gestionar usuarios
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/turnos')} // Ruta de ejemplo
                  className="w-full text-left rounded-lg px-4 py-4 text-sm sm:text-base font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 flex items-center gap-3"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                    <path fillRule="evenodd" d="M6.75 3a.75.75 0 0 1 .75.75V5h9V3.75a.75.75 0 0 1 1.5 0V5h.75A2.25 2.25 0 0 1 21 7.25v10.5A2.25 2.25 0 0 1 18.75 20.5H5.25A2.25 2.25 0 0 1 3 17.75V7.25A2.25 2.25 0 0 1 5.25 5H6V3.75A.75.75 0 0 1 6.75 3Zm12 7.5H5.25v7.25c0 .414.336.75.75.75h12.75a.75.75 0 0 0 .75-.75V10.5Z" clipRule="evenodd" />
                  </svg>
                  Gestionar turnos
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/profesionales')} // Ruta de ejemplo
                  className="w-full text-left rounded-lg px-4 py-4 text-sm sm:text-base font-medium text-blue-900 bg-blue-100 hover:bg-blue-200 flex items-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                     <path d="M10.5 1.75a.75.75 0 0 0-1.5 0v1.264a8.25 8.25 0 0 0-3.375.874L4.35 3.07a.75.75 0 0 0-1.06 1.06l.818 1.275a8.25 8.25 0 0 0-.874 3.375H1.75a.75.75 0 0 0 0 1.5h1.524a8.25 8.25 0 0 0 .874 3.375L3.29 15.87a.75.75 0 0 0 1.06 1.06l1.275-.818a8.25 8.25 0 0 0 3.375.874V19.5a.75.75 0 0 0 1.5 0v-1.264a8.25 8.25 0 0 0 3.375-.874l1.275.818a.75.75 0 0 0 1.06-1.06l-.818-1.275a8.25 8.25 0 0 0 .874-3.375H19.5a.75.75 0 0 0 0-1.5h-1.524a8.25 8.25 0 0 0-.874-3.375l.818-1.275a.75.75 0 0 0-1.06-1.06l-1.275.818a8.25 8.25 0 0 0-3.375-.874V1.75ZM9.75 12a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0Zm1.5-6.75a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Z" />
                  </svg>
                  Gestionar profesionales
                </button>
                 <button
                  type="button"
                  onClick={() => navigate('/admin/consultorios')} // Ruta de ejemplo
                  className="w-full text-left rounded-lg px-4 py-4 text-sm sm:text-base font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 flex items-center gap-3"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                  </svg>
                   Gestionar consultorios
                 </button>
                 <button
                  type="button"
                  onClick={() => navigate('/admin/reportes')} // Ruta de ejemplo
                  className="w-full text-left rounded-lg px-4 py-4 text-sm sm:text-base font-medium text-blue-900 bg-blue-100 hover:bg-blue-200 flex items-center gap-3"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                     <path d="M11.7 2.004a.75.75 0 0 1 .6 0L20.25 6a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75V6.75a.75.75 0 0 1 .75-.75l7.95-3.996ZM12 4.093l-7.5 3.75v8.157h15V7.849L12 4.093Z" />
                  </svg>
                   Ver reportes
                 </button>
                 <button
                  type="button"
                  onClick={() => navigate('/admin/configuracion')} // Ruta de ejemplo
                  className="w-full text-left rounded-lg px-4 py-4 text-sm sm:text-base font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 flex items-center gap-3"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                     <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692c-.708.582-.891 1.42-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.570.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.892-1.42.432-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.493 7.493 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348L13.928 3.817c-.151-.904-.933-1.567-1.85-1.567h-1.844Z" clipRule="evenodd" />
                   </svg>
                   Configuración del sistema
                 </button>
              </div>
            </div>
          </aside>

          {/* Contenido Principal */}
          <main className="sm:col-span-7 lg:col-span-8 xl:col-span-8">
            {/* Card de Resumen */}
            <div className="rounded-xl border border-blue-200 bg-white shadow-sm p-5 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Resumen del sistema</h2>
                  <p className="mt-1 text-slate-600 text-sm">
                    Usuarios activos: <span className="font-medium text-slate-800">—</span> | Turnos hoy: <span className="font-medium text-slate-800">—</span>
                  </p>
                  <p className="mt-1 text-slate-600 text-sm">
                    Profesionales: <span className="font-medium text-slate-800">—</span> | Consultorios: <span className="font-medium text-slate-800">—</span>
                  </p>
                </div>
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/reportes')} // Lleva a reportes
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Ver estadísticas
                  </button>
                </div>
              </div>
            </div>

            {/* Placeholder de Actividad Reciente */}
            <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Actividad reciente</h2>
              <p className="mt-2 text-slate-600 text-sm">Aún no hay actividad para mostrar. Aquí se listarán las últimas acciones (registros, turnos creados/cancelados, etc.).</p>
              {/* Podrías añadir un link a un log más detallado si lo implementas */}
              {/* <button className="mt-4 ...">Ver log completo</button> */}
            </div>
          </main>
        </div>
      </div>
    </motion.div>
  );
}

export default AdminDashboard;