import express from 'express'; // Importa el módulo Express para crear el enrutador
import multer from 'multer'; // Importa el módulo multer para manejar la carga de archivos
import { v2 as cloudinary } from 'cloudinary'; // Importa el módulo cloudinary para almacenamiento en la nube
import streamifier from 'streamifier'; // Importa el módulo streamifier para convertir un buffer en un stream
import { isAdmin, isAuth } from '../utils.js'; // Importa funciones de autorización desde un archivo externo

const upload = multer(); // Inicializa multer para manejar la carga de archivos

const uploadRouter = express.Router(); // Crea un enrutador para la ruta de carga de archivos

uploadRouter.post( // Define una ruta POST para la carga de archivos
  '/', // La ruta a la que se enviarán las solicitudes de carga de archivos
  isAuth, // Middleware de autenticación
  isAdmin, // Middleware de autorización de administrador
  upload.single('file'), // Middleware de multer para manejar un solo archivo con el nombre 'file'
  async (req, res) => { // Función asíncrona que maneja la solicitud de carga de archivos
    cloudinary.config({ // Configuración de cloudinary
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Nombre de la nube de Cloudinary obtenido del entorno
      api_key: process.env.CLOUDINARY_API_KEY, // Clave de la API de Cloudinary obtenida del entorno
      api_secret: process.env.CLOUDINARY_API_SECRET, // Secreto de la API de Cloudinary obtenido del entorno
    });

    const streamUpload = (req) => { // Función para cargar el archivo a Cloudinary utilizando streams
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((error, result) => { // Utiliza un stream para cargar el archivo a Cloudinary
          if (result) {
            resolve(result); // Resuelve la promesa con el resultado si la carga es exitosa
          } else {
            reject(error); // Rechaza la promesa si hay un error en la carga
          }
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream); // Convierte el buffer del archivo a un stream y lo envía a Cloudinary
      });
    };

    const result = await streamUpload(req); // Ejecuta la función de carga de stream y espera el resultado
    res.send(result); // Envía la respuesta con el resultado de la carga del archivo a Cloudinary
  }
);

export default uploadRouter; // Exporta el enrutador de carga de archivos para su uso en otras partes de la aplicación
