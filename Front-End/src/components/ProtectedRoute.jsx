import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { checkAuth } from '../utils/auth';

/**
 * Componente de Ruta Protegida.
 * Verifica la autenticación y el rol del usuario.
 * @param {{ allowedRoles: Array<string> }} props
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation();
  const { isAuthenticated, role } = checkAuth(allowedRoles);

  if (!isAuthenticated) {
    // Redirige al login si no está autenticado
    // Pasa la ubicación actual para redirigir de vuelta después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // --- Manejo de Roles ---
  // Si se definieron roles permitidos y el rol del usuario no está en la lista
  if (allowedRoles && !allowedRoles.includes(role)) {
    // El usuario está logueado pero no tiene permiso
    // Lo ideal es redirigir a una página de "No Autorizado" (403)
    // Por ahora, lo enviamos al dashboard correspondiente a su rol
    
    console.warn(`Acceso denegado: Rol '${role}' intentando acceder a ruta para '${allowedRoles.join(', ')}'`);
    
    if (role === 'medico') {
        return <Navigate to="/medico/dashboard" replace />;
    }
    if (role === 'cliente') {
        return <Navigate to="/dashboard" replace />;
    }
    // Si tiene un rol desconocido, de vuelta al login
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado y tiene el rol correcto (o no se especificaron roles),
  // renderiza el contenido de la ruta hija (ej. <Dashboard />)
  return <Outlet />;
};

export default ProtectedRoute;