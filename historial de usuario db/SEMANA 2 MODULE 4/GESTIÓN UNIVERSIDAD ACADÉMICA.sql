--SEMANA 2 MODULO 4
-- SCRIPT DE GESTIÓN ACADÉMICA UNIVERSITARIA

--creacion de las tablas 
DROP DATABASE IF EXISTS gestion_academica_universidad;
CREATE DATABASE gestion_academica_universidad;
USE gestion_academica_universidad;

CREATE TABLE estudiantes (
    id_estudiante INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(100) UNIQUE NOT NULL,
    genero CHAR(1),
    identificacion VARCHAR(20) UNIQUE NOT NULL,
    carrera VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE,
    fecha_ingreso DATE DEFAULT (CURRENT_DATE),
    estado_academico VARCHAR(20) DEFAULT 'Activo' -- Incluida del Task 3
);

CREATE TABLE docentes (
    id_docente INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo_institucional VARCHAR(100) UNIQUE NOT NULL,
    departamento_academico VARCHAR(50),
    anios_experiencia INT CHECK (anios_experiencia >= 0)
);

CREATE TABLE cursos (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    creditos INT CHECK (creditos > 0),
    semestre INT,
    id_docente INT,
    FOREIGN KEY (id_docente) REFERENCES docentes(id_docente) ON DELETE SET NULL
);

CREATE TABLE inscripciones (
    id_inscripcion INT AUTO_INCREMENT PRIMARY KEY,
    id_estudiante INT NOT NULL,
    id_curso INT NOT NULL,
    fecha_inscripcion DATE DEFAULT (CURRENT_DATE),
    calificacion_final DECIMAL(3,2) CHECK (calificacion_final BETWEEN 0 AND 5),
    FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante),
    FOREIGN KEY (id_curso) REFERENCES cursos(id_curso)
);

-- INSERCIÓN DE DATOS
INSERT INTO docentes (nombre_completo, correo_institucional, departamento_academico, anios_experiencia) VALUES
('Carlos Ruiz', 'cruiz@uni.edu', 'Sistemas', 10),
('Ana Maria Garcia', 'agarcia@uni.edu', 'Matemáticas', 4),
('Luis Perez', 'lperez@uni.edu', 'Física', 7);

INSERT INTO estudiantes (nombre_completo, correo_electronico, genero, identificacion, carrera) VALUES
('Juan Diaz', 'jdiaz@mail.com', 'M', '101', 'Ingeniería'),
('Maria Lopez', 'mlopez@mail.com', 'F', '102', 'Ingeniería'),
('Pedro Gomez', 'pgomez@mail.com', 'M', '103', 'Física'),
('Lucia Torres', 'ltorres@mail.com', 'F', '104', 'Sistemas'),
('Santi Cano', 'scano@mail.com', 'M', '105', 'Sistemas');

INSERT INTO cursos (nombre, codigo, creditos, semestre, id_docente) VALUES
('Bases de Datos I', 'BD101', 4, 3, 1),
('Cálculo Integral', 'MAT202', 3, 2, 2),
('Física Mecánica', 'FIS101', 3, 1, 3),
('Programación Avanzada', 'PRG303', 4, 4, 1);

INSERT INTO inscripciones (id_estudiante, id_curso, calificacion_final) VALUES
(1, 1, 4.5), (1, 2, 3.8), (2, 1, 4.0), (3, 3, 4.2),
(4, 4, 4.8), (4, 1, 3.5), (5, 4, 4.1), (2, 4, 3.9);

-- 
-- Listar estudiantes con sus cursos
SELECT e.nombre_completo, c.nombre AS curso, i.calificacion_final 
FROM estudiantes e
JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
JOIN cursos c ON i.id_curso = c.id_curso;

-- Promedio por curso
SELECT c.nombre, AVG(i.calificacion_final) as promedio
FROM cursos c
JOIN inscripciones i ON c.id_curso = i.id_curso
GROUP BY c.nombre;

-- Cursos con más de 2 estudiantes
SELECT c.nombre, COUNT(i.id_estudiante) as total_estudiantes
FROM cursos c
JOIN inscripciones i ON c.id_curso = i.id_curso
GROUP BY c.nombre
HAVING COUNT(i.id_estudiante) > 2;


-- Estudiantes con promedio superior al general
SELECT nombre_completo 
FROM estudiantes 
WHERE id_estudiante IN (
    SELECT id_estudiante FROM inscripciones 
    GROUP BY id_estudiante 
    HAVING AVG(calificacion_final) > (SELECT AVG(calificacion_final) FROM inscripciones)
);

-- Indicadores
SELECT 
    ROUND(AVG(calificacion_final), 2) AS promedio_total,
    MAX(calificacion_final) AS nota_maxima,
    COUNT(*) AS total_inscripciones
FROM inscripciones;

-- CREACIÓN DE LA VISTA
CREATE OR REPLACE VIEW vista_historial_academico AS
SELECT 
    e.nombre_completo AS estudiante, 
    c.nombre AS curso, 
    d.nombre_completo AS docente, 
    c.semestre, 
    i.calificacion_final
FROM inscripciones i
JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
JOIN cursos c ON i.id_curso = c.id_curso
LEFT JOIN docentes d ON c.id_docente = d.id_docente;

-- CONTROL DE ACCESO Y TRANSACCIONES
-- (Nota: Estos comandos requieren permisos de ROOT)
DROP ROLE IF EXISTS revisor_academico;
CREATE ROLE revisor_academico;
GRANT SELECT ON vista_historial_academico TO revisor_academico;

-- Simulación de transacción
START TRANSACTION;
UPDATE inscripciones SET calificacion_final = 5.0 WHERE id_inscripcion = 1;
SAVEPOINT ajuste_nota;
-- ROLLBACK TO ajuste_nota; -- Opcional: deshacer hasta el punto
COMMIT;

-- Consultar la vista para verificar datos
SELECT * FROM vista_historial_academico;
