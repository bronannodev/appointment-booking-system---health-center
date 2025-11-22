
import React from 'react'
import { useNavigate } from 'react-router-dom'

function Footer() {
  const navigate = useNavigate()
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800 mt-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-slate-300 text-sm">
          <div>
            <h3 className="font-semibold text-slate-100">Centro de Salud</h3>
            <p className="mt-2">Atención integral para la comunidad.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">Contacto</h3>
            <p className="mt-2">Tel: (000) 123-456</p>
            <p>Email: contacto@centrodesalud.test</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">Dirección</h3>
            <p className="mt-2">Av. Principal 123, Ciudad</p>
            <p>Lun a Vie 08:00 - 18:00</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <button
            type="button"
            onClick={() => navigate('/about')}
            className="inline-flex items-center justify-center rounded-full bg-slate-800 px-5 py-2 text-sm font-semibold text-slate-100 shadow hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
          >
            Sobre el proyecto
          </button>
          <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} Centro de Salud. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


