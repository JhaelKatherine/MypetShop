// Importaciones de módulos
import jwt from 'jsonwebtoken'; // Módulo para crear y verificar tokens JWT
import mg from 'mailgun-js'; // Módulo para enviar correos electrónicos a través de Mailgun

// Función para obtener la URL base de la aplicación
export const baseUrl = () =>
  process.env.BASE_URL
    ? process.env.BASE_URL
    : process.env.NODE_ENV !== 'production'
    ? 'http://localhost:3000'
    : 'https://yourdomain.com';

// Función para generar un token JWT basado en la información del usuario
export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d', // Expira en 30 días
    }
  );
};

// Middleware para verificar si el usuario está autenticado mediante un token JWT
export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Extrae el token de autorización (Bearer XXXXXX)
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Invalid Token' }); // Si el token es inválido, devuelve un mensaje de error
      } else {
        req.user = decode; // Almacena la información decodificada del usuario en el objeto de solicitud (req)
        next(); // Continúa con el siguiente middleware
      }
    });
  } else {
    res.status(401).send({ message: 'No Token' }); // Si no se proporciona un token, devuelve un mensaje de error
  }
};

// Middleware para verificar si el usuario es un administrador
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next(); // Si el usuario es un administrador, continúa con el siguiente middleware
  } else {
    res.status(401).send({ message: 'Invalid Admin Token' }); // Si el usuario no es un administrador, devuelve un mensaje de error
  }
};

// Función para configurar Mailgun con las credenciales proporcionadas en las variables de entorno
export const mailgun = () =>
  mg({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMIAN,
  });

// Plantilla de correo electrónico para confirmación de orden
export const payOrderEmailTemplate = (order) => {
  // Crea una plantilla HTML con detalles de la orden
  return `
    <h1>Thanks for shopping with us</h1>
    <!-- ... (detalles de la orden) ... -->
    `;
};
