import React from 'react'; // Importa la librería React
import Row from 'react-bootstrap/Row'; // Importa el componente de fila de react-bootstrap
import Col from 'react-bootstrap/Col'; // Importa el componente de columna de react-bootstrap

export default function CheckoutSteps(props) { // Define un componente funcional llamado CheckoutSteps que recibe props
  return (
    <Row className="checkout-steps"> {/* Crea una fila con una clase CSS checkout-steps */}
      <Col className={props.step1 ? 'active' : ''}>Sign-In</Col> {/* Crea una columna para la primera etapa del checkout */}
      <Col className={props.step2 ? 'active' : ''}>Shipping</Col> {/* Crea una columna para la segunda etapa del checkout */}
      <Col className={props.step3 ? 'active' : ''}>Payment</Col> {/* Crea una columna para la tercera etapa del checkout */}
      <Col className={props.step4 ? 'active' : ''}>Place Order</Col> {/* Crea una columna para la cuarta etapa del checkout */}
    </Row>
  );
}
