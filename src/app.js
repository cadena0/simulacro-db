// El recepcionista. Solo configura Express y las rutas. 
// No se ensucia las manos con bases de datos directamente. 
// para eso tengo cada archivo de cada base de datos 

import express from 'express';
import { env } from './config/env.js'; // Importamos nuestro validador de variables

const app = express();

// --- CONFIGURACIONES (Middlewares) ---

// Permite que la app entienda archivos JSON (vital para la API)
app.use(express.json());

// Una ruta de prueba para saber que el servidor está vivo
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Servidor de SaludPlus funcionando' });
});

// --- EXPORTACIÓN ---
// No ejecutamos el servidor aquí, lo exportamos para que server.js o services.js lo inicien
export default app;