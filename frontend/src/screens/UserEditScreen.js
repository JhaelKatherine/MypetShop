import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';

// Reducer para manejar los cambios de estado relacionados con la obtención y actualización de usuarios
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    default:
      return state;
  }
};

// Componente UserEditScreen para la edición de usuarios
export default function UserEditScreen() {
  // Usa el hook useReducer para manejar el estado y acciones relacionadas con la obtención y actualización de usuarios
  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  // Obtiene el estado global del contexto Store
  const { state } = useContext(Store);
  const { userInfo } = state;

  // Obtiene el parámetro ID del usuario de la URL usando useParams de React Router
  const params = useParams();
  const { id: userId } = params;
  const navigate = useNavigate();

  // Define estados locales para el nombre, correo y rol de administrador del usuario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Se ejecuta al cargar el componente para obtener los datos del usuario a editar
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        // Realiza una solicitud GET al servidor para obtener los datos del usuario
        const { data } = await axios.get(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        // Actualiza los estados locales con los datos del usuario obtenidos
        setName(data.name);
        setEmail(data.email);
        setIsAdmin(data.isAdmin);
        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (err) {
        // Maneja los errores si la solicitud falla
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, [userId, userInfo]);

  // Función para manejar la actualización del usuario
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      // Realiza una solicitud PUT al servidor para actualizar los datos del usuario
      await axios.put(
        `/api/users/${userId}`,
        { _id: userId, name, email, isAdmin },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({
        type: 'UPDATE_SUCCESS',
      });
      // Muestra una notificación de éxito y redirige a la lista de usuarios
      toast.success('User updated successfully');
      navigate('/admin/users');
    } catch (error) {
      // Maneja los errores si la solicitud de actualización falla
      toast.error(getError(error));
      dispatch({ type: 'UPDATE_FAIL' });
    }
  };

  // Renderiza el formulario de edición de usuario
  return (
    <Container className="small-container">
      <Helmet>
        <title>Edit User ${userId}</title>
      </Helmet>
      <h1>Edit User {userId}</h1>

      {/* Muestra un indicador de carga mientras se obtienen los datos del usuario */}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        // Muestra un mensaje de error si hay algún problema al obtener los datos del usuario
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        // Muestra el formulario para editar los datos del usuario
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            {/* Input para modificar el nombre del usuario */}
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            {/* Input para modificar el correo electrónico del usuario */}
            <Form.Control
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          {/* Checkbox para modificar el rol de administrador del usuario */}
          <Form.Check
            className="mb-3"
            type="checkbox"
            id="isAdmin"
            label="isAdmin"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />

          {/* Botón para enviar el formulario de actualización */}
          <div className="mb-3">
            <Button disabled={loadingUpdate} type="submit">
              Update
            </Button>
            {loadingUpdate && <LoadingBox></LoadingBox>}
          </div>
        </Form>
      )}
    </Container>
  );
}
