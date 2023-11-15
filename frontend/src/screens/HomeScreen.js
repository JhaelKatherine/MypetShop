// Importaciones de módulos y componentes
import { useEffect, useReducer } from "react";
import axios from "axios";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Product from "../components/Product";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";

// Reductor para gestionar el estado de los productos
const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, products: action.payload, loading: false };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Componente HomeScreen
function HomeScreen() {
  // Uso del reductor para gestionar el estado de los productos
  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: "",
  });

  // Efecto para obtener los productos desde la API
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" }); // Indica que se está realizando la solicitud

      try {
        // Realiza la solicitud a la API para obtener los productos
        const result = await axios.get("/api/products");
        // Al obtener los productos con éxito, actualiza el estado
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });
      } catch (err) {
        // Si hay un error al obtener los productos, actualiza el estado con el mensaje de error
        dispatch({ type: "FETCH_FAIL", payload: err.message });
      }
    };

    fetchData(); // Ejecuta la función fetchData al cargar el componente (equivalente a componentDidMount)

    // El arreglo vacío como segundo argumento indica que el efecto se ejecuta solo al montar el componente
  }, []);

  // Renderiza el contenido del componente
  return (
    <div>
      <Helmet>
        <title>Amazona</title>
      </Helmet>
      <h1>Featured Products</h1>
      <div className="products">
        {loading ? ( // Muestra el componente de carga mientras se están obteniendo los productos
          <LoadingBox />
        ) : error ? ( // Muestra un mensaje de error si ocurre un problema al obtener los productos
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Row>
            {products.map((product) => (
              // Mapea los productos obtenidos y muestra cada uno de ellos mediante el componente Product
              <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
                <Product product={product}></Product>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}

export default HomeScreen;

