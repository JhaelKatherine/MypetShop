import React, { useContext, useEffect, useReducer } from 'react'; // Importación de elementos necesarios de React
import { toast } from 'react-toastify'; // Para mostrar notificaciones
import Button from 'react-bootstrap/Button'; // Botón de Bootstrap
import { Helmet } from 'react-helmet-async'; // Para manejar el título de la página asincrónicamente
import { useNavigate } from 'react-router-dom'; // Para la navegación
import LoadingBox from '../components/LoadingBox'; // Componente de carga
import MessageBox from '../components/MessageBox'; // Componente para mostrar mensajes
import { Store } from '../Store'; // Contexto global de la aplicación
import { getError } from '../utils'; // Función de utilidad para obtener mensajes de error
import axios from 'axios'; // Cliente HTTP

// Reducer para manejar el estado de la carga, errores y pedidos
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true }; // Indica que se está realizando una petición
    case 'FETCH_SUCCESS':
      return {
        ...state,
        orders: action.payload, // Guarda los pedidos obtenidos
        loading: false, // Indica que la petición ha finalizado
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload }; // Guarda el error si hay problemas en la petición
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false }; // Indica que se está realizando la eliminación de un pedido
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false, // Indica que la eliminación fue exitosa
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false }; // Indica que ha habido un fallo al eliminar un pedido
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false }; // Restablece el estado después de una eliminación exitosa
    default:
      return state;
  }
};

// Componente principal para mostrar la lista de pedidos
export default function OrderListScreen() {
  const navigate = useNavigate(); // Función para la navegación
  const { state } = useContext(Store); // Acceso al estado global de la aplicación
  const { userInfo } = state; // Datos del usuario logueado

  // Estado y dispatch del reducer para manejar los pedidos
  const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true, // Indica que se está cargando la lista de pedidos
      error: '', // Almacena errores, si los hay
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' }); // Inicia la petición de los pedidos
        const { data } = await axios.get(`/api/orders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }, // Incluye el token de autenticación
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data }); // Guarda los pedidos obtenidos
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err), // Guarda el error si hay problemas en la petición
        });
      }
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' }); // Si se borró un pedido, se restablece el estado
    } else {
      fetchData(); // Si no, se obtienen los datos de los pedidos
    }
  }, [userInfo, successDelete]); // Se ejecuta cada vez que cambian userInfo o successDelete

  // Función para eliminar un pedido
  const deleteHandler = async (order) => {
    if (window.confirm('Are you sure to delete?')) { // Pregunta de confirmación para borrar el pedido
      try {
        dispatch({ type: 'DELETE_REQUEST' }); // Indica que se está realizando la eliminación
        await axios.delete(`/api/orders/${order._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }, // Se incluye el token de autenticación
        });
        toast.success('order deleted successfully'); // Muestra un mensaje de éxito al borrar el pedido
        dispatch({ type: 'DELETE_SUCCESS' }); // Indica que la eliminación fue exitosa
      } catch (err) {
        toast.error(getError(error)); // Si hay un error al borrar, muestra el mensaje al usuario
        dispatch({
          type: 'DELETE_FAIL',
        });
      }
    }
  };

  return (
    <div>
      <Helmet>
        <title>Orders</title> {/* Modifica el título de la página */}
      </Helmet>
      <h1>Orders</h1> {/* Encabezado de la página */}
      {loadingDelete && <LoadingBox></LoadingBox>} {/* Muestra un indicador de carga al borrar */}
      {loading ? (
        <LoadingBox></LoadingBox> // Muestra un indicador de carga al obtener los pedidos
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox> // Muestra un mensaje de error si ocurre algún problema
      ) : (
        <table className="table"> {/* Tabla que muestra la lista de pedidos */}
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {/* Mapea y muestra cada pedido */}
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user ? order.user.name : 'DELETED USER'}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>{order.totalPrice.toFixed(2)}</td>
                <td>{order.isPaid ? order.paidAt.substring(0, 10) : 'No'}</td>
                <td>
                  {order.isDelivered
                    ? order.deliveredAt.substring(0, 10)
                    : 'No'}
                </td>
                <td>
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => {
                      navigate(`/order/${order._id}`);
                    }}
                  >
                    Details
                  </Button>
                  &nbsp;
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => deleteHandler(order)}
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
