import pg from 'pg'; // Importa la librería para conectar con PostgreSQL.
import { env } from "./env.js"; // Importa el archivo que se creo anteriormente que contiene la direccion y contraseña de la base de datos 

const { Pool } = pg; // mejora el rendimiento de las consultas

export const pool = new Pool({
    connectionString: env.postgresUri  // Crea la "piscina" de conexiones usando una URL única (URI).
});

export async function createTables(){
    const client = await pool.connect(); // Pide prestada una conexión al Pool para empezar a trabajar.
    try{
        await client.query('BEGIN'); // Inicia una TRANSACCIÓN. Si algo falla a partir de aquí, nada se guarda.

        // ── patients ──
        await client.query(`CREATE TABLE IF NOT EXISTS patients (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            email VARCHAR(50) NOT NULL UNIQUE,
            phone VARCHAR(20) NOT NULL,
            address VARCHAR(100) NOT NULL)`);

        // ── treatments ──
        await client.query(`CREATE TABLE IF NOT EXISTS treatments (
            code VARCHAR(50) PRIMARY KEY,
            description TEXT NOT NULL,
            cost INTEGER NOT NULL)`);
        



        // ── insurances_providers ──
        await client.query(`CREATE TABLE IF NOT EXISTS insurances_providers (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE,
            coverage_percentage INTEGER NOT NULL)`);

        
        // ── specialitys ──
        await client.query(`CREATE TABLE IF NOT EXISTS specialitys (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE)`);
        
        // ── doctors ──
        await client.query(`CREATE TABLE IF NOT EXISTS doctors (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            email VARCHAR(50) NOT NULL UNIQUE,
            speciality_id INTEGER NOT NULL REFERENCES specialitys(id))`);

        // ── appointments ── 
        await client.query(`CREATE TABLE IF NOT EXISTS appointments (
            id VARCHAR(50) PRIMARY KEY,
            date DATE NOT NULL,
            patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
            doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
            treatment_code VARCHAR(50) NOT NULL REFERENCES treatments(code) ON DELETE RESTRICT,
            insurance_provider_id INTEGER NOT NULL REFERENCES insurances_providers(id) ON DELETE RESTRICT,
            amount_paid NUMERIC(10,2) NOT NULL)`);

        // ── Indexes for frequent queries ──
        await client.query(`CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id)`); // Esto no crea datos nuevos, crea un mapa interno. Cuando busques "todas las citas del paciente X", Postgres irá directo al índice en lugar de leer toda la tabla. Es como el índice alfabético de un libro.
        await client.query(`CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_appointments_treatment ON appointments(treatment_code)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_appointments_insurance ON appointments(insurance_provider_id)`);
        await client.query('COMMIT');   // Si llegamos aquí sin errores, se graban todos los cambios de un solo golpe.

        console.log('Tables created successfully');

    } catch (error) {
        // Esto nos dirá exactamente en qué línea y por qué fallan las tablas
        console.error("--- ERROR CRÍTICO CREANDO TABLAS ---");
        console.error("Mensaje:", error.message);
        console.error("Detalle:", error.detail);
        console.error("------------------------------------");
        
        await client.query("ROLLBACK");
        throw error; 
    } finally {
        client.release(); //liberar la conexión // Muy importante: Devuelve la conexión al Pool para que otros puedan usarla.
    }
}