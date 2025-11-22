import React, { useState } from 'react'
import { motion } from 'framer-motion' //eslint-disable-line
import Alert from './Alert'
import InfoModal from './InfoModal' // 1. Importa el modal de información

// ... (Componente FormInput sin cambios) ...
function FormInput({ label, name, value, onChange, type = 'text', ...props }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded-md border text-gray-900 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
        {...props}
      />
    </div>
  )
}


function EditarPerfilModal({ user, onClose }) {
  const [formData, setFormData] = useState(user)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 2. Nuevo estado para el modal de éxito
  const [showUpdateSuccessModal, setShowUpdateSuccessModal] = useState(false)

  const handleChange = (e) => {
    // ... (sin cambios) ...
     const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    console.log('Enviando datos:', formData)

    setTimeout(() => {
      if (formData.firstName === 'Error') {
        setError('Hubo un problema al actualizar el perfil. Intente de nuevo.')
        setLoading(false)
        return
      }

      // 3. Simulación exitosa: Muestra el modal de éxito
      setLoading(false)
      setShowUpdateSuccessModal(true)
      // Ya NO cerramos el modal de edición aquí

    }, 1000)
  }

  // 4. Función para cerrar el modal de éxito Y el modal de edición
  const handleCloseUpdateSuccessModal = () => {
    setShowUpdateSuccessModal(false)
    onClose() // Llama a la función onClose original para cerrar el modal de edición
  }

  return (
    <> {/* 5. Envuelve en Fragment */}
      {/* Fondo (Backdrop) */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
        // onClick={onClose} // Quitamos el onClick del fondo para evitar cierres accidentales mientras el modal de éxito está abierto
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Contenido del Modal de Edición */}
        <motion.div
          className="relative w-full max-w-lg rounded-xl bg-white text-slate-900 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 0.1 } }}
          exit={{ y: 20, opacity: 0 }}
        >
          <form onSubmit={handleSubmit}>
            {/* ... (Header, Body con Formulario, Footer sin cambios) ... */}
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
                <h2 className="text-xl font-semibold">Editar Perfil</h2>
                <button
                type="button"
                onClick={onClose} // Este botón sí cierra directamente el modal de edición
                className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Cerrar modal"
                >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
                </button>
            </div>
            <div className="p-6 space-y-4">
                {error && <Alert variant="error" title="Error">{error}</Alert>}
                <FormInput
                label="Nombre"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                />
                <FormInput
                label="Apellido"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                />
                <FormInput
                label="DNI"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                readOnly
                className="mt-1 w-full rounded-md border bg-slate-100 text-gray-500 px-3 py-2 shadow-sm focus:outline-none"
                />
                <FormInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                />
                <FormInput
                label="Teléfono"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-200 p-5 bg-slate-50 rounded-b-xl">
                <button
                type="button"
                onClick={onClose} // Este botón también cierra el modal de edición
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm border border-slate-300 hover:bg-slate-100"
                >
                Cancelar
                </button>
                <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
                >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {/* 6. Renderiza el modal de éxito de actualización */}
      <InfoModal
        isOpen={showUpdateSuccessModal}
        onClose={handleCloseUpdateSuccessModal}
        title="Perfil Actualizado"
      >
        La información de tu perfil se ha guardado correctamente.
      </InfoModal>
    </>
  )
}

export default EditarPerfilModal