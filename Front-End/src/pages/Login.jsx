import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { jwtDecode } from 'jwt-decode'; // 1. Importa la función para decodificar

function Login() {
	const MotionDiv = motion.div;
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [userType, setUserType] = useState(null);
	const [errorMessage, setErrorMessage] = useState('');

	const onSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setErrorMessage('');

		const loginUrl =
			userType === 'paciente'
				? 'http://localhost:8000/auth/token/paciente' //
				: 'http://localhost:8000/auth/token/profesional'; //

		const formData = new URLSearchParams();
		formData.append('username', email); // El backend espera 'username'
		formData.append('password', password);

		try {
			const response = await fetch(loginUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.detail || 'Error al iniciar sesión');
			}

			// ¡ÉXITO! Guarda el token
			const token = data.access_token;
			localStorage.setItem('accessToken', token);
			localStorage.setItem('tokenType', data.token_type);

			// --- CAMBIO PRINCIPAL: Decodificar y Redirigir ---
			try {
				const decodedToken = jwtDecode(token); // 2. Decodifica el token
				const userRole = decodedToken.rol; // 3. Obtiene el rol (asegúrate que el backend lo incluye)

				window.dispatchEvent(new Event('authChange')); // Dispara el evento para actualizar el Header

				// 4. Redirige según el rol
				if (userRole === 'medico') {
					navigate('/medico/dashboard'); // Redirige al dashboard de médicos
				} else if (userRole === 'cliente') {
					navigate('/dashboard'); // Redirige al dashboard de pacientes (clientes)
				} else {
					// Rol desconocido o no incluido en el token, redirige a una página por defecto o muestra error
					console.error('Rol de usuario desconocido:', userRole);
					navigate('/'); // Redirige al inicio como fallback
				}
			} catch (decodeError) {
				console.error('Error al decodificar el token:', decodeError);
				setErrorMessage('Error al procesar la sesión. Intente de nuevo.');
				// Opcional: Borrar token inválido
				localStorage.removeItem('accessToken');
				localStorage.removeItem('tokenType');
			}
			// --- FIN DEL CAMBIO ---

			setLoading(false); // setLoading(false) se movió aquí para asegurar que ocurra antes de la navegación si todo va bien

		} catch (error) {
			setLoading(false);
			setErrorMessage(error.message);
		}
	};

	return (
        // ... (El JSX del componente no necesita cambios aquí, es el mismo que antes) ...
		<div className='relative min-h-[calc(100vh-64px)] overflow-hidden px-4 flex items-center justify-center'>
			{/* ... (fondo y gradientes) ... */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" aria-hidden />
            <div
                className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
                style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '4px 4px' }}
                aria-hidden
            />
			<MotionDiv
				className='relative z-10 w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8'
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0, transition: { duration: 0.35 } }}
			>
				{!userType ? (
					// ... (Selección de tipo de usuario sin cambios) ...
                    <div className="text-center">
                        <h2 className="mt-3 text-2xl font-bold text-gray-900 mb-6">Selecciona el tipo de acceso</h2>
                        <div className="space-y-4">
                        <button
                            className="w-full inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2.5 text-white font-semibold shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            onClick={() => setUserType('paciente')}
                        >
                            Login Paciente
                        </button>
                        <button
                            className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            onClick={() => setUserType('profesional')}
                        >
                            Login Profesional
                        </button>
                        </div>
                    </div>
				) : (
					<>
						{errorMessage && (
							<div className='mb-4'>
								<Alert variant='error' title='Error de autenticación' onClose={() => setErrorMessage('')}>
									{errorMessage}
								</Alert>
							</div>
						)}
						<div className='text-center mb-6'>
							<h2 className='mt-3 text-2xl font-bold text-gray-900'>
								Ingresar {userType === 'profesional' ? 'Profesional' : 'Paciente'}
							</h2>
							<p className='text-sm text-gray-600'>
								Accede a tu portal de{' '}
								{userType === 'profesional' ? 'profesional' : 'paciente'}
							</p>
						</div>
						<form onSubmit={onSubmit} className='space-y-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700'>Email</label>
								<input
									type='email'
									required
									className='mt-1 w-full rounded-md border text-gray-900 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500'
									placeholder='tu@correo.com'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-700'>Contraseña</label>
								<input
									type='password'
									required
									className='mt-1 w-full rounded-md border text-gray-900 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500'
									placeholder='********'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</div>
							<button
								type='submit'
								disabled={loading}
								className='w-full inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2.5 text-white font-semibold shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60'
							>
								{loading ? 'Ingresando…' : 'Ingresar'}
							</button>
						</form>
						<div className='mt-4 text-center space-y-2'>
							<button
								type='button'
								onClick={() => navigate('/register')}
								className='w-full inline-flex items-center justify-center rounded-md bg-emerald-700 px-4 py-2.5 text-white font-semibold shadow hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60'
							>
								Registrarse
							</button>
							<button
								type='button'
								onClick={() => {
									setUserType(null);
									setErrorMessage('');
								}}
								className='w-full mt-2 text-sm text-gray-600 underline'
							>
								Volver a selección de acceso
							</button>
							<button
								type='button'
								onClick={() => navigate('/')}
								className='text-sm text-emerald-700 hover:underline'
							>
								Volver al inicio
							</button>
						</div>
					</>
				)}
			</MotionDiv>
		</div>
	);
}

export default Login;