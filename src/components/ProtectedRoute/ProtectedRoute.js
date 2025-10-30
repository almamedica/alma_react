// src/components/ProtectedRoute/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Revisa si existe un token en localStorage
  const userSession = localStorage.getItem('userSession');

  // Si no hay sesión, redirige al usuario a la página de /login
  if (!userSession) {
    return <Navigate to="/login" />;
  }

  // Si hay sesión, muestra el componente hijo (la página protegida)
  return children;
};

export default ProtectedRoute;