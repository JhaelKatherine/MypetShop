import Axios from 'axios'; // Importa Axios para realizar peticiones HTTP
import React, { useContext, useEffect, useReducer } from 'react'; // Importa elementos necesarios de React
import { Helmet } from 'react-helmet-async'; // Para manejar el título de la página asincrónicamente
import { Link, useNavigate } from 'react-router-dom'; // Para la navegación y enlaces
import Row from 'react-bootstrap/Row'; // Componente de fila de Bootstrap
import Col from 'react-bootstrap/Col'; // Componente de columna de Bootstrap
import Card from 'react-bootstrap/Card'; // Componente de tarjeta de Bootstrap
import Button from 'react-bootstrap/Button'; // Componente de botón de Bootstrap
import ListGroup from 'react-bootstrap/ListGroup'; // Componente de lista de Bootstrap
import { toast } from 'react-toastify'; // Para mostrar notificaciones
import { getError } from '../utils'; // Función de utilidad para obtener errores
import { Store } from '../Store'; // Contexto global de la aplicación
import CheckoutSteps from '../components/CheckoutSteps'; // Componente de pasos de pago
import LoadingBox from '../components/LoadingBox'; // Componente de caja de carga

// Reducer para el estado del proceso de creación de pedido
const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true };
    case 'CREATE_SUCCESS':
      return { ...state, loading: false };
    case 'CREATE_FAIL':
      return { ...state, loading: false };
    default:
      return state;
  }
};

// Componente para la pantalla de vista previa del pedido
export default function PlaceOrderScreen() {
  const navigate = useNavigate(); // Función de navegación

  // Estado y dispatch del proceso de creación del pedido
  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });

  // Obtiene el estado global de la aplicación y su dispatch
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  // Función para redondear a dos decimales
  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;

  // Calcula los precios del carrito
  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(10);
  cart.taxPrice = round2(0.15 * cart.itemsPrice);
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;

  // Maneja la creación del pedido
  const placeOrderHandler = async () => {
    try {
      dispatch({ type: 'CREATE_REQUEST' });

      // Realiza una petición para crear el pedido
      const { data } = await Axios.post(
        '/api/orders',
        {
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: cart.paymentMethod,
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      
      // Limpia el carrito y redirige a la página del pedido creado
      ctxDispatch({ type: 'CART_CLEAR' });
      dispatch({ type: 'CREATE_SUCCESS' });
      localStorage.removeItem('cartItems');
      navigate(`/order/${data.order._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };

  // Redirige al usuario a la pantalla de pago si no se ha seleccionado un método de pago
  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart, navigate]);

  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4></CheckoutSteps> {/* Indicador de pasos de pago */}
      <Helmet>
        <title>Preview Order</title>
      </Helmet>
      <h1 className="my-3">Preview Order</h1>
      <Row>
        <Col md={8}>
          {/* Información de envío */}
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
              <Card.Text>
                {/* Detalles de la dirección de envío */}
              </Card.Text>
              <Link to="/shipping">Edit</Link> {/* Enlace para editar la dirección */}
            </Card.Body>
          </Card>

          {/* Método de pago */}
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Payment</Card.Title>
              <Card.Text>
                {/* Detalles del método de pago */}
              </Card.Text>
              <Link to="/payment">Edit</Link> {/* Enlace para editar el método de pago */}
            </Card.Body>
          </Card>

          {/* Detalles de los artículos */}
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant="flush">
                {/* Lista de artículos en el carrito */}
              </ListGroup>
              <Link to="/cart">Edit</Link> {/* Enlace para editar el carrito */}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          {/* Resumen del pedido */}
          <Card>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                {/* Detalles del resumen del pedido */}
                <ListGroup.Item>
                  {/* Botón para realizar el pedido */}
                  <Button
                    type="button"
                    onClick={placeOrderHandler}
                    disabled={cart.cartItems.length === 0}
                  >
                    Place Order
                  </Button>
                  {/* Caja de carga mientras se procesa el pedido */}
                  {loading && <LoadingBox></LoadingBox>}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

