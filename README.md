# 🏥 SISTEMA DE MIGRACIÓN DE SALUD PLUS
### Arquitectura Dual: PostgreSQL + MongoDB + Express API

Este proyecto implementa un flujo completo de **ETL** (Extract, Transform, Load) para procesar datos médicos desde un archivo CSV hacia dos motores de base de datos simultáneos, exponiendo la información mediante una **API REST**.

---

##  ENDPOINTS DE LA API (Pruebas en Postman)

Una vez que el servidor esté corriendo, puedes usar estas URLs en **Postman**:

* **Listar Pacientes (PostgreSQL):**
    `GET http://localhost:3000/api/patients`
    *Devuelve los datos estructurados y normalizados de la tabla SQL.*

* **Listar Historiales (MongoDB):**
    `GET http://localhost:3000/api/histories`
    *Devuelve los documentos NoSQL con historiales médicos anidados.*

---

##  TECNOLOGÍAS Y HERRAMIENTAS
* **Backend:** Node.js con Express.js.
* **Base de Datos Relacional:** PostgreSQL (Normalización de tablas).
* **Base de Datos NoSQL:** MongoDB (Esquemas de documentos complejos).
* **Gestión de Datos:** `csv-parse` para lectura de archivos planos.
* **Testing:** Postman Desktop Agent.

---

## BITÁCORA DE COMANDOS (Guía de ejecución)



### 1. Gestión de Versiones (Git)
Durante el desarrollo se utilizaron los siguientes comandos para el control de versiones:

```bash
# Iniciar el repositorio
git init

# Preparar y guardar cambios
git add .
git commit -m "Instalación de Express y configuración de servidor"

# Verificar estado
git status
git log --oneline



## Configuración del Entorno

### Instalación de dependencias necesarias
npm install express pg mongoose dotenv csv-parse

# Entrar a la carpeta del proyecto
cd saludplus




## Ejecución del Servidor

# Iniciar migración y levantar API
npm start


## ESTRUCTURA DEL PROYECTO 

saludplus/
├── data/
│   └── datos.csv           # Fuente de datos original (100 registros)
├── src/
│   ├── config/
│   │   ├── postgres.js     # Conexión y creación de tablas SQL
│   │   └── mongodb.js      # Conexión y Modelos NoSQL (Mongoose)
│   ├── services/
│   │   └── migrationService.js # Lógica de transformación y carga
│   └── server.js           # Express API y puntos de entrada
├── .env                    # Variables de entorno (Privado)
├── package.json            # Scripts y dependencias
└── README.md               # Documentación profesional




## CONFIGURACIÓN DE VARIABLES (.env)

# Para conectar las bases de datos, el archivo .env debe tener esta estructura:
DB_USER=tu_usuario
DB_HOST=localhost
DB_PASSWORD=tu_clave
DB_NAME=saludplus
DB_PORT=5432
MONGO_URI=mongodb://localhost:27017/saludplus



Desarrollado por: Andrea Lizcano BY riwi
Fecha: Febrero 2026