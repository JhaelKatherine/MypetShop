import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { isAuth, isAdmin, mailgun, payOrderEmailTemplate } from '../utils.js';

const orderRouter = express.Router(); // Creación del enrutador para órdenes

// Obtener todas las órdenes (requiere autenticación y privilegios de administrador)
orderRouter.get(
  '/',
  isAuth, // Middleware de autenticación
  isAdmin, // Middleware de autorización de administrador
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'name'); // Buscar órdenes y obtener el nombre del usuario asociado
    res.send(orders);
  })
);

// Crear una nueva orden (requiere autenticación)
orderRouter.post(
  '/',
  isAuth, // Middleware de autenticación
  expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
      // Crear una nueva orden basada en los datos proporcionados en la solicitud
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })), // Asignar IDs de productos a los items de la orden
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id, // Asignar ID del usuario autenticado como creador de la orden
    });

    const order = await newOrder.save(); // Guardar la nueva orden en la base de datos
    res.status(201).send({ message: 'New Order Created', order });
  })
);

// Obtener un resumen de estadísticas de órdenes, usuarios y productos
orderRouter.get(
  '/summary',
  isAuth, // Middleware de autenticación
  isAdmin, // Middleware de autorización de administrador
  expressAsyncHandler(async (req, res) => {
    // Consultas de agregación para obtener resúmenes estadísticos
    const orders = await Order.aggregate([
      { $group: { _id: null, numOrders: { $sum: 1 }, totalSales: { $sum: '$totalPrice' } } },
    ]);
    const users = await User.aggregate([{ $group: { _id: null, numUsers: { $sum: 1 } } }]);
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const productCategories = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);

    // Enviar resumen estadístico como respuesta a la solicitud
    res.send({ users, orders, dailyOrders, productCategories });
  })
);

// Obtener todas las órdenes del usuario actual (requiere autenticación)
orderRouter.get(
  '/mine',
  isAuth, // Middleware de autenticación
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }); // Buscar órdenes del usuario autenticado
    res.send(orders);
  })
);

// Obtener detalles de una orden específica (requiere autenticación)
orderRouter.get(
  '/:id',
  isAuth, // Middleware de autenticación
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id); // Buscar la orden por su ID
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

// Marcar una orden como entregada (requiere autenticación y privilegios de administrador)
orderRouter.put(
  '/:id/deliver',
  isAuth, // Middleware de autenticación
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id); // Buscar la orden por su ID
    if (order) {
      order.isDelivered = true; // Actualizar el estado de entrega y la fecha de entrega
      order.deliveredAt = Date.now();
      await order.save(); // Guardar los cambios en la orden
      res.send({ message: 'Order Delivered' });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

// Pagar una orden (requiere autenticación)
orderRouter.put(
  '/:id/pay',
  isAuth, // Middleware de autenticación
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'email name'); // Buscar la orden y obtener datos del usuario asociado
    if (order) {
      // Actualizar el estado de pago y detalles del pago
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save(); // Guardar los cambios en la orden

      // Enviar correo electrónico de confirmación de pago
      mailgun().messages().send(
        {
          from: 'Amazona <amazona@mg.yourdomain.com>',
          to: `${order.user.name} <${order.user.email}>`,
          subject: `New order ${order._id}`,
          html: payOrderEmailTemplate(order),
        },
        (error, body) => {
          if (error) {
            console.log(error);
          } else {
            console.log(body);
          }
        }
      );

      res.send({ message: 'Order Paid', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

// Eliminar una orden (requiere autenticación y privilegios de administrador)
orderRouter.delete(
  '/:id',
  isAuth, // Middleware de autenticación
  isAdmin, // Middleware de autorización de administrador
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id); // Buscar la orden por su ID
    if (order) {
      await order.remove(); // Eliminar la orden de la base de datos
      res.send({ message: 'Order Deleted' });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

export default orderRouter; // Exportar el enrutador de órdenes
