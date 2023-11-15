// Importaciones de módulos y componentes
import Axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import { getError } from '../utils';

// Componente ForgetPasswordScreen
export default function ForgetPasswordScreen() {
  // Hook 'useNavigate' para redireccionar a otras rutas
  const navigate = useNavigate();

  // Estado local para almacenar el valor del email
  const [email, setEmail] = useState('');

  // Contexto global de la aplicación
  const { state } = useContext(Store);
  const { userInfo } = state;

  // Verifica si el usuario ya inició sesión y redirige a la página principal
  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  // Función para manejar el envío del formulario
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      // Envía una solicitud al servidor para restablecer la contraseña
      const { data } = await Axios.post('/api/users/forget-password', {
        email,
      });
      // Muestra un mensaje de éxito si la solicitud se envió correctamente
      toast.success(data.message);
    } catch (err) {
      // Muestra un mensaje de error si la solicitud falla
      toast.error(getError(err));
    }
  };

  // Renderiza el contenido del componente
  return (
    <Container className="small-container">
      {/* Configura el título de la página */}
      <Helmet>
        <title>Forget Password</title>
      </Helmet>
      {/* Encabezado del formulario */}
      <h1 className="my-3">Forget Password</h1>
      {/* Formulario para enviar la solicitud de restablecimiento de contraseña */}
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          {/* Campo de entrada para el email */}
          <Form.Control
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        {/* Botón para enviar el formulario */}
        <div className="mb-3">
          <Button type="submit">Submit</Button>
        </div>
      </Form>
    </Container>
  );
}
