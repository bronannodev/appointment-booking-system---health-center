import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logojava.png';
import { jwtDecode } from 'jwt-decode'; // 1. Importa jwtDecode

const isLoggedIn = () => {
	return !!localStorage.getItem('accessToken');
};

const logout = () => {
	localStorage.removeItem('accessToken');
	localStorage.removeItem('tokenType');
  window.dispatchEvent(new Event('authChange'));
};

function Header() {
	const navigate = useNavigate();
	const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  // 2. Nuevo estado para guardar el rol del usuario logueado
  const [userRole, setUserRole] = useState(null);

	useEffect(() => {
		const handleAuthChange = () => {
      const token = localStorage.getItem('accessToken');
			setLoggedIn(!!token); // Actualiza si está logueado o no

      // 3. Si hay token, decodifica y guarda el rol
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          setUserRole(decodedToken.rol); // Guarda el rol
        } catch (error) {
          console.error("Error decoding token in Header:", error);
          setUserRole(null); // Token inválido, resetea el rol
          // Opcional: forzar logout si el token es inválido
          // logout();
          // navigate('/login');
        }
      } else {
        setUserRole(null); // No hay token, no hay rol
      }
		};

    handleAuthChange(); // Ejecuta una vez al montar para establecer el estado inicial

		window.addEventListener('authChange', handleAuthChange);
		window.addEventListener('storage', handleAuthChange);

		return () => {
			window.removeEventListener('authChange', handleAuthChange);
			window.removeEventListener('storage', handleAuthChange);
		};
	}, []);

	const handleLogout = () => {
		logout();
    // setUserRole(null); // Se actualizará por el listener
		navigate('/login');
	};

  // 4. Determina la ruta del dashboard según el rol
  const dashboardPath = userRole === 'medico' ? '/medico/dashboard' : '/dashboard';

	return (
		<header className='w-full bg-slate-900/70 backdrop-blur border-b border-slate-800 sticky top-0 z-50'>
			<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				<div className='h-16 flex items-center justify-between'>
					{/* ... (Logo sin cambios) ... */}
                    <div className='flex items-center'>
						<button
							type='button'
							onClick={() => navigate('/')}
							className='p-0 bg-transparent border-0 cursor-pointer'
							title='Ir al inicio'
						>
							<img
								src={logo}
								alt='Logo'
								className='h-12 w-auto object-contain'
							/>
						</button>
					</div>

					{/* Botones Condicionales */}
					<div className='flex items-center gap-3'>
						{loggedIn ? (
							<>
								<button
									type='button'
                  // 5. Usa la ruta dinámica
									onClick={() => navigate(dashboardPath)}
									className='rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500'
								>
									Mi Cuenta
								</button>
								<button
									type='button'
									onClick={handleLogout}
									className='rounded-md bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500'
								>
									Cerrar Sesión
								</button>
							</>
						) : (
              // ... (Botón Ingresar sin cambios) ...
							<button
								type='button'
								onClick={() => navigate('/login')}
								className='rounded-md bg-white/10 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20'
							>
								Ingresar
							</button>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}

export default Header;