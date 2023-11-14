import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import { isAuth, isAdmin } from '../utils.js';

const productRouter = express.Router(); // Crea un enrutador para productos

productRouter.get('/', async (req, res) => {
  const products = await Product.find(); // Obtiene todos los productos
  res.send(products); // Envía los productos como respuesta
});

// Crea un nuevo producto
productRouter.post(
  '/',
  isAuth, // Middleware de autenticación
  isAdmin, // Middleware de autorización de administrador
  expressAsyncHandler(async (req, res) => {
    const newProduct = new Product({ /* Datos del nuevo producto */ });
    const product = await newProduct.save(); // Guarda el nuevo producto en la base de datos
    res.send({ message: 'Product Created', product });
  })
);

// Actualiza un producto existente
productRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    // Obtiene el ID del producto de los parámetros de la solicitud
    const productId = req.params.id;
    const product = await Product.findById(productId); // Encuentra el producto por su ID
    if (product) {
      // Actualiza los campos del producto con los datos de la solicitud
      await product.save(); // Guarda los cambios del producto en la base de datos
      res.send({ message: 'Product Updated' });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

// Elimina un producto
productRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id); // Encuentra el producto por su ID
    if (product) {
      await product.remove(); // Elimina el producto de la base de datos
      res.send({ message: 'Product Deleted' });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

// Agrega una reseña a un producto
productRouter.post(
  '/:id/reviews',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    // Lógica para agregar una reseña a un producto existente
  })
);

// Obtiene productos con filtros y paginación para la sección de administración
productRouter.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    // Lógica para obtener productos con filtros y paginación
  })
);

// Realiza una búsqueda de productos con filtros
productRouter.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    // Lógica para realizar una búsqueda de productos con filtros
  })
);

// Obtiene las categorías disponibles de productos
productRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    // Lógica para obtener las categorías disponibles de productos
  })
);

// Obtiene un producto por su slug (URL amigable)
productRouter.get('/slug/:slug', async (req, res) => {
  // Lógica para obtener un producto por su slug
});

// Obtiene un producto por su ID
productRouter.get('/:id', async (req, res) => {
  // Lógica para obtener un producto por su ID
});

export default productRouter; // Exporta el enrutador de productos

