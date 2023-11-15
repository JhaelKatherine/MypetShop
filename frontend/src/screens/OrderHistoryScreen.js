// Importaciones de módulos y componentes necesarios
import React, { useContext, useEffect, useReducer } from 'react'; // Importación de elementos de React
import { Helmet } from 'react-helmet-async'; // Para manipular los elementos <head> del HTML de manera asíncrona
import axios from 'axios'; // Para hacer peticiones HTTP
import { useNavigate } from 'react-router-dom'; // Para la navegación
import LoadingBox from '../components/LoadingBox'; // Componente para mostrar cuando se está cargando información
import MessageBox from '../components/MessageBox'; // Componente para mostrar mensajes de error o éxito
import { Store } from '../Store'; // Contexto global de la aplicación
import { getError } from '../utils'; // Función utilitaria para obtener mensajes de error
import Button from 'react-bootstrap/esm/Button'; // Botón de Bootstrap

// Reducer para manejar el estado de carga, errores y pedidos
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, orders: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Componente principal para mostrar el historial de pedidos
export default function OrderHistoryScreen() {
  const { state } = useContext(Store); // Acceso al contexto global de la aplicación
  const { userInfo } = state; // Información del usuario logueado
  const navigate = useNavigate(); // Función para navegar entre páginas

  // Estado y dispatch del reducer para manejar los pedidos
  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  // Efecto para cargar los pedidos del usuario
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' }); // Indica que se está realizando una petición
      try {
        // Petición GET para obtener los pedidos del usuario
        const { data } = await axios.get(`/api/orders/mine`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }, // Se incluye el token de autenticación
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data }); // Se guardan los pedidos obtenidos
      } catch (error) {
        dispatch({ // Si hay un error en la petición, se maneja y se muestra al usuario
          type: 'FETCH_FAIL',
          payload: getError(error),
        });
      }
    };
    fetchData(); // Ejecuta la función para obtener los datos al cargar el componente
  }, [userInfo]); // Se ejecuta cada vez que userInfo cambia

  return (
    <div>
      <Helmet>
        <title>Order History</title> {/* Se modifica el título de la página */}
      </Helmet>

      <h1>Order History</h1> {/* Encabezado de la página */}
      {loading ? ( // Si está cargando, se muestra el componente LoadingBox
        <LoadingBox></LoadingBox>
      ) : error ? ( // Si hay un error, se muestra el componente MessageBox
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        // Si no hay errores ni está cargando, se muestran los pedidos en una tabla
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {/* Mapeo de los pedidos para mostrarlos en la tabla */}
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>{order.totalPrice.toFixed(2)}</td>
                <td>{order.isPaid ? order.paidAt.substring(0, 10) : 'No'}</td>
                <td>
                  {order.isDelivered
                    ? order.deliveredAt.substring(0, 10)
                    : 'No'}
                </td>
                <td>
                  {/* Botón para ver los detalles del pedido */}
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => {
                      navigate(`/order/${order._id}`);
                    }}
                  >
                    Details
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