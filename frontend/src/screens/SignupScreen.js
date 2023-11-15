import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import CheckoutSteps from '../components/CheckoutSteps';
export default function SignupScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    fullBox,
    userInfo,
    cart: { shippingAddress, paymentMethod },
  } = state;

  const [fullName, setFullName] = useState(shippingAddress.fullName || '');
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
  const [country, setCountry] = useState(shippingAddress.country || '');

  const [paymentMethodName, setPaymentMethod] = useState(paymentMethod || 'PayPal');

  useEffect(() => {
    if (!userInfo) {
      navigate('/signin?redirect=/shipping');
    }
  }, [userInfo, navigate]);

  const submitShippingHandler = (e) => {
    e.preventDefault();
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: { fullName, address, city, postalCode, country, location: shippingAddress.location },
    });
    localStorage.setItem('shippingAddress', JSON.stringify({ fullName, address, city, postalCode, country, location: shippingAddress.location }));
    // Aquí se redirige al usuario a la página de pago después de guardar la dirección de envío
    navigate('/payment');
  };

  const submitPaymentHandler = (e) => {
    e.preventDefault();
    ctxDispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethodName });
    localStorage.setItem('paymentMethod', paymentMethodName);
    navigate('/placeorder');
  };

  useEffect(() => {
    ctxDispatch({ type: 'SET_FULLBOX_OFF' });
  }, [ctxDispatch, fullBox]);

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  return (
    <div className="container">
    <Helmet>
      <title>Shipping and Payment</title>
    </Helmet>

    <CheckoutSteps step1 step2></CheckoutSteps>
    <div className="row">
      {/* Left side for ShippingAddressScreen */}
      <div className="col-md-6">
        <div className="small-container">
          <h1 className="my-3">Billing Details</h1>
          <Form onSubmit={(e) => {
              submitShippingHandler(e);
              submitPaymentHandler(e);
            }}>
            <Form.Group className="mb-3" controlId="fullName">
              <Form.Label>Full Name(*)</Form.Label>
              <Form.Control value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </Form.Group>
         <Form.Group className="mb-3" controlId="address">
           <Form.Label>Nit(optional)</Form.Label>
           <Form.Control
             value={address}
             onChange={(e) => setAddress(e.target.value)}
             required
           />
           </Form.Group>


         <Form.Group className="mb-3" controlId="address">
           <Form.Label>Address</Form.Label>
           <Form.Control
             value={address}
             onChange={(e) => setAddress(e.target.value)}
             required
           />
         </Form.Group>
         <Form.Group className="mb-3" controlId="city">
           <Form.Label>City</Form.Label>
           <Form.Control
             value={city}
             onChange={(e) => setCity(e.target.value)}
             required
           />
         </Form.Group>
         <Form.Group className="mb-3" controlId="postalCode">
           <Form.Label>Cell Phone</Form.Label>
           <Form.Control
             value={postalCode}
             onChange={(e) => setPostalCode(e.target.value)}
             required
           />
         </Form.Group>

              <div className="mb-3">
                <Button variant="primary" type="submit">Continue njkj </Button>
              </div>
            </Form>
          </div>
        </div>
        
        {/* Right side for PaymentMethodScreen */}
        <div className="col-md-6">
          <div className="small-container">
            <h1 className="my-3">Payment Method</h1>
            <Form onSubmit={submitPaymentHandler}>
              {/* Payment method radio buttons */}
              <div className="mb-3">
                <Form.Check
                  type="radio"
                  id="PayPal"
                  label="PayPal"
                  value="PayPal"
                  checked={paymentMethodName === 'PayPal'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <Form.Check
                  type="radio"
                  id="Stripe"
                  label="Stripe"
                  value="Stripe"
                  checked={paymentMethodName === 'Stripe'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
