import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom'; // Importación de un componente de navegación de React Router
import { Store } from '../Store'; // Importación de un contexto (Store)

export default function AdminRoute({ children }) { // Definición de un componente funcional llamado AdminRoute que recibe `children`
  const { state } = useContext(Store); // Uso del hook useContext para acceder al contexto Store
  const { userInfo } = state; // Extracción de `userInfo` del estado del contexto
  
  // Verificación si `userInfo` existe y si el usuario tiene rol de administrador
  return userInfo && userInfo.isAdmin ? children : <Navigate to="/signin" />; 
  // Si el usuario es un administrador, renderiza los `children` (componentes hijos), de lo contrario, redirige a la página de inicio de sesión (/signin)
}
