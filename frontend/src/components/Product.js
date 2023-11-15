import Card from 'react-bootstrap/Card'; // Importa el componente Card de react-bootstrap
import Button from 'react-bootstrap/Button'; // Importa el componente Button de react-bootstrap
import { Link } from 'react-router-dom'; // Importa el componente Link de react-router-dom
import Rating from './Rating'; // Importa el componente Rating desde un archivo local
import axios from 'axios'; // Importa axios para hacer peticiones HTTP
import { useContext } from 'react'; // Importa useContext desde react
import { Store } from '../Store'; // Importa el contexto Store desde un archivo local

function Product(props) { // Define un componente funcional llamado Product que recibe props
  const { product } = props; // Extrae la propiedad 'product' de las props

  const { state, dispatch: ctxDispatch } = useContext(Store); // Obtiene el estado y el despachador del contexto
  const {
    cart: { cartItems }, // Obtiene cartItems del estado global
  } = state;

  const addToCartHandler = async (item) => { // Función para manejar la adición de productos al carrito
    const existItem = cartItems.find((x) => x._id === product._id); // Verifica si el producto ya está en el carrito
    const quantity = existItem ? existItem.quantity + 1 : 1; // Calcula la cantidad del producto a agregar
    const { data } = await axios.get(`/api/products/${item._id}`); // Obtiene datos del producto desde el servidor

    // Verifica si el producto está disponible en el stock
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock'); // Muestra una alerta si el producto está agotado
      return;
    }

    // Agrega el producto al carrito a través del contexto usando el despachador
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };

  return (
    <Card> {/* Componente Card para mostrar información del producto */}
      <Link to={`/product/${product.slug}`}> {/* Enlace a la página de detalle del producto */}
        <img src={product.image} className="card-img-top" alt={product.name} /> {/* Imagen del producto */}
      </Link>
      <Card.Body> {/* Cuerpo de la tarjeta */}
        <Link to={`/product/${product.slug}`}> {/* Enlace al detalle del producto */}
          <Card.Title>{product.name}</Card.Title> {/* Título del producto */}
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} /> {/* Componente Rating para mostrar la calificación */}
        <Card.Text>${product.price}</Card.Text> {/* Precio del producto */}
        {product.countInStock === 0 ? ( /* Botón de añadir al carrito o mensaje de fuera de stock */
          <Button variant="light" disabled>
            Out of stock
          </Button>
        ) : (
          <Button onClick={() => addToCartHandler(product)}>Add to cart</Button> /* Botón para añadir al carrito */
        )}
      </Card.Body>
    </Card>
  );
}

export default Product; // Exporta el componente Product

