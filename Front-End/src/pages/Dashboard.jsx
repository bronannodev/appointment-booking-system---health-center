import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion'; //eslint-disable-line
import EditarPerfilModal from '../components/EditarPerfilModal';
import { getDecodedToken, getAuthHeaders, logout } from '../utils/auth';
import Alert from '../components/Alert';

// --- HELPERS PARA FORMATEAR DATOS ---
const formatFecha = (isoString) => {
    if (!isoString) return 'N/A';
    // Usamos timeZone: 'UTC' para que no mueva la fecha al convertir
    return new Date(isoString).toLocaleDateString('es-AR', { timeZone: 'UTC' });
};

const formatHora = (isoString) => {
    if (!isoString) return 'N/A';
    // Extraer solo la hora: HH:MM
    const date = new Date(isoString);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

const getNombreCompleto = (obj) => {
    if (!obj) return 'N/A';
    return `${obj.nombre || ''} ${obj.apellido || ''}`.trim() || 'N/A';
};
// --- FIN HELPERS ---

// --- Componente InfoField (sin cambios) ---
function InfoField({ label, value }) {
	return (
		<div>
			<label className='block text-sm font-medium text-slate-600'>{label}</label>
			<p className='mt-0.5 text-base font-semibold text-slate-900'>{value || 'No disponible'}</p>
		</div>
	);
}

// --- Componente PerfilContent (sin cambios) ---
function PerfilContent({ user, onEdit }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            // Se asume que la fecha de nacimiento no necesita conversión UTC
            return new Date(dateString + 'T00:00:00').toLocaleDateString('es-AR');
        } catch (e) { //eslint-disable-line
            return 'Fecha inválida';
        }
    };

	return (
		<div className='rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md'>
			<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4'>
				<h2 className='text-xl font-semibold text-slate-900'>Mi Perfil</h2>
				<button
					type='button'
					onClick={onEdit}
					className='w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-white text-sm font-semibold shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400'
				>
					Editar información
				</button>
			</div>
			<div className='space-y-5'>
				<InfoField label='Nombre' value={user?.nombre} />
				<InfoField label='Apellido' value={user?.apellido} />
				<InfoField label='DNI' value={user?.dni} />
				<InfoField label='Email' value={user?.email} />
				<InfoField label='Teléfono' value={user?.telefono} />
                <InfoField label='Fecha de Nacimiento' value={formatDate(user?.fecha_nacimiento)} />
			</div>
		</div>
	);
}
// --- Fin PerfilContent ---

// --- Componente Card (sin cambios) ---
function Card({ title, description, actionLabel, onAction, icon }) {
	return (
		<div className='rounded-xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col'>
			<div className='flex items-center gap-3'>
				{icon ? (
					<div className='h-10 w-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center'>
						{icon}
					</div>
				) : null}
				<h3 className='text-lg font-semibold text-slate-900'>{title}</h3>
			</div>
			{description ? <p className='mt-2 text-slate-600 text-sm'>{description}</p> : null}
			{onAction ? (
				<div className='mt-4'>
					<button
						type='button'
						onClick={onAction}
						className='inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-white text-sm font-semibold shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400'
					>
						{actionLabel || 'Abrir'}
					</button>
				</div>
			) : null}
		</div>
	);
}

// --- Componente TurnoRecienteCard (CORREGIDO) ---
function TurnoRecienteCard({ turno }) {
    const fecha = formatFecha(turno.fecha_hora);
    const hora = formatHora(turno.fecha_hora);
    const estadoColors = {
        pendiente: 'text-amber-600',
        confirmado: 'text-emerald-600',
        cancelado: 'text-rose-600',
        completado: 'text-slate-500'
    };
    const estadoColorClass = estadoColors[turno.estado] || 'text-slate-600';

    return (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-800">{turno.medico?.especialidad || 'N/A'}</span>
                <span className={`text-xs font-bold uppercase ${estadoColorClass}`}>{turno.estado}</span>
            </div>
            <p className="text-sm text-slate-600">{fecha} - {hora}</p>
        </div>
    );
}

function Dashboard() {
	const navigate = useNavigate();
	const [view, setView] = useState('overview');
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	
	const [userName, setUserName] = useState('Usuario');
    const [userData, setUserData] = useState(null); 
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [error, setError] = useState(null);
    
    const [proximoTurno, setProximoTurno] = useState(null);
    const [turnosRecientes, setTurnosRecientes] = useState([]);
    const [isLoadingTurnos, setIsLoadingTurnos] = useState(true);

    const fetchUserData = useCallback(async () => {
        const decodedToken = getDecodedToken();
        if (!decodedToken || decodedToken.rol !== 'cliente') {
            setError("Sesión inválida.");
            logout();
            navigate('/login');
            return;
        }

        setUserName(decodedToken.nombre || 'Usuario');
        setIsLoadingUser(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:8000/clientes/${decodedToken.id}`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    navigate('/login');
                }
                const errData = await response.json();
                throw new Error(errData.detail || "Error al cargar los datos del perfil.");
            }
            
            const data = await response.json();
            setUserData(data);
        
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoadingUser(false);
        }
    }, [navigate]);

	useEffect(() => {
		const token = localStorage.getItem('accessToken');
		if (!token) {
			navigate('/login');
		} else {
            fetchUserData();
        }
	}, [navigate, fetchUserData]);

    useEffect(() => {
        if (!userData) {
            return; 
        }

        const clienteId = userData.id;
        const authHeaders = getAuthHeaders();
        
        const fetchTurnosData = async () => {
            setIsLoadingTurnos(true);
            try {
                // 1. Buscar el próximo turno
                const proximoResponse = await fetch(`http://localhost:8000/turnos/cliente/${clienteId}/proximo`, { 
                    headers: authHeaders 
                });
                
                if (proximoResponse.ok) {
                    const proximoData = await proximoResponse.json();
                    setProximoTurno(proximoData);
                } else {
                    console.error("No se encontraron próximos turnos.");
                    setProximoTurno(null); // Asegurarse de que sea nulo si hay error 404
                }

                // 2. Buscar los turnos recientes (endpoint que devuelve todos)
                const recientesResponse = await fetch(`http://localhost:8000/turnos/cliente/${clienteId}`, { 
                    headers: authHeaders 
                });

                if (recientesResponse.ok) {
                    const recientesData = await recientesResponse.json();
                    setTurnosRecientes(recientesData.slice(0, 3));
                } else {
                    console.error("Error al buscar turnos recientes:", recientesResponse.statusText);
                }

            } catch (err) {
                setError(prevError => prevError ? `${prevError} | Error al cargar turnos: ${err.message}` : `Error al cargar turnos: ${err.message}`);
            } finally {
                setIsLoadingTurnos(false);
            }
        };

        fetchTurnosData();

    }, [userData]);


	const transitionProps = {
		initial: { opacity: 0, y: 10 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: -10 },
		transition: { duration: 0.25 },
	};

	const handleLogout = () => {
        logout();
        navigate('/'); 
    };

	return (
		<>
			<div className='relative min-h-[calc(100vh-64px)] overflow-hidden px-4 py-10 sm:py-14'>
				{/* Fondo y gradiente */}
				<div
					className='absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'
					aria-hidden
				/>
				<div
					className='absolute inset-0 opacity-[0.12] mix-blend-overlay'
					style={{
						backgroundImage:
							'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
						backgroundSize: '4px 4px',
					}}
					aria-hidden
				/>
				<div className='relative z-10 max-w-6xl mx-auto'>
					{/* Header Modificado */}
					<header className='text-white mb-8'>
						<h1 className='text-2xl sm:text-3xl font-bold'>
							Hola, {userName}.
						</h1>
						<p className='mt-1 text-slate-200/90'>
							Gestiona tus turnos desde un solo lugar.
						</p>
					</header>

					{/* Layout Grid */}
					<div className='grid grid-cols-1 sm:grid-cols-12 gap-6'>
						{/* Sidebar (sin cambios) */}
						<aside className='sm:col-span-5 lg:col-span-4 xl:col-span-4'>
							<div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-md'>
								<h2 className='text-base text-center font-semibold text-slate-900'>
									Opciones disponibles
								</h2>
								<div className='mt-4 flex flex-col divide-y divide-slate-200'>
									<button
										type='button'
										onClick={() => setView('overview')}
										className='w-full text-left rounded-lg px-4 py-4 text-sm sm:text-base font-medium text-blue-900 bg-blue-100 hover:bg-blue-200 flex items-center gap-3'
									>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.69Z" /><path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" /></svg>
										Panel Principal
									</button>
									<button
										type='button'
										onClick={() => navigate('/turnos')}
										className='w-full text-left rounded-lg px-4 py-4 text-sm sm:text-base font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 flex items-center gap-3'
									>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path fillRule="evenodd" d="M6.75 3a.75.75 0 0 1 .75.75V5h9V3.75a.75.75 0 0 1 1.5 0V5h.75A2.25 2.25 0 0 1 21 7.25v10.5A2.25 2.25 0 0 1 18.75 20.5H5.25A2.25 2.25 0 0 1 3 17.75V7.25A2.25 2.25 0 0 1 5.25 5H6V3.75A.75.75 0 0 1 6.75 3Zm12 7.5H5.25v7.25c0 .414.336.75.75.75h12.75a.75.75 0 0 0 .75-.75V10.5Z" clipRule="evenodd" /></svg>
										Consultar turnos disponibles
									</button>
									<button
										type='button'
										onClick={() => navigate('/turnos/dashboard')}
										className='w-full text-left rounded-lg px-4 py-4 text-sm sm:text-base font-medium text-blue-900 bg-blue-100 hover:bg-blue-200 flex items-center gap-3'
									>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
										Cancelar turno
									</button>
									<button
										type='button'
										onClick={() => navigate('/turnos/dashboard')}
										className='w-full text-left rounded-lg px-4 py-4 text-sm sm:text-base font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 flex items-center gap-3'
									>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M3.75 5.25A.75.75 0 0 1 4.5 4.5h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 7.5a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 7.5a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z" /></svg>
										Ver mis turnos
									</button>
								</div>
								<div className='mt-6 pt-5 border-t border-slate-200 space-y-2'>
									<button
										type='button'
										onClick={() => setView('perfil')}
										className='w-full text-left rounded-lg px-4 py-3 text-sm sm:text-base font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-3'
									>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" /></svg>
										Mi Perfil
									</button>
									<button
										type='button'
										onClick={handleLogout} 
										className='w-full text-left rounded-lg px-4 py-3 text-sm sm:text-base font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-3'
									>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path fillRule="evenodd" d="M16.5 3.75a.75.75 0 0 1 .75.75v6.75h.75a.75.75 0 0 1 0 1.5h-.75v6.75a.75.75 0 0 1-.75-.75h-9a.75.75 0 0 1-.75-.75V19.5h-.75a.75.75 0 0 1 0-1.5h.75V3.75a.75.75 0 0 1 .75-.75h9Zm-1.5 1.5H9v15h6V5.25Zm-3.75 6a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /></svg>
										Cerrar sesión
									</button>
								</div>
							</div>
						</aside>

						{/* Contenido Principal con Animación */}
						<main className='sm:col-span-7 lg:col-span-8 xl:col-span-8'>
                            {error && (
                                <div className="mb-4">
                                    <Alert variant="error" title="Error" onClose={() => setError(null)}>{error}</Alert>
                                </div>
                            )}
							<AnimatePresence mode='wait' initial={false}>
								{view === 'overview' && (
									<motion.div key='overview' {...transitionProps}>
                                        
                                        {/* --- Próximo Turno (CORREGIDO) --- */}
										<div className='rounded-xl border border-emerald-200 bg-white shadow-sm p-5 mb-6'>
                                            <h2 className='text-lg font-semibold text-slate-900'>Tu próximo turno</h2>
                                            {isLoadingTurnos ? (
											    <p className='mt-2 text-slate-600 text-sm'>Cargando...</p>
                                            ) : proximoTurno ? (
                                                <div className="mt-2 space-y-1 text-slate-700">
                                                    <p className="text-base">
                                                        <span className="font-semibold">{proximoTurno.medico?.especialidad || 'N/A'}</span> con {getNombreCompleto(proximoTurno.medico)}
                                                    </p>
                                                    <p className="text-sm">
                                                        Fecha: <span className="font-medium text-slate-800">{formatFecha(proximoTurno.fecha_hora)} a las {formatHora(proximoTurno.fecha_hora)}</span>
                                                    </p>
                                                    <p className="text-sm">
                                                        Consultorio: <span className="font-medium text-slate-800">{proximoTurno.consultorio?.numero || 'N/A'}</span>
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className='mt-2 text-slate-600 text-sm'>No tienes próximos turnos pendientes.</p>
                                            )}
										</div>
                                        
                                        {/* --- Turnos Recientes (CORREGIDO) --- */}
										<div className='mt-6 rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm'>
											<h2 className='text-lg font-semibold text-slate-900'>Mis turnos recientes</h2>
                                            {isLoadingTurnos ? (
											    <p className='mt-2 text-slate-600 text-sm'>Cargando...</p>
                                            ) : turnosRecientes.length > 0 ? (
                                                <div className="mt-4 space-y-3">
                                                    {turnosRecientes.map(turno => (
                                                        <TurnoRecienteCard key={turno.id} turno={turno} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className='mt-2 text-slate-600 text-sm'>No se encontraron turnos en tu historial.</p>
                                            )}
											<button 
                                                type='button' 
                                                onClick={() => navigate('/turnos/dashboard')} 
                                                className='mt-4 inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm border border-slate-300 hover:bg-slate-100'
                                            >
                                                Ver todos mis turnos
                                            </button>
										</div>
									</motion.div>
								)}

								{view === 'perfil' && (
									<motion.div key='perfil' {...transitionProps}>
                                        {isLoadingUser && <p className="text-white text-center">Cargando perfil...</p>}
                                        {!isLoadingUser && userData && (
										    <PerfilContent user={userData} onEdit={() => setIsEditModalOpen(true)} />
                                        )}
									</motion.div>
								)}
							</AnimatePresence>
						</main>
					</div>
				</div>
			</div>

			{/* Modal de Edición (Pasa userData real) */}
			<AnimatePresence>
				{isEditModalOpen && userData && ( // Asegúrate que userData exista
					<EditarPerfilModal
						user={userData} 
						onClose={() => setIsEditModalOpen(false)}
					/>
				)}
			</AnimatePresence>
		</>
	);
}

export default Dashboard;