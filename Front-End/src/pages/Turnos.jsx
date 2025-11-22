import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import AuthRequiredModal from '../components/AuthRequiredModal';
import InfoModal from '../components/InfoModal';
import { jwtDecode } from 'jwt-decode';

// --- Componente TurnoDisponibleCard ---
function TurnoDisponibleCard({ turno, onReservar, userRole, isReserving }) {
	return (
		<div className='rounded-xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col text-slate-900'>
			<h3 className='text-lg font-semibold text-emerald-800'>{turno.especialidad || 'Especialidad'}</h3>
			<p className='mt-1 text-slate-700 text-sm'>
				Profesional: <span className='font-medium'>{turno.profesional_nombre_completo || 'N/A'}</span>
			</p>
			<div className='mt-4 border-t border-slate-200 pt-3 text-sm text-slate-600 space-y-1'>
				<p>
					Día: <span className='font-medium text-slate-800'>{turno.fecha_turno ? new Date(turno.fecha_turno + 'T00:00:00').toLocaleDateString() : 'N/A'}</span>
				</p>
				<p>
					Hora: <span className='font-medium text-slate-800'>{turno.hora_turno || 'N/A'}</span>
				</p>
        		<p>
         			 Consultorio: <span className='font-medium text-slate-800'>{turno.consultorio_numero || 'N/A'}</span>
        		</p>
			</div>
			{userRole === 'cliente' && (
				<div className='mt-5'>
					<button
						type='button'
						onClick={() => onReservar(turno)}
						disabled={isReserving}
						className='w-full inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-white text-sm font-semibold shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{isReserving ? 'Reservando...' : 'Reservar turno'}
					</button>
				</div>
			)}
       {!userRole && ( <p className='mt-5 text-xs text-center text-slate-500'>Inicia sesión como paciente para reservar.</p> )}
       {userRole === 'medico' && ( <p className='mt-5 text-xs text-center text-slate-500'>Los profesionales no pueden reservar turnos.</p> )}
		</div>
	);
}
// --- Fin TurnoDisponibleCard ---

function Turnos() {
	const navigate = useNavigate();
	const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
	const [filtroFecha, setFiltroFecha] = useState('');
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [originalSelectedTurno, setOriginalSelectedTurno] = useState(null);
	const [currentUserRole, setCurrentUserRole] = useState(null);
	const [turnosDisponibles, setTurnosDisponibles] = useState([]);
	const [especialidades, setEspecialidades] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
    const [isReserving, setIsReserving] = useState(false);

	// --- FUNCIÓN fetchTurnos (MODIFICADA) ---
	useEffect(() => {
	    let isMounted = true;

	    const getRole = () => {
	        const token = localStorage.getItem('accessToken');
	        if (token) {
	            try {
	                const decodedToken = jwtDecode(token);
	                return decodedToken.rol;
	            } catch (err) {
	                console.error("Error decoding token:", err);
	                localStorage.removeItem('accessToken');
	                return null;
	            }
	        }
	        return null;
	    };

	    const fetchTurnos = async () => {
	        if (isMounted) setIsLoading(true);
	        if (isMounted) setError(null);

	        try {
                // --- CAMBIO AQUÍ ---
	            // Llamamos al nuevo endpoint que genera los slots disponibles
	            const response = await fetch('http://localhost:8000/horarios_medicos/disponibles/');
                // --- FIN DEL CAMBIO ---

				if (!response.ok) {
					let errorText = `Error ${response.status}`;
					try {
						const errorData = await response.json();
						errorText = errorData.detail || JSON.stringify(errorData);
					} catch {
					   errorText = await response.text();
					}
					throw new Error(errorText);
				}

	            const data = await response.json();

	            if (isMounted) {
	                if (!Array.isArray(data)) {
	                    throw new Error("Formato de respuesta inesperado del servidor.");
	                }
	                setTurnosDisponibles(data);
	                // La data ya incluye la especialidad, la extraemos
	                const uniqueEspecialidades = [...new Set(data.map(t => t.especialidad).filter(Boolean))];
	                setEspecialidades(uniqueEspecialidades);
	            }
	        } catch (err) {
	            if (isMounted) {
	                setError(err.message);
	            }
	        } finally {
	            if (isMounted) {
	                setIsLoading(false);
	            }
	        }
	    };

	    setCurrentUserRole(getRole());
	    fetchTurnos();

	    const handleAuthChange = () => {
	        setCurrentUserRole(getRole());
	    };
	    window.addEventListener('storage', handleAuthChange);
	    window.addEventListener('authChange', handleAuthChange);

	    return () => {
	        isMounted = false;
	        window.removeEventListener('storage', handleAuthChange);
	        window.removeEventListener('authChange', handleAuthChange);
	    };
	}, []);
    // --- FIN FUNCIÓN fetchTurnos ---


	const turnosFiltrados = useMemo(() => {
        return turnosDisponibles.filter((turno) => {
			const matchEspecialidad = !filtroEspecialidad || turno.especialidad === filtroEspecialidad;
			const matchFecha = !filtroFecha || turno.fecha_turno === filtroFecha;
			return matchEspecialidad && matchFecha;
		});
	}, [filtroEspecialidad, filtroFecha, turnosDisponibles]);

	const handleReservar = async (turnoSeleccionado) => {
		if (!currentUserRole) { setShowAuthModal(true); return; }
        if (currentUserRole !== 'cliente') { setError('Solo los pacientes pueden reservar turnos.'); return; }

        setIsReserving(true);
        setError(null);
        setOriginalSelectedTurno(turnoSeleccionado);

		const token = localStorage.getItem('accessToken');
		let clienteId;
		try { clienteId = jwtDecode(token).id; }
        catch (decodeError) { //eslint-disable-line
            setError('Sesión inválida.');
            setIsReserving(false);
            return;
        }

		const reservaData = {
            fecha_hora: turnoSeleccionado.fecha_hora,
            estado: 'pendiente',
            motivo: `Reserva para ${turnoSeleccionado.especialidad || 'consulta'}`,
            clientes_id: clienteId, 
            horarios_medicos_id: turnoSeleccionado.horarios_medico_id 
        };
        
        console.log("Enviando reserva:", JSON.stringify(reservaData, null, 2));

		try {
			const response = await fetch('http://localhost:8000/turnos/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}` 
				},
				body: JSON.stringify(reservaData), 
			});

            const responseText = await response.text();
            let data;
            
            try {
                data = JSON.parse(responseText); 
            } catch (parseError) {
                console.error("Error al parsear respuesta JSON:", parseError, "Respuesta:", responseText);
                if (!response.ok) {
                    throw new Error(responseText || `Error ${response.status} - Respuesta no es JSON válido`);
                }
                // Si el SP 'crear_turno' devuelve solo el ID (como configuramos)
                // el JSON.parse(responseText) podría fallar si no es un JSON completo.
                // Asumimos éxito si la rta es 200 OK.
                console.warn("Respuesta OK pero sin JSON válido. Asumiendo éxito.");
                data = { message: "Turno creado" }; 
            }

			if (!response.ok) {
                // El SP 'crear_turno' puede devolver un error 45000
                // que FastAPI convertirá en un error 400 o 500
				throw new Error(data?.detail || responseText || `Error ${response.status} al reservar`);
			}

			// Actualiza UI inmediatamente: quita el turno reservado de la lista
			setTurnosDisponibles(prevTurnos => 
                prevTurnos.filter(t => t.id !== turnoSeleccionado.id)
            );

			setShowSuccessModal(true); // Muestra el modal de éxito

		} catch (reservaError) {
			console.error("Error al reservar:", reservaError);
			setError(reservaError.message || 'Ocurrió un error inesperado al reservar.');
		} finally {
            setIsReserving(false); 
        }
	};

	const handleCloseSuccessModal = () => {
		setShowSuccessModal(false);
        setOriginalSelectedTurno(null);
		navigate('/turnos/dashboard'); // Navega a 'Mis Turnos'
	};

	return (
		<>
			<div className='relative min-h-[calc(100vh-64px)] overflow-hidden px-4 py-10 sm:py-14'>
				{/* Fondo y Header */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" aria-hidden />
                <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '4px 4px' }} aria-hidden />
                <div className="relative z-10 max-w-6xl mx-auto">
                    <header className="text-white mb-8">
                       <div className="flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-slate-200">
                                <path fillRule="evenodd" d="M6.75 3a.75.75 0 0 1 .75.75V5h9V3.75a.75.75 0 0 1 1.5 0V5h.75A2.25 2.25 0 0 1 21 7.25v10.5A2.25 2.25 0 0 1 18.75 20.5H5.25A2.25 2.25 0 0 1 3 17.75V7.25A2.25 2.25 0 0 1 5.25 5H6V3.75A.75.75 0 0 1 6.75 3Zm12 7.5H5.25v7.25c0 .414.336.75.75.75h12.75a.75.75 0 0 0 .75-.75V10.5Z" clipRule="evenodd" />
                            </svg>
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">Turnos disponibles</h1>
                       </div>
                       <p className="mt-3 text-slate-300">Filtra por especialidad o fecha y reserva tu turno.</p>
                    </header>

				{/* Barra de Filtros */}
				<form className='mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-white/10 backdrop-blur-sm rounded-lg border border-slate-700'>
					<div>
						<label htmlFor='especialidad' className='block text-sm font-medium text-slate-200 mb-1'>Especialidad</label>
						<select
							id='especialidad'
							value={filtroEspecialidad}
							onChange={(e) => setFiltroEspecialidad(e.target.value)}
							className='w-full rounded-md border border-slate-300 bg-white text-slate-900 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500'
						>
							<option value=''>Todas</option>
							{especialidades.map((esp) => (
								<option key={esp} value={esp}>{esp}</option>
							))}
						</select>
					</div>
					<div>
						<label htmlFor='fecha' className='block text-sm font-medium text-slate-200 mb-1'>Fecha</label>
						<input
							type='date'
							id='fecha'
							value={filtroFecha}
							onChange={(e) => setFiltroFecha(e.target.value)}
							className='w-full rounded-md border border-slate-300 bg-white text-slate-900 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500'
						/>
					</div>
					<div className='sm:mt-auto'>
						<button
							type='button'
							onClick={() => { setFiltroEspecialidad(''); setFiltroFecha(''); }}
							className='w-full inline-flex items-center justify-center rounded-md bg-slate-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-500'
						>
							Limpiar filtros
						</button>
					</div>
				</form>

                {/* Manejo de Carga y Error */}
                {isLoading && ( <div className="text-center p-10 text-slate-400">Cargando turnos...</div> )}
                {error && ( <Alert variant="error" title="Error" onClose={() => setError(null)}>{error}</Alert> )}

				{/* Grilla de Turnos */}
				{!isLoading && !error && turnosFiltrados.length > 0 && (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5'>
						{turnosFiltrados.map((turno) => (
							<TurnoDisponibleCard
								key={turno.id} // Usamos el ID compuesto (ej: "7-2025-11-20T10:30:00")
								turno={turno}
								onReservar={handleReservar}
                                userRole={currentUserRole}
                                isReserving={isReserving}
							/>
						))}
					</div>
				)}
                {/* Mensaje si no hay turnos (después de cargar y sin error) */}
                {!isLoading && !error && turnosFiltrados.length === 0 && (
					<Alert variant='info' title='No se encontraron turnos'>
						No hay turnos disponibles que coincidan con los filtros seleccionados.
					</Alert>
				)}

				{/* Botón Volver (sin cambios) */}
				<div className='mt-10 flex justify-start'>
					<button
						type='button'
						onClick={() => navigate(-1)}
						className='inline-flex items-center justify-center gap-2 rounded-md bg-white/90 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg hover:bg-white transition-all'
						aria-label='Volver hacia atrás'
						title='Volver hacia atrás'
					>
						<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className='h-5 w-5'>
							<path fillRule='evenodd' d='M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z' clipRule='evenodd' />
						</svg>
						Volver hacia atrás
					</button>
				</div>
                </div>
			</div>

			{/* Modales (sin cambios) */}
			<AuthRequiredModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
			<InfoModal isOpen={showSuccessModal} onClose={handleCloseSuccessModal} title='¡Turno Reservado!'>
                {originalSelectedTurno ?
                `Has reservado exitosamente tu turno de ${originalSelectedTurno.especialidad || '?'} con ${originalSelectedTurno.profesional_nombre_completo || '?'} para el ${originalSelectedTurno.fecha_turno ? new Date(originalSelectedTurno.fecha_turno + 'T00:00:00').toLocaleDateString() : '?'} a las ${originalSelectedTurno.hora_turno || '?'}. Ahora puedes verlo en 'Mis Turnos'.`
                : 'Tu turno ha sido reservado con éxito.'}
			</InfoModal>
		</>
	);
}

export default Turnos;