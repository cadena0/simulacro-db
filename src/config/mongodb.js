import mongoose from "mongoose"; // Es la librería que usamos para comunicarnos con MongoDB de forma organizada.
import { env } from "./env.js"; // Importa las variables de entorno (como la URL de la base de datos) que tienes en tu archivo de configuración.

// ── Schema of an Appointment con esta estructura si no cumple la estructura
//  lo que sea que vaya a guardar no deberia dejar guardarlo 
const appointmentSchema = new mongoose.Schema({
    appointmentId: {type: String, required: true},
    date: {type: Date, required: true},
    doctorName: {type: String, required: true}, 
    doctorEmail: {type: String, required: true},
    specialty: {type: String, required: true},
    treatmentCode: {type: String},
    treatmenDescription: {type: String},
    treatmentCost: {type: Number, required: true},
    insuranceProvider: {type: String, required: true},
    coveragePercentage: {type: Number, required: true},
    amountPaid: {type: Number, required: true}
    
}, {_id: false}); // para que no cree el id automatico 
// ── Schema of a Patient History
const patientHistorySchema = new mongoose.Schema({
    patientEmail: {type: String, 
    required: true, 
    unique: true,  // No permite que existan dos historiales con el mismo correo
    match: /^\S+@\S+\.\S+$/}, // dice que cuabdo inicia que se pueden repetir y encierto punto va a tener un @ y luego un punto es para el correo
    patientName: {type: String, required: true},
    appointments: {
    type: [appointmentSchema], // Aquí dice que este campo es una LISTA ([ ]) de citas
    default: []                 // Si creamos un paciente nuevo, empieza con la lista vacía
    }
}, {timestamps: true}); // Mongo creará automáticamente dos campos: createdAt (cuándo se creó el historial) y updatedAt (cuándo fue la última cita).

// ── CREACIÓN DEL MODELO
// "PatientHistory" será el nombre de la colección en la base de datos (se verá como 'patienthistories').
export const PatientHistory = 
    mongoose.model("PatientHistory", 
        patientHistorySchema);

// ── FUNCIÓN DE CONEXIÓN
// Función asíncrona para establecer el puente entre Node.js y el servidor de MongoDB.
export async function connectMongo(){
    try{ // Intenta conectar usando la URL definida en las variables de entorno (.env)
        await mongoose.connect(env.databaseMongoUrl);
        console.log("Connected to MongoDB");
    } catch (error) { // Si hay un error (ej: Mongo está apagado), lo captura y muestra el detalle
        console.error("Error connecting to MongoDB:", error);
        throw error; // Lanza el error para que el servidor sepa que no pudo arrancar bien
    }
    
}
