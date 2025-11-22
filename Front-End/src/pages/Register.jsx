import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'
import InfoModal from '../components/InfoModal'

// --- Iconos (Sin Cambios) ---
function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a.75.75 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
    </svg>
  )
}

function EyeSlashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577a11.217 11.217 0 0 1 4.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
      <path d="M15.75 12c0 .18-.013.357-.037.53l-1.63 1.63A5.25 5.25 0 0 0 17.25 12Z" />
      <path d="M12.75 15.662a5.25 5.25 0 0 1-3.447-1.57l-1.63 1.63A5.25 5.25 0 0 0 12.75 15.66Z" />
      <path d="M9.75 12a5.25 5.25 0 0 0-.037-.53L7.63 13.13A5.25 5.25 0 0 1 9.75 12Z" />
      <path d="M12 8.25a5.25 5.25 0 0 0-3.447 1.57l1.63-1.63A5.25 5.25 0 0 1 12 8.25Z" />
    </svg>
  )
}
// --- Fin Iconos ---

function Register() {
  const MotionDiv = motion.div
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dni, setDni] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handlePasswordChange = (e) => {
     const newPassword = e.target.value
    setPassword(newPassword)
    if (newPassword.length > 72) {
      setPasswordError('La contraseña no puede exceder los 72 caracteres.')
    } else {
      setPasswordError('')
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (password.length > 72) {
      setPasswordError('La contraseña no puede exceder los 72 caracteres.')
      return
    }
    setLoading(true)
    setErrorMessage('')
    setPasswordError('')

    const userData = {
      nombre: firstName,
      apellido: lastName,
      dni: parseInt(dni, 10),
      email: email,
      telefono: phone,
      fecha_nacimiento: birthDate,
      contraseña: password,
    }

    try {
      // --- PASO 1: Registrar al usuario ---
      const registerUrl = 'http://localhost:8000/clientes/'
      const registerResponse = await fetch(registerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      const registerData = await registerResponse.json()
      if (!registerResponse.ok) {
        let errorDetail = 'Ocurrió un error al registrar.'
        if (registerData.detail) {
          if (Array.isArray(registerData.detail)) {
            errorDetail = registerData.detail.map(err => `${err.loc.length > 1 ? err.loc[1] : 'Error'}: ${err.msg}`).join('; ')
          } else {
            errorDetail = registerData.detail
          }
        }
        throw new Error(errorDetail)
      }

      // --- PASO 2: Si el registro es exitoso, iniciar sesión automáticamente ---
      const loginUrl = 'http://localhost:8000/auth/token/paciente'
      const formData = new URLSearchParams()
      formData.append('username', email)
      formData.append('password', password)

      const loginResponse = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      })

      const loginData = await loginResponse.json()
      if (!loginResponse.ok) {
        throw new Error('Registro exitoso, pero el auto-login falló. Por favor, intente iniciar sesión manualmente.')
      }
      
      // --- PASO 3: Guardar el token (¡Login exitoso!) ---
      localStorage.setItem('accessToken', loginData.access_token)
      localStorage.setItem('tokenType', loginData.token_type)
      window.dispatchEvent(new Event('authChange'))

      // --- PASO 4: Mostrar modal de éxito ---
      setLoading(false)
      setShowSuccessModal(true)

    } catch (error) {
      setLoading(false)
      setErrorMessage(error.message)
    }
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    navigate('/dashboard') 
  }

  return (
    <>
      <div className="relative min-h-[calc(100vh-64px)] overflow-hidden px-4 py-16 sm:py-24 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" aria-hidden />
        <div
            className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
            style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '4px 4px' }}
            aria-hidden
        />
        <MotionDiv
          className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.35 } }}
        >
          {errorMessage && (
            <div className="mb-4">
                <Alert variant="error" title="Error en el registro" onClose={() => setErrorMessage('')}>
                {errorMessage}
                </Alert>
            </div>
            )}
            <div className="text-center mb-6">
            <h2 className="mt-3 text-2xl font-bold text-gray-900">Registrarse</h2>
            <p className="text-sm text-gray-600">Cree su cuenta en el portal</p>
            </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                type="text"
                required
                className="mt-1 w-full rounded-md border text-gray-900 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Juan"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Apellido</label>
                <input
                type="text"
                required
                className="mt-1 w-full rounded-md border text-gray-900 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Pérez"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">DNI</label>
                <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                className="mt-1 w-full rounded-md border text-gray-900 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="30123456"
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/[^0-9]/g, ''))}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                <input
                type="date"
                required
                className="mt-1 w-full rounded-md border text-gray-900 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                type="email"
                required
                className="mt-1 w-full rounded-md border text-gray-900 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            
            {/* --- Input de Contraseña (CORREGIDO) --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  maxLength={72}
                  className={`w-full rounded-md border text-gray-900 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 ${passwordError ? 'border-rose-500' : ''}`}
                  placeholder="********"
                  value={password}
                  onChange={handlePasswordChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)} 
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1 text-xs text-rose-600">{passwordError}</p>
              )}
            </div>
            {/* --- Fin Corrección --- */}

             <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                type="tel"
                required
                className="mt-1 w-full rounded-md border text-gray-900 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="11 2345-6789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                />
            </div>
            
            <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2.5 text-white font-semibold shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60"
            >
                {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
            </form>
            <div className="mt-4 text-center">
            <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-emerald-700 hover:underline"
            >
                ¿Ya tienes cuenta? Inicia sesión
            </button>
            </div>
        </MotionDiv>
      </div>

      <InfoModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        title="¡Registro Exitoso!"
      >
        Tu cuenta ha sido creada correctamente. Serás redirigido a tu panel.
      </InfoModal>
    </>
  )
}

export default Register