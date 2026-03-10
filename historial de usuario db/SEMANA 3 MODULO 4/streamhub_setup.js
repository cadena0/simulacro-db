
// 1. Colección de Películas y Series (Contenido)
db.contenidos.insertMany([
  {
    titulo: "Inception",
    tipo: "pelicula",
    genero: ["Ciencia Ficción", "Acción"],
    duracion_min: 148,
    estreno: 2010,
    director: "Christopher Nolan",
    calificacion_media: 4.8,
    resenas: [
      { usuario: "user123", comentario: "Increíble trama", nota: 5 },
      { usuario: "cinefilo99", comentario: "Un poco confusa al final", nota: 4 }
    ]
  },
  {
    titulo: "Stranger Things",
    tipo: "serie",
    genero: ["Terror", "Drama"],
    temporadas: 4,
    estreno: 2016,
    calificacion_media: 4.5,
    elenco: ["Winona Ryder", "David Harbour"]
  },
  {
    titulo: "The Matrix",
    tipo: "pelicula",
    genero: ["Ciencia Ficción"],
    duracion_min: 136,
    estreno: 1999,
    calificacion_media: 4.9
  },
  {
    titulo: "Toy Story",
    tipo: "pelicula",
    genero: ["Animación", "Aventura"],
    duracion_min: 81,
    estreno: 1995,
    calificacion_media: 4.7
  }
]);

// 2. Colección de Usuarios e Historial
db.usuarios.insertMany([
  {
    nombre: "Carlos Ruiz",
    email: "carlos@mail.com",
    plan: "Premium",
    historial_visto: [
      { contenido_id: "ID_INCEPTION", fecha: new Date("2024-01-10") },
      { contenido_id: "ID_MATRIX", fecha: new Date("2024-02-15") }
    ],
    favoritos: ["Inception"],
    total_vistos: 12
  },
  {
    nombre: "Ana Garcia",
    email: "ana@mail.com",
    plan: "Básico",
    historial_visto: [],
    total_vistos: 2
  }
]);

// Películas con duración > 120 min
db.contenidos.find({ 
    tipo: "pelicula", 
    duracion_min: { $gt: 120 } 
});

// Usuarios que vieron > 5 contenidos
db.usuarios.find({ 
    total_vistos: { $gt: 5 } 
});

// Contenidos de género Ciencia FicciónO Terror
db.contenidos.find({ 
    genero: { $in: ["Ciencia Ficción", "Terror"] } 
});

// Buscar contenidos que tengan "Matrix" en el título (Regex)
db.contenidos.find({ 
    titulo: { $regex: "Matrix", $options: "i" } 
});

// Actualizar la calificación media de Inception
db.contenidos.updateOne(
  { titulo: "Inception" },
  { $set: { calificacion_media: 4.9 } }
);

// Agregar un nuevo género a Stranger Things
db.contenidos.updateOne(
  { titulo: "Stranger Things" },
  { $push: { genero: "Misterio" } }
);

// Eliminar usuarios con 0 contenidos vistos (limpieza)
db.usuarios.deleteMany({ total_vistos: 0 });

// Crear índice en el título (para búsquedas rápidas)
db.contenidos.createIndex({ titulo: 1 });

// Crear índice compuesto por género y calificación
db.contenidos.createIndex({ genero: 1, calificacion_media: -1 });

// Verificar índices creados
db.contenidos.getIndexes();