import { useContext } from 'react'; // Importa el hook useContext de React
import { Store } from '../Store'; // Importa el contexto Store
import { Helmet } from 'react-helmet-async'; // Importa Helmet para manejar el título de la página
import Row from 'react-bootstrap/Row'; // Importa Row de React Bootstrap
import Col from 'react-bootstrap/Col'; // Importa Col de React Bootstrap
import MessageBox from '../components/MessageBox'; // Importa el componente MessageBox
import ListGroup from 'react-bootstrap/ListGroup'; // Importa ListGroup de React Bootstrap
import Button from 'react-bootstrap/Button'; // Importa Button de React Bootstrap
import Card from 'react-bootstrap/Card'; // Importa Card de React Bootstrap
import { Link, useNavigate } from 'react-router-dom'; // Importa Link y useNavigate de React Router
import axios from 'axios'; // Importa axios para realizar solicitudes HTTP

export default function CartScreen() { // Define un componente funcional llamado CartScreen
  const navigate = useNavigate(); // Obtiene la función de navegación de React Router
  const { state, dispatch: ctxDispatch } = useContext(Store); // Obtiene el estado global del contexto Store
  const {
    cart: { cartItems }, // Extrae cartItems del estado
  } = state;

  const updateCartHandler = async (item, quantity) => { // Actualiza la cantidad de un elemento en el carrito
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) { // Verifica si hay suficiente stock
      window.alert('Sorry. Product is out of stock');
      return;
    }
    ctxDispatch({ // Actualiza el estado global del carrito
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };

  const removeItemHandler = (item) => { // Elimina un elemento del carrito
    ctxDispatch({ type: 'CART_REMOVE_ITEM', payload: item });
  };

  const checkoutHandler = () => { // Maneja la redirección a la pantalla de inicio de sesión para realizar el checkout
    navigate('/signin?redirect=/shipping');
  };

  return (
    <div>
      <Helmet>
        <title>Shopping Cart</title> {/* Cambia el título de la página */}
      </Helmet>
      <h1>Shopping Cart</h1> {/* Título principal */}
      <Row>
        <Col md={8}>
          {cartItems.length === 0 ? ( // Verifica si el carrito está vacío
            <MessageBox>
              Cart is empty. <Link to="/">Go Shopping</Link>
            </MessageBox>
          ) : (
            <ListGroup> {/* Lista los elementos del carrito */}
              {cartItems.map((item) => (
                <ListGroup.Item key={item._id}> {/* Elemento del carrito */}
                  {/* Muestra la imagen, el nombre y los botones de control de cantidad */}
                  <Row className="align-items-center">
                    <Col md={4}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="img-fluid rounded img-thumbnail"
                      ></img>{' '}
                      <Link to={`/product/${item.slug}`}>{item.name}</Link>
                    </Col>
                    <Col md={3}>
                      <Button
                        onClick={() =>
                          updateCartHandler(item, item.quantity - 1)
                        }
                        variant="light"
                        disabled={item.quantity === 1}
                      >
                        <i className="fas fa-minus-circle"></i>
                      </Button>{' '}
                      <span>{item.quantity}</span>{' '}
                      <Button
                        variant="light"
                        onClick={() =>
                          updateCartHandler(item, item.quantity + 1)
                        }
                        disabled={item.quantity === item.countInStock}
                      >
                        <i className="fas fa-plus-circle"></i>
                      </Button>
                    </Col>
                    <Col md={3}>${item.price}</Col>
                    <Col md={2}>
                      <Button
                        onClick={() => removeItemHandler(item)}
                        variant="light"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  {/* Muestra el subtotal y el botón para proceder al checkout */}
                  <h3>
                    Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)}{' '}
                    items) : $
                    {cartItems.reduce((a, c) => a + c.price * c.quantity, 0)}
                  </h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={checkoutHandler}
                      disabled={cartItems.length === 0}
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}