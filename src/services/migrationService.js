/* 
Este archivo es el "Cerebro de la Operación".
Su trabajo es leer el archivo de Excel (CSV), 
entenderlo y preparar el terreno para que no se guarde información repetida.

*/

import { readFile } from 'fs/promises'; // Herramienta para leer archivos de la computadora.
import { resolve } from 'path';         // Ayuda a encontrar la "dirección" exacta del archivo.
import { parse } from 'csv-parse/sync'; // El "traductor" que convierte el texto del CSV en una lista de objetos.
import { pool } from '../config/postgres.js'; // // La conexión a Postgres que explicamos antes.
import { env } from '../config/env.js'; // // El objeto con la ruta del archivo CSV.
import { PatientHistory } from '../config/mongodb.js';

// LOCALIZAR Y LEER LOS ARCHIVOS CSV 
export async function migrate(clearBefore = false) {
    try{
        const csvPath = resolve(env.fileDataCsv); // "Busca en el mapa dónde está el archivo CSV". path arma la ruta para llegar a ese archivo 
        let fileContent = await readFile(csvPath, 'utf-8'); // "Abre el archivo y lee todo el texto que tiene dentro".
        
        // El Traductor (Parse):
        const rows = parse(fileContent, {
            columns: true, // "Usa la primera fila como nombres de las columnas (Nombre, Email, etc)".
            skip_empty_lines: true, // "Si hay un renglón vacío, ignóralo".
            trim: true, // "Quita los espacios en blanco sobrantes a los lados".
        });

        console.log(rows);
        console.log(`Read ${rows.length} rows from CSV file`);

        // El interruptor clearBefore (Limpieza)
        if(clearBefore){
            await pool.query('BEGIN'); // Empieza una transacción (Paquete de seguridad).
            await pool.query(`TRUNCATE TABLE patients, 
                treatments, insurances_providers, specialitys,
                doctors, appointments CASCADE`); 
             // TRUNCATE: "Borra absolutamente todo el contenido de estas tablas".
            // CASCADE: "Si borras un paciente, borra también sus citas automáticamente para que no queden huerfanas".
            await pool.query('COMMIT'); // Guarda el borrado.
            console.log(' previous data cleared successfully');

        }

        // ── 3. Insert uniques entities in PostgreSQL  La Estrategia contra los Duplicados (Set) herramienta de javascript
        const patientEmails  = new Set();
        const doctorEmails   = new Set();
        const treatmentCodes = new Set();
        const insuranceNames = new Set();
        const specialtyNames = new Set();




    


/* 
¿Qué es un Set?
Imagina que tienes una canasta mágica. Si intentas meter dos manzanas rojas idénticas, la canasta desaparece la segunda automáticamente. Solo permite elementos únicos.

    Ella crea estas "canastas" para que, mientras lee el archivo CSV, pueda ir guardando solo un correo de cada paciente, un nombre de cada especialidad, etc.



Migración: Es el proceso de mover datos de un lado (el archivo CSV) a otro (la base de datos Postgres).

Trashing/Truncate: Es vaciar los cajones antes de poner ropa nueva.

Rows: Son cada una de las filas que vienen en el archivo.
*/ 


console.log('Iniciando el proceso de guardado...');

// ──  EL CICLO MAESTRO ──
        // Recorremos la lista 'rows' (que son todas las filas de mi CSV) una por una.
        // Cada 'row' representa una línea del archivo de Excel.
        for (const row of rows) {

    // --- PASO A: ESPECIALIDADES ---
            // Revisamos si el nombre de la especialidad (ej: 'Pediatría') ya está en nuestro saquito.
            if (!specialtyNames.has(row.specialty)) { // si no(!) esta guardada la especialidad guardala 
                await pool.query( // pool Es como un mensajero que lleva consultas a la base de datos y trae respuesta  .query() Ejecuta esta consulta SQL en la base de datos"
                    'INSERT INTO specialitys (name) VALUES ($1) ON CONFLICT DO NOTHING',
                    [row.specialty]
                );
                // La guardamos en el saquito para que, si otra fila tiene la misma especialidad, no intente insertarla de nuevo.
                specialtyNames.add(row.specialty);
            }


    // --- PASO B: DOCTORES ---
            // Verificamos si ya guardamos a este doctor usando su email (que es único).
            if (!doctorEmails.has(row.doctor_email)) {
                // IMPORTANTE: Como la tabla de doctores pide un 'speciality_id' (un número), 
                // primero le preguntamos a Postgres: "¿Qué ID le pusiste a la especialidad X?".
                const specRes = await pool.query('SELECT id FROM specialitys WHERE name = $1', [row.specialty]);
                const specId = specRes.rows[0].id; // Guardamos ese número en 'specId'.

                await pool.query( // pool es la conexion a la base de datos .query es una consulta "Espera a que la base de datos termine la consulta antes de seguir"
                    'INSERT INTO doctors (name, email, speciality_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                    [row.doctor_name, row.doctor_email, specId]
                );
                doctorEmails.add(row.doctor_email); // Marcamos al doctor como "ya guardado".
            }


    // --- PASO C: PACIENTES ---
            if (!patientEmails.has(row.patient_email)) { // si no existe (!) entonces  haz algo (.has) crear 
                await pool.query( // espera que la base de datos (pool) termine la consulta (.query)
                    'INSERT INTO patients (name, email, phone, address) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
                    [row.patient_name, row.patient_email, row.patient_phone, row.patient_address]
                );
                patientEmails.add(row.patient_email);
            }

    // --- PASO D: TRATAMIENTOS ---
            if (!treatmentCodes.has(row.treatment_code)) {
                await pool.query( // Espera a que pool termine de hacer .query()" espera que la conexion a la base de datos termine la consulta 
                    'INSERT INTO treatments (code, description, cost) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                    [row.treatment_code, row.treatment_description, parseInt(row.treatment_cost)] // parceInt es para pasar a numero entero 
                );
                treatmentCodes.add(row.treatment_code);
            }
    
    // --- PASO E: SEGUROS (PROVIDERS) ---
            if (!insuranceNames.has(row.insurance_provider)) {
                await pool.query(
                    'INSERT INTO insurances_providers (name, coverage_percentage) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [row.insurance_provider, row.coverage_percentage]
                );
                insuranceNames.add(row.insurance_provider);
            }

    // --- PASO F: LA CITA (APPOINTMENTS) ---
            // Esta es la parte final. La cita une a todos los anteriores. 
            // Necesitamos los IDs que Postgres generó automáticamente para el paciente y el seguro.
            
            // 1. Buscamos el ID del paciente usando su email
            const pRes = await pool.query('SELECT id FROM patients WHERE email = $1', [row.patient_email]);
            const pId = pRes.rows[0].id;
            //pRes → respuesta completa de la base de datos
            //pRes.rows → las filas que encontró
            // pRes.rows[0] → la primera fila
            //pId → el id del paciente
            
            

            // 2. Buscamos el ID del doctor usando su email
            const dRes = await pool.query('SELECT id FROM doctors WHERE email = $1', [row.doctor_email]);
            const dId = dRes.rows[0].id;

            // 3. Buscamos el ID del seguro usando su nombre
            const iRes = await pool.query('SELECT id FROM insurances_providers WHERE name = $1', [row.insurance_provider]);
            const iId = iRes.rows[0].id;

            // Ahora sí, insertamos la cita con todos los IDs correctos.
            await pool.query(
                `INSERT INTO appointments (id, date, patient_id, doctor_id, treatment_code, insurance_provider_id, amount_paid) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,  // marcadores de posicion $1 $2 las posiciones empiezan desde el uno 
                [
                    row.appointment_id, 
                    row.appointment_date, 
                    pId, 
                    dId, 
                    row.treatment_code, 
                    iId, 
                    row.amount_paid
                ]
            );
        }

        console.log(' ¡Proceso terminado! Todos los datos únicos del CSV están ahora en Postgres.');

    




/* La funcion de este bloque de codigo fue transformar un archivo de texto desordenado (csv) a una base de datos organizada y segura (postgreSQL)

Limpieza Previa: Si le dijiste true, barrió todo el hospital para que no hubiera datos viejos mezclados.

Traducción: Leyó el CSV y lo convirtió en una lista de "objetos" que Node.js puede entender.

Filtrado Inteligente: Usó los Sets (saquitos) para asegurarse de que si el "Paciente Juan" aparecía 10 veces en el archivo, solo se creara una vez en la base de datos.

Relación de Datos: No solo guardó nombres; buscó los IDs correspondientes para "amarrar" cada cita con su doctor y su paciente correcto.

Seguridad: Usó los $1, $2 para que ningún dato extraño rompiera la base de datos.






¿Cómo pruebo si la migración funcionó?

Una vez que corras el código con node src/server.js, tienes tres formas de verificar el éxito:
Migración finalizada exitosamente.






Usando la herramienta de base de datos  DBeaver

Abro el programa para ver la base de datos y ejecuta esta consulta (Query):
SQL

SELECT count(*) FROM appointments; */



// Despues de la migracion y hacer todo esto voy   a crear la migracion de mongodb

        console.log("-----------------------------------------");
        console.log("INICIANDO MIGRACION A MONGO");
        console.log("-----------------------------------------");


// Creamos un mapa para juntar las citas por cada paciente (Email único)
const patientMap = new Map();

rows.forEach(row => {
    if (!patientMap.has(row.patient_email)) {
        patientMap.set(row.patient_email, {
            patientName: row.patient_name,
            patientEmail: row.patient_email,
            appointments: []
        });
    }
    
    // Metemos la cita dentro del paciente correspondiente
    patientMap.get(row.patient_email).appointments.push({
        appointmentId: row.appointment_id,
        date: row.appointment_date,
        doctorName: row.doctor_name,
        doctorEmail: row.doctor_email,
        specialty: row.specialty,
        treatmentCode: row.treatment_code,
        treatmenDescription: row.treatment_description,
        treatmentCost: parseFloat(row.treatment_cost),
        insuranceProvider: row.insurance_provider,
        coveragePercentage: parseFloat(row.coverage_percentage),
        amountPaid: parseFloat(row.amount_paid)
    });
});

// 2. Guardamos en MongoDB
console.log("Enviando datos a MongoDB...");
await PatientHistory.deleteMany({}); // Limpia para no duplicar
await PatientHistory.insertMany(Array.from(patientMap.values()));

console.log(" ¡Sincronización con MongoDB completada!");

}catch(error){
        console.error("Error migrating data:", error);
        throw error;
    }
} //ESTA LLAVE cierra la función 'migrate'