// 1. IMPORTACIONES
import { createTables } from "./config/postgres.js";
import { connectMongo } from "./config/mongodb.js"; // <--- CAMBIO: Debes importar la conexión de Mongo
import { migrate } from "./services/migrationService.js";


/**
 * 2. CAMBIO PRINCIPAL: Envolvemos todo en una función 'async'
 * ¿Por qué? Porque intentabas llamar a startApp() al final, pero no habías
 * agrupado tu código bajo ese nombre. Además, necesitamos 'async' para usar 'await'.
 */
async function startApp() {
    try { 
        // PASO A: PostgreSQL
        console.log("Connecting to postgres...");
        await createTables(); 
        console.log(" Connected to postgres successfully");
        
        /**
         * 3. AGREGAR ESTO: Conexión a MongoDB
         * ¿Por qué? Si no llamas a connectMongo(), tu base de datos NoSQL 
         * estará "apagada" para este programa.
         */
        console.log("Connecting to MongoDB...");
        await connectMongo(); 
        console.log(" Connected to MongoDB successfully");

        // PASO B: Migración
        console.log("Migrating data...");
        /**
         * 4. NOTA: Asegúrate de que en tu migrationService.js 
         * la función se llame 'migrate'. Si se llama 'migrateData', cámbialo aquí.
         */
        await migrate(true); 
        console.log("Data migrated successfully");

        console.log("-----------------------------------------");
        console.log("SISTEMA INICIADO Y DATOS SINCRONIZADOS");
        console.log("-----------------------------------------");

    } catch (error) {
        /**
         * 5. MANEJO DE ERRORES
         * Si Postgres o Mongo fallan, el código saltará aquí directamente.
         */
        console.error(" Error starting server:", error);
        process.exit(1);
    }
}

/**
 * 6. LA LLAMADA
 * Ahora sí, como ya definimos la función arriba con el nombre 'startApp',
 * esta línea ya no te dará el error rojo de "ReferenceError".
 */
startApp();


       