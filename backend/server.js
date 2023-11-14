// Importación de los módulos y configuración inicial
import express from "express"; // Importa Express
import path from "path"; // Proporciona utilidades para trabajar con rutas de archivos y directorios
import mongoose from "mongoose"; // ORM para trabajar con MongoDB
import dotenv from "dotenv"; // Carga variables de entorno desde un archivo .env
import seedRouter from "./routes/seedRoutes.js"; // Importa el enrutador para las rutas de inicialización
import productRouter from "./routes/productRoutes.js"; // Importa el enrutador para las rutas de productos
import userRouter from "./routes/userRoutes.js"; // Importa el enrutador para las rutas de usuarios
import orderRouter from "./routes/orderRoutes.js"; // Importa el enrutador para las rutas de órdenes
import uploadRouter from "./routes/uploadRoutes.js"; // Importa el enrutador para las rutas de subida de archivos

dotenv.config(); // Configura las variables de entorno desde un archivo .env

// Conexión a la base de datos MongoDB usando la URI de conexión proporcionada en las variables de entorno
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err.message);
  });

const app = express(); // Crea una aplicación Express

app.use(express.json()); // Middleware para manejar datos en formato JSON
app.use(express.urlencoded({ extended: true })); // Middleware para analizar datos codificados en URL

// Rutas para obtener las claves de PayPal y Google API (si se han definido en las variables de entorno)
app.get("/api/keys/paypal", (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || "sb"); // Retorna la clave de cliente de PayPal
});
app.get("/api/keys/google", (req, res) => {
  res.send({ key: process.env.GOOGLE_API_KEY || "" }); // Retorna la clave de API de Google
});

// Asignación de rutas a los respectivos enrutadores
app.use("/api/upload", uploadRouter); // Enrutador para la carga de archivos
app.use("/api/seed", seedRouter); // Enrutador para las rutas de inicialización
app.use("/api/products", productRouter); // Enrutador para las rutas de productos
app.use("/api/users", userRouter); // Enrutador para las rutas de usuarios
app.use("/api/orders", orderRouter); // Enrutador para las rutas de órdenes

const __dirname = path.resolve(); // Obtiene el directorio actual
app.use(express.static(path.join(__dirname, "/frontend/build"))); // Establece la carpeta estática para los archivos de frontend
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/frontend/build/index.html")) // Envia el archivo HTML principal para la aplicación frontend
);

// Manejador de errores para cualquier error interno del servidor
app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message }); // Retorna un mensaje de error con el código de estado 500
});

const port = process.env.PORT || 4000; // Define el puerto del servidor
app.listen(port, () => {
  console.log(`serve at http://localhost:${port}`); // Inicia el servidor y muestra el puerto en el que se está ejecutando
});
