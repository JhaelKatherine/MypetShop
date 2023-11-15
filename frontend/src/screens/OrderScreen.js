// Importación de módulos y componentes necesarios
import axios from 'axios'; // Módulo para realizar solicitudes HTTP
import React, { useContext, useEffect, useReducer } from 'react'; // Importación de módulos de React
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'; // Componentes de PayPal
import { Helmet } from 'react-helmet-async'; // Para manejar el encabezado del documento de forma asíncrona
import { useNavigate, useParams } from 'react-router-dom'; // Gestionar navegación y parámetros de URL
import Row from 'react-bootstrap/Row'; // Componentes de Bootstrap para el diseño de filas
import Col from 'react-bootstrap/Col'; // Componentes de Bootstrap para el diseño de columnas
import Button from 'react-bootstrap/Button'; // Componente de botón de Bootstrap
import ListGroup from 'react-bootstrap/ListGroup'; // Componente de lista de Bootstrap
import Card from 'react-bootstrap/Card'; // Componente de tarjeta de Bootstrap
import { Link } from 'react-router-dom'; // Componente de enlace para enrutamiento
import LoadingBox from '../components/LoadingBox'; // Componente de caja de carga
import MessageBox from '../components/MessageBox'; // Componente de caja de mensaje
import { Store } from '../Store'; // Contexto global de la aplicación
import { getError } from '../utils'; // Función utilitaria para obtener mensajes de error
import { toast } from 'react-toastify'; // Librería para mostrar notificaciones estilo toast

// Función reductora para gestionar el estado del componente
function reducer(state, action) {
  // Lógica para gestionar diferentes acciones y actualizar el estado
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL':
      return { ...state, loadingPay: false };
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false };

    case 'DELIVER_REQUEST':
      return { ...state, loadingDeliver: true };
    case 'DELIVER_SUCCESS':
      return { ...state, loadingDeliver: false, successDeliver: true };
    case 'DELIVER_FAIL':
      return { ...state, loadingDeliver: false };
    case 'DELIVER_RESET':
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
      };
    default:
      return state;
  }
}

// Componente principal de la pantalla de la orden
export default function OrderScreen() {
  // Obtención del estado global de la aplicación a través del contexto
  const { state } = useContext(Store);
  const { userInfo } = state; // Información del usuario actual

  // Obtención de parámetros de la URL
  const params = useParams(); // Obtención de parámetros dinámicos de la URL
  const { id: orderId } = params; // ID de la orden obtenido de los parámetros de la URL
  const navigate = useNavigate(); // Función para la navegación programática

  // Uso del reductor para gestionar el estado local del componente
  const [
    {
      loading,
      error,
      order,
      successPay,
      loadingPay,
      loadingDeliver,
      successDeliver,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
    successPay: false,
    loadingPay: false,
  });

  // Obtención del estado del script de PayPal
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  // Función para crear una orden de PayPal
  function createOrder(data, actions) {
    // Lógica para crear una orden de PayPal
    return actions.order
    .create({
      purchase_units: [
        {
          amount: { value: order.totalPrice },
        },
      ],
    })
    .then((orderID) => {
      return orderID;
    });
  }

  // Función que se ejecuta al aprobar el pago en PayPal
  function onApprove(data, actions) {
    // Lógica para capturar el pago en PayPal
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: 'PAY_REQUEST' });
        const { data } = await axios.put(
          `/api/orders/${order._id}/pay`,
          details,
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: 'PAY_SUCCESS', payload: data });
        toast.success('Order is paid');
      } catch (err) {
        dispatch({ type: 'PAY_FAIL', payload: getError(err) });
        toast.error(getError(err));
      }
    });
  }

  // Función para manejar errores de PayPal
  function onError(err) {
    // Manejo de errores de PayPal
    toast.error(getError(err));
  }

  // Efecto para cargar los datos de la orden y el script de PayPal
  useEffect(() => {
    // Función asincrónica para obtener datos de la orden y el script de PayPal
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (!userInfo) {
      return navigate('/login');
    }
    if (
      !order._id ||
      successPay ||
      successDeliver ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }
      if (successDeliver) {
        dispatch({ type: 'DELIVER_RESET' });
      }
    } else {
      const loadPaypalScript = async () => {
        const { data: clientId } = await axios.get('/api/keys/paypal', {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': clientId,
            currency: 'USD',
          },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };
      loadPaypalScript();
    }

  }, [
    order,
    userInfo,
    orderId,
    navigate,
    paypalDispatch,
    successPay,
    successDeliver,
  ]);

  // Función para manejar la entrega de la orden
  async function deliverOrderHandler() {
    // Lógica para marcar la orden como entregada
    try {
      dispatch({ type: 'DELIVER_REQUEST' });
      const { data } = await axios.put(
        `/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'DELIVER_SUCCESS', payload: data });
      toast.success('Order is delivered');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'DELIVER_FAIL' });
    }
  }

  // Renderizado condicional basado en el estado de carga y errores
  return loading ? (
    <LoadingBox></LoadingBox> // Caja de carga mientras se obtienen los datos
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox> // Mensaje de error si falla la obtención de datos
  ) : (
    <div>
      {/* Encabezado dinámico */}
      <Helmet>
        <title>Order {orderId}</title>
      </Helmet>
      <h1 className="my-3">Order {orderId}</h1>
      <Row>
        {/* Sección de detalles de la orden */}
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
              <Card.Text>
                {/* Detalles de envío de la orden */}
                <strong>Name:</strong> {order.shippingAddress.fullName} <br />
                <strong>Address: </strong> {order.shippingAddress.address},
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                ,{order.shippingAddress.country}
                &nbsp;
                {order.shippingAddress.location &&
                  order.shippingAddress.location.lat && (
                    <a
                      target="_new"
                      href={`https://maps.google.com?q=${order.shippingAddress.location.lat},${order.shippingAddress.location.lng}`}
                    >
                      Show On Map
                    </a>
                  )}
              </Card.Text>
              {/* Estado de la entrega */}
              {order.isDelivered ? (
                <MessageBox variant="success">
                  Delivered at {order.deliveredAt}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">Not Delivered</MessageBox>
              )}
            </Card.Body>
          </Card>
          {/* Sección de detalles de pago */}
          
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Payment</Card.Title>
              <Card.Text>
                {/* Detalles del método de pago */}
                <strong>Method:</strong> {order.paymentMethod}
              </Card.Text>
              {/* Estado del pago */}
              {order.isPaid ? (
                <MessageBox variant="success">
                  Paid at {order.paidAt}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">Not Paid</MessageBox>
              )}
            </Card.Body>
          </Card>
          {/* Sección de detalles de artículos */}
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant="flush">
                {/* Lista de artículos comprados */}
                {order.orderItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>{' '}
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </Col>
                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={3}>${item.price}</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        {/* Sección de resumen de la orden */}
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                {/* Resumen de la orden */}
                {/* Botones de PayPal */}
                {/* Botón de entrega de la orden */}
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>${order.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>${order.shippingPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>${order.taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Order Total</strong>
                    </Col>
                    <Col>
                      <strong>${order.totalPrice.toFixed(2)}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                {!order.isPaid && (
                  <ListGroup.Item>
                    {isPending ? (
                      <LoadingBox />
                    ) : (
                      <div>
                        <PayPalButtons
                          createOrder={createOrder}
                          onApprove={onApprove}
                          onError={onError}
                        ></PayPalButtons>
                      </div>
                    )}
                    {loadingPay && <LoadingBox></LoadingBox>}
                  </ListGroup.Item>
                )}
                {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                  <ListGroup.Item>
                    {loadingDeliver && <LoadingBox></LoadingBox>}
                    <div className="d-grid">
                      <Button type="button" onClick={deliverOrderHandler}>
                        Deliver Order
                      </Button>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
