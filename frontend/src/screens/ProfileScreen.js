import React, { useContext, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async'; // Importa Helmet para manejar metadatos de la página
import Form from 'react-bootstrap/Form'; // Importa el componente Form de Bootstrap de React
import Button from 'react-bootstrap/Button'; // Importa el componente Button de Bootstrap de React
import { Store } from '../Store'; // Importa el contexto Store
import { toast } from 'react-toastify'; // Importa la librería para notificaciones de toast
import { getError } from '../utils'; // Importa una función utilitaria para obtener errores
import axios from 'axios'; // Importa axios para hacer solicitudes HTTP

// Reductor para manejar los cambios de estado
const reducer = (state, action) => {
  switch (action.type) {
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

// Componente ProfileScreen
export default function ProfileScreen() {
  // Obtiene el estado global y la función de despacho del contexto Store
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state; // Obtiene la información del usuario del estado global
  const [name, setName] = useState(userInfo.name); // Estado local para el nombre
  const [email, setEmail] = useState(userInfo.email); // Estado local para el email
  const [password, setPassword] = useState(''); // Estado local para la contraseña
  const [confirmPassword, setConfirmPassword] = useState(''); // Estado local para confirmar contraseña

  // UseReducer para manejar el estado y las acciones relacionadas con la actualización del usuario
  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  // Función para enviar los datos actualizados del usuario
  const submitHandler = async (e) => {
    e.preventDefault(); // Evita el comportamiento por defecto del formulario
    try {
      // Realiza una solicitud PUT para actualizar el perfil del usuario
      const { data } = await axios.put(
        '/api/users/profile',
        {
          name,
          email,
          password,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      // Dispara una acción de actualización exitosa en el reducer
      dispatch({
        type: 'UPDATE_SUCCESS',
      });

      // Actualiza la información del usuario en el estado global
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });

      // Almacena la información del usuario actualizada en el almacenamiento local
      localStorage.setItem('userInfo', JSON.stringify(data));

      // Muestra una notificación de éxito
      toast.success('User updated successfully');
    } catch (err) {
      // En caso de error, muestra una notificación de error
      dispatch({
        type: 'FETCH_FAIL',
      });
      toast.error(getError(err));
    }
  };

  // Renderiza el formulario para actualizar el perfil del usuario
  return (
    <div className="container small-container">
      <Helmet>
        <title>User Profile</title>
      </Helmet>
      <h1 className="my-3">User Profile</h1>
      <form onSubmit={submitHandler}>
        {/* Campos para el nombre, email, contraseña y confirmación de contraseña */}
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>
        <div className="mb-3">
          <Button type="submit">Update</Button>
        </div>
      </form>
    </div>
  );
}
