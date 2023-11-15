import React, { useContext, useEffect, useReducer } from 'react';
import Chart from 'react-google-charts';
import axios from 'axios';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

// Reducer para manejar el estado del componente
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        summary: action.payload,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Componente DashboardScreen
export default function DashboardScreen() {
  // Usa useReducer para manejar el estado del componente
  const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  // Obtiene información del estado global del contexto
  const { state } = useContext(Store);
  const { userInfo } = state;

  // Función para realizar la solicitud de resumen de órdenes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Realiza una solicitud HTTP para obtener el resumen de órdenes
        const { data } = await axios.get('/api/orders/summary', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        // Actualiza el estado con los datos recibidos
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        // En caso de error, actualiza el estado con el mensaje de error
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    // Llama a la función fetchData al cargar el componente o cuando cambia userInfo
    fetchData();
  }, [userInfo]);

  // Renderiza el contenido del componente
  return (
    <div>
      {/* Encabezado */}
      <h1>Dashboard</h1>

      {/* Condición para mostrar elementos de carga, error o datos */}
      {loading ? (
        <LoadingBox /> // Muestra un componente de carga si está cargando
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox> // Muestra un mensaje de error si hay un error
      ) : (
        // Muestra el resumen si no hay error y no está cargando
        <>
          {/* Sección de resumen */}
          <Row>
            {/* Estadísticas de usuarios */}
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    {summary.users && summary.users[0]
                      ? summary.users[0].numUsers
                      : 0}
                  </Card.Title>
                  <Card.Text> Users</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            {/* Estadísticas de órdenes */}
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    {summary.orders && summary.users[0]
                      ? summary.orders[0].numOrders
                      : 0}
                  </Card.Title>
                  <Card.Text> Orders</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            {/* Estadísticas de ventas */}
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    $
                    {summary.orders && summary.users[0]
                      ? summary.orders[0].totalSales.toFixed(2)
                      : 0}
                  </Card.Title>
                  <Card.Text> Orders</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Gráfico de ventas diarias */}
          <div className="my-3">
            <h2>Sales</h2>
            {summary.dailyOrders.length === 0 ? (
              <MessageBox>No Sale</MessageBox>
            ) : (
              <Chart
                width="100%"
                height="400px"
                chartType="AreaChart"
                loader={<div>Loading Chart...</div>}
                data={[
                  ['Date', 'Sales'],
                  ...summary.dailyOrders.map((x) => [x._id, x.sales]),
                ]}
              ></Chart>
            )}
          </div>

          {/* Gráfico de categorías */}
          <div className="my-3">
            <h2>Categories</h2>
            {summary.productCategories.length === 0 ? (
              <MessageBox>No Category</MessageBox>
            ) : (
              <Chart
                width="100%"
                height="400px"
                chartType="PieChart"
                loader={<div>Loading Chart...</div>}
                data={[
                  ['Category', 'Products'],
                  ...summary.productCategories.map((x) => [x._id, x.count]),
                ]}
              ></Chart>
            )}
          </div>
        </>
      )}
    </div>
  );
}