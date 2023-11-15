import React, { useContext, useEffect, useState } from 'react'; // Importa elementos necesarios de React
import { Helmet } from 'react-helmet-async'; // Para manejar el título de la página asincrónicamente
import { useNavigate } from 'react-router-dom'; // Para la navegación
import Form from 'react-bootstrap/Form'; // Componente de formulario de Bootstrap
import Button from 'react-bootstrap/Button'; // Componente de botón de Bootstrap
import CheckoutSteps from '../components/CheckoutSteps'; // Componente de pasos de pago
import { Store } from '../Store'; // Contexto global de la aplicación

// Componente para seleccionar el método de pago
export default function PaymentMethodScreen() {
  const navigate = useNavigate(); // Función de navegación

  // Obtiene el estado global de la aplicación y su dispatch
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { shippingAddress, paymentMethod },
  } = state;

  // Estado local para almacenar el método de pago seleccionado
  const [paymentMethodName, setPaymentMethod] = useState(
    paymentMethod || 'PayPal' // Establece PayPal como método de pago predeterminado si no hay uno seleccionado
  );

  // Redirige a la pantalla de envío si no se ha proporcionado una dirección de envío
  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  // Maneja el envío del formulario y guarda el método de pago seleccionado en el estado global
  const submitHandler = (e) => {
    e.preventDefault();
    ctxDispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethodName }); // Guarda el método de pago en el estado global
    localStorage.setItem('paymentMethod', paymentMethodName); // Almacena el método de pago en el almacenamiento local del navegador
    navigate('/placeorder'); // Redirige al usuario a la pantalla de realizar pedido
  };

  return (
    <div>
      <CheckoutSteps step1 step2 step3></CheckoutSteps> {/* Indicador de pasos de pago */}
      <div className="container small-container">
        <Helmet>
          <title>Payment Method</title>
        </Helmet>
        <h1 className="my-3">Payment Method</h1>
        {/* Formulario para seleccionar el método de pago */}
        <Form onSubmit={submitHandler}>
          <div className="mb-3">
            {/* Selección de PayPal */}
            <Form.Check
              type="radio"
              id="PayPal"
              label="PayPal"
              value="PayPal"
              checked={paymentMethodName === 'PayPal'} // Marca como seleccionado si el método de pago es PayPal
              onChange={(e) => setPaymentMethod(e.target.value)} // Actualiza el estado al seleccionar PayPal
            />
          </div>
          <div className="mb-3">
            {/* Selección de Stripe */}
            <Form.Check
              type="radio"
              id="Stripe"
              label="Stripe"
              value="Stripe"
              checked={paymentMethodName === 'Stripe'} // Marca como seleccionado si el método de pago es Stripe
              onChange={(e) => setPaymentMethod(e.target.value)} // Actualiza el estado al seleccionar Stripe
            />
          </div>
          <div className="mb-3">
            {/* Botón para continuar con el método de pago seleccionado */}
            <Button type="submit">Continue</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
