import React, { useContext, useEffect, useReducer } from 'react';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async'; // Importa Helmet para manejar metadatos de la página
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para la navegación
import { toast } from 'react-toastify'; // Importa la librería para notificaciones de toast
import LoadingBox from '../components/LoadingBox'; // Importa un componente de carga
import MessageBox from '../components/MessageBox'; // Importa un componente de mensaje
import { Store } from '../Store'; // Importa el contexto Store
import { getError } from '../utils'; // Importa una función utilitaria para obtener errores
import axios from 'axios'; // Importa axios para hacer solicitudes HTTP

// Reductor para manejar los cambios de estado
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        users: action.payload,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};

// Componente UserListScreen
export default function UserListScreen() {
  const navigate = useNavigate(); // Función para la navegación

  // Usa useReducer para manejar el estado y las acciones relacionadas con la lista de usuarios
  const [{ loading, error, users, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  // Obtiene el estado global y la función de despacho del contexto Store
  const { state } = useContext(Store);
  const { userInfo } = state; // Obtiene la información del usuario del estado global

  // Efecto para cargar la lista de usuarios desde la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/users`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };

    // Revisa si se ha completado una eliminación exitosa para reiniciar el estado
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  // Función para eliminar un usuario
  const deleteHandler = async (user) => {
    if (window.confirm('Are you sure to delete?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/users/${user._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('user deleted successfully');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (error) {
        toast.error(getError(error));
        dispatch({
          type: 'DELETE_FAIL',
        });
      }
    }
  };

  // Renderiza la lista de usuarios y maneja la eliminación de usuarios
  return (
    <div>
      <Helmet>
        <title>Users</title>
      </Helmet>
      <h1>Users</h1>

      {/* Muestra un indicador de carga mientras se obtiene la lista de usuarios */}
      {loadingDelete && <LoadingBox></LoadingBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        // Muestra un mensaje de error si hay algún problema al obtener la lista de usuarios
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        // Muestra la tabla con los usuarios y sus acciones
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>IS ADMIN</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.isAdmin ? 'YES' : 'NO'}</td>
                <td>
                  {/* Botones para editar y eliminar usuarios */}
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => navigate(`/admin/user/${user._id}`)}
                  >
                    Edit
                  </Button>
                  &nbsp;
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => deleteHandler(user)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
