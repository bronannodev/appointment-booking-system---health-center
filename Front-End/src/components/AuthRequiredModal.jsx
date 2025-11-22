import React from 'react'
import { motion, AnimatePresence } from 'framer-motion' //eslint-disable-line
import { useNavigate } from 'react-router-dom'

function AuthRequiredModal({ isOpen, onClose }) {
  const navigate = useNavigate()

  const handleIngresar = () => {
    onClose() // Cierra el modal
    navigate('/login') // Redirige a la página de login
  }

  return (
    <AnimatePresence>
      {isOpen && (
        // Fondo (Backdrop)
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 p-4"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Contenido del Modal */}
          <motion.div
            className="relative w-full max-w-sm rounded-xl bg-white text-slate-900 shadow-2xl p-6 text-center"
            onClick={(e) => e.stopPropagation()} // Evita que el clic cierre el modal
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 0.1, duration: 0.2 } }}
            exit={{ y: 20, opacity: 0, transition: { duration: 0.2 } }}
          >
            {/* Icono Opcional (Advertencia) */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-4">
              <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>

            {/* Título */}
            <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
              Atencion
            </h3>

            {/* Mensaje */}
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Necesitas iniciar sesión o registrarte para poder reservar un turno.
              </p>
            </div>

            {/* Botones */}
            <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleIngresar}
                className="inline-flex w-full justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Ingresar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AuthRequiredModal