// src/utils/auth.jsx

import { jwtDecode } from 'jwt-decode';

/**
 * Decodifica el token JWT almacenado en localStorage.
 * Maneja errores si el token es inválido o no existe.
 */
export const getDecodedToken = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return null;
  }
  try {
    const decodedToken = jwtDecode(token);
    return decodedToken;
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    // Si el token es inválido, lo borramos
    logout();
    return null;
  }
};

/**
 * Devuelve los headers de autenticación listos para un fetch.
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Cierra la sesión del usuario, limpia localStorage y
 * dispara un evento global para actualizar componentes (como el Header).
 */
export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('tokenType');
  // Dispara el evento para que el Header y otros componentes reaccionen
  window.dispatchEvent(new Event('authChange'));
};

/**
 * Verifica si el usuario está autenticado y si su rol
 * coincide con uno de los roles permitidos (usado por ProtectedRoute).
 */
export const checkAuth = (allowedRoles) => {
  const decodedToken = getDecodedToken();

  if (!decodedToken) {
    return { isAuthenticated: false, role: null };
  }

  const userRole = decodedToken.rol; // 'cliente' o 'medico'

  // Verifica si el rol del token está en la lista de roles permitidos
  const hasPermission = allowedRoles ? allowedRoles.includes(userRole) : true;

  return { isAuthenticated: true, role: userRole, hasPermission: hasPermission };
};