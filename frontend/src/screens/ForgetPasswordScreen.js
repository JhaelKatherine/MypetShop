// Importación de módulos y componentes necesarios
import Axios from 'axios'; // Importa el cliente Axios para hacer solicitudes HTTP
import { useContext, useEffect, useState } from 'react'; // Importa hooks de React para manejar estados y efectos
import Container from 'react-bootstrap/Container'; // Importa el contenedor de Bootstrap de React
import Button from 'react-bootstrap/Button'; // Importa el botón de Bootstrap de React
import Form from 'react-bootstrap/Form'; // Importa el formulario de Bootstrap de React
import { Helmet } from 'react-helmet-async'; // Importa Helmet para gestionar el título de la página dinámicamente
import { useNavigate } from 'react-router-dom'; // Importa hook para navegación en React Router
import { toast } from 'react-toastify'; // Importa la librería para notificaciones de toast
import { Store } from '../Store'; // Importa el contexto Store
import { getError } from '../utils'; // Importa una función utilitaria para obtener errores

// Componente ForgetPasswordScreen
export default function ForgetPasswordScreen() {
  const navigate = useNavigate(); // Obtiene la función de navegación

  const [email, setEmail] = useState(''); // Estado local para almacenar el email del usuario

  const { state } = useContext(Store); // Obtiene el estado global del contexto
  const { userInfo } = state; // Extrae la información del usuario del estado global

  // Efecto que redirige al usuario si ya ha iniciado sesión
  useEffect(() => {
    if (userInfo) {
      navigate('/'); // Redirige a la página principal si el usuario ya está autenticado
    }
  }, [navigate, userInfo]);

  // Función que maneja el envío del formulario
  const submitHandler = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    try {
      const { data } = await Axios.post('/api/users/forget-password', {
        email, // Envía una solicitud POST con el email proporcionado por el usuario
      });
      toast.success(data.message); // Muestra un mensaje de éxito si la solicitud es exitosa
    } catch (err) {
      toast.error(getError(err)); // Muestra un mensaje de error si la solicitud falla
    }
  };

  return (
    // Componente de contenedor
    <Container className="small-container">
      <Helmet>
        <title>Forget Password</title> // Establece el título de la página dinámicamente
      </Helmet>
      <h1 className="my-3">Forget Password</h1> // Título de la página
      <Form onSubmit={submitHandler}> // Formulario que llama a la función submitHandler al enviar
        <Form.Group className="mb-3" controlId="email"> // Grupo de formulario para el email
          <Form.Label>Email</Form.Label> // Etiqueta para el campo de email
          <Form.Control
            type="email" // Campo de entrada de tipo email
            required // Campo obligatorio
            onChange={(e) => setEmail(e.target.value)} // Actualiza el estado del email al cambiar el valor del campo
          />
        </Form.Group>

        <div className="mb-3">
          <Button type="submit">submit</Button> // Botón para enviar el formulario
        </div>
      </Form>
    </Container>
  );
}
