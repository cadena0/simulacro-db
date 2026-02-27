export const env = {
    postgresUri: process.env.POSTGRES_URI || 'postgresql://postgres:Asd.123*@localhost:5432/saludplus',
    fileDataCsv: process.env.FILE_DATA_CSV || './data/simulation_saludplus_data.csv',
    // Agregamos la coma al final de la siguiente línea:
    mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saludplus', 
    // Ahora esta línea ya no dará error:
    databaseMongoUrl: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/saludplus'
};