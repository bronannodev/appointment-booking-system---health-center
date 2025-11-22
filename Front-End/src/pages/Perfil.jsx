import React from 'react'
import { useNavigate } from 'react-router-dom'

// Datos de prueba (simulando el usuario logueado)
const dummyUser = {
  firstName: 'Nombre',
  lastName: 'Paciente',
  dni: '30123456',
  email: 'paciente@correo.com',
  phone: '11 2345-6789',
}

// Componente para mostrar un campo de información
function InfoField({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600">{label}</label>
      <p className="mt-0.5 text-base font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function Perfil() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden px-4 py-10 sm:py-14">
      {/* Fondo (Estilo Dashboard) */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" aria-hidden />
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '4px 4px' }}
        aria-hidden
      />

      {/* Contenido */}
      <div className="relative z-10 max-w-2xl mx-auto">
        <header className="text-white mb-8">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-slate-200">
              <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
            </svg>
            <h1 className="text-2xl sm:text-3xl font-bold">Mi Perfil</h1>
          </div>
          <p className="mt-2 text-slate-200/90">Aquí puedes ver la información de tu cuenta.</p>
        </header>

        {/* Tarjeta de Información */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md">
          <div className="space-y-5">
            <InfoField label="Nombre" value={dummyUser.firstName} />
            <InfoField label="Apellido" value={dummyUser.lastName} />
            <InfoField label="DNI" value={dummyUser.dni} />
            <InfoField label="Email" value={dummyUser.email} />
            <InfoField label="Teléfono" value={dummyUser.phone} />
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <button
              type="button"
              // onClick={() => navigate('/perfil/editar')} // (Ruta futura)
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-white text-sm font-semibold shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              Editar información
            </button>
          </div>
        </div>

        {/* Botón Volver */}
        <div className="mt-8 flex justify-start">
          <button
            type="button"
            onClick={() => navigate(-1)} // Vuelve a la página anterior (Dashboard)
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white/90 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg hover:bg-white transition-all"
            aria-label="Volver hacia atrás"
            title="Volver hacia atrás"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
            </svg>
            Volver hacia atrás
          </button>
        </div>
      </div>
    </div>
  )
}

export default Perfil