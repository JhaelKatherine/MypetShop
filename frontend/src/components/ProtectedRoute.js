import React, { useContext } from 'react'; // Importa React y useContext desde 'react'
import { Navigate } from 'react-router-dom'; // Importa Navigate desde 'react-router-dom'
import { Store } from '../Store'; // Importa el contexto Store desde un archivo local

export default function ProtectedRoute({ children }) { // Define un componente funcional llamado ProtectedRoute que recibe children como argumento
  const { state } = useContext(Store); // Obtiene el estado del contexto Store usando el hook useContext
  const { userInfo } = state; // Extrae la información del usuario del estado

  return userInfo ? children : <Navigate to="/signin" />; // Retorna un componente Navigate a '/signin' si no hay información de usuario, de lo contrario, renderiza los children
}
