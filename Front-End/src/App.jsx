import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion'; //eslint-disable-line
import './App.css'; 
import Header from './components/Header'; 
import Hero from './components/Hero'; 
import Footer from './components/Footer'; 
import Login from './pages/Login'; 
import Turnos from './pages/Turnos'; 
import About from './pages/About'; 
import Register from './pages/Register'; 

// --- 1. Importaciones de Rutas Protegidas ---
import ProtectedRoute from './components/ProtectedRoute'; // Asegúrate de tener este componente

// Cliente
import Dashboard from './pages/Dashboard'; 
import DashboardTurnos from './pages/DashboardTurnos'; 

// Admin
import AdminDashboard from './pages/AdminDashboard'; 

// --- 2. Importar las nuevas páginas de Médico ---
import MedicosDashboard from './pages/MedicosDashboard';
import MedicoTurnos from './pages/MedicoTurnos';
import MedicoPacientes from './pages/MedicoPacientes';
import MedicoHorarios from './pages/MedicoHorarios';
import MedicoHistorial from './pages/MedicoHistorial';
import MedicoReportes from './pages/MedicoReportes';

function App() {
	const navigate = useNavigate();
	const location = useLocation();
	const handleVerTurnos = () => navigate('/turnos');
	const handleIngresar = () => navigate('/login');

	return (
		<div className='min-h-screen flex flex-col bg-slate-900 text-slate-100'>
			<Header />
			<main className='flex-1'>
				<AnimatePresence mode='wait'>
					<motion.div
						key={location.pathname}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0, transition: { duration: 0.25 } }}
						exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
					>
						<Routes location={location}>
							{/* Rutas Públicas */}
							<Route
								path='/'
								element={
									<Hero
										onVerTurnos={handleVerTurnos}
										onIngresar={handleIngresar}
									/>
								}
							/>
							<Route path='/login' element={<Login />} />
							<Route path='/register' element={<Register />} />
							<Route path='/turnos' element={<Turnos />} />
							<Route path='/about' element={<About />} />

							{/* Rutas de Cliente */}
							<Route element={<ProtectedRoute allowedRoles={['cliente']} />}>
								<Route path='/dashboard' element={<Dashboard />} />
								<Route path='/turnos/dashboard' element={<DashboardTurnos />} />
								{/* <Route path='/perfil' element={<Perfil />} /> */}
							</Route>

							{/* Rutas de Admin (Ejemplo) */}
							<Route element={<ProtectedRoute allowedRoles={['admin']} />}>
								<Route path='/admin/dashboard' element={<AdminDashboard />} />
								{/* (Aquí irían las otras rutas de admin) */}
							</Route>

							{/* --- 3. Añadir Rutas de Médico --- */}
							<Route element={<ProtectedRoute allowedRoles={['medico']} />}>
								<Route path='/medico/dashboard' element={<MedicosDashboard />} />
								<Route path='/medico/turnos' element={<MedicoTurnos />} />
								<Route path='/medico/pacientes' element={<MedicoPacientes />} />
								<Route path='/medico/horarios' element={<MedicoHorarios />} />
								<Route path='/medico/historial' element={<MedicoHistorial />} />
								<Route path='/medico/reportes' element={<MedicoReportes />} />
							</Route>

						</Routes>
					</motion.div>
				</AnimatePresence>
			</main>
			<Footer />
		</div>
	);
}

export default App;