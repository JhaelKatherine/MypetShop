import express from 'express'; // Importa el framework Express para crear el enrutador
import Product from '../models/productModel.js'; // Importa el modelo de Productos desde un archivo externo
import data from '../data.js'; // Importa datos de un archivo externo
import User from '../models/userModel.js'; // Importa el modelo de Usuarios desde un archivo externo

const seedRouter = express.Router(); // Crea un enrutador para realizar tareas de inicialización o "seed"

seedRouter.get('/', async (req, res) => { // Define una ruta GET para la inicialización de datos
  await Product.remove({}); // Elimina todos los productos existentes en la base de datos
  const createdProducts = await Product.insertMany(data.products); // Inserta nuevos productos utilizando los datos importados
  await User.remove({}); // Elimina todos los usuarios existentes en la base de datos
  const createdUsers = await User.insertMany(data.users); // Inserta nuevos usuarios utilizando los datos importados
  res.send({ createdProducts, createdUsers }); // Envía como respuesta los productos y usuarios creados
});

export default seedRouter; // Exporta el enrutador de inicialización de datos
