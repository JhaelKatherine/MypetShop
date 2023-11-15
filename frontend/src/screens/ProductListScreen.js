// Importación de módulos y componentes necesarios
import React, { useContext, useEffect, useReducer } from 'react'; // Importa módulos y hooks de React
import axios from 'axios'; // Importa Axios para hacer solicitudes HTTP
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Importa utilidades de React Router
import Row from 'react-bootstrap/Row'; // Importa el componente Row de Bootstrap de React
import Col from 'react-bootstrap/Col'; // Importa el componente Col de Bootstrap de React
import Button from 'react-bootstrap/Button'; // Importa el componente Button de Bootstrap de React
import { toast } from 'react-toastify'; // Importa la librería para notificaciones de toast
import { Store } from '../Store'; // Importa el contexto Store
import LoadingBox from '../components/LoadingBox'; // Importa el componente LoadingBox
import MessageBox from '../components/MessageBox'; // Importa el componente MessageBox
import { getError } from '../utils'; // Importa una función utilitaria para obtener errores

// Reductor que maneja los cambios de estado
const reducer = (state, action) => {
  // Switch para determinar la acción y actualizar el estado correspondiente
};

// Componente principal para la pantalla de lista de productos
export default function ProductListScreen() {
  // Uso del useReducer para manejar el estado y las acciones
  const [
    {
      loading,
      error,
      products,
      pages,
      loadingCreate,
      loadingDelete,
      successDelete,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  // Hooks para navegación y obtención de la página actual
  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const page = sp.get('page') || 1;

  // Obtención de información del usuario desde el contexto
  const { state } = useContext(Store);
  const { userInfo } = state;

  // Efecto para cargar los productos al montar o al eliminar uno exitosamente
  useEffect(() => {
    // Función asíncrona para obtener los productos
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/products/admin?page=${page} `, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        // Actualiza el estado con los productos obtenidos
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        // Manejo de errores en la obtención de productos
      }
    };

    // Si se eliminó un producto exitosamente, resetea el estado de eliminación
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData(); // Obtén los productos
    }
  }, [page, userInfo, successDelete]);

  // Función para crear un nuevo producto
  const createHandler = async () => {
    // Confirma la creación de un producto
    if (window.confirm('Are you sure to create?')) {
      try {
        dispatch({ type: 'CREATE_REQUEST' });
        const { data } = await axios.post(
          '/api/products',
          {},
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        toast.success('product created successfully');
        dispatch({ type: 'CREATE_SUCCESS' });
        navigate(`/admin/product/${data.product._id}`);
      } catch (err) {
        toast.error(getError(error));
        dispatch({
          type: 'CREATE_FAIL',
        });
      }
    }
  };

  // Función para eliminar un producto existente
  const deleteHandler = async (product) => {
    // Confirma la eliminación de un producto
    if (window.confirm('Are you sure to delete?')) {
      try {
        await axios.delete(`/api/products/${product._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('product deleted successfully');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        toast.error(getError(error));
        dispatch({
          type: 'DELETE_FAIL',
        });
      }
    }
  };
  return (
    <div>
      <Row>
        <Col>
          <h1>Products</h1>
        </Col>
        <Col className="col text-end">
          <div>
            <Button type="button" onClick={createHandler}>
              Create Product
            </Button>
          </div>
        </Col>
      </Row>

      {loadingCreate && <LoadingBox></LoadingBox>}
      {loadingDelete && <LoadingBox></LoadingBox>}

      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>BRAND</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => navigate(`/admin/product/${product._id}`)}
                    >
                      Edit
                    </Button>
                    &nbsp;
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => deleteHandler(product)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            {[...Array(pages).keys()].map((x) => (
              <Link
                className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
                key={x + 1}
                to={`/admin/products?page=${x + 1}`}
              >
                {x + 1}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
