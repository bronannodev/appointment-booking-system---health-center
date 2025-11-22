import React from 'react'
import { motion, AnimatePresence } from 'framer-motion' //eslint-disable-line

function InfoModal({ isOpen, onClose, title, children }) {
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
            {/* Icono Opcional (Éxito) */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-4">
              <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>

            {/* Título */}
            <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
              {title || 'Información'}
            </h3>

            {/* Mensaje */}
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                {children}
              </p>
            </div>

            {/* Botón Cerrar */}
            <div className="mt-5">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex w-full justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default InfoModal