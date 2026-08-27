import { pool } from "../config/db.js";

export interface Calificacion {
  id: number;
  estudiante_id: number;
  profesor_id: number;
  materia: string;
  nota: number;
  fecha: string;
}


// ======================================================
// OBTENER TODAS LAS CALIFICACIONES
// ======================================================

export const obtenerCalificaciones = async (): Promise<Calificacion[]> => {
  const result = await pool.query(
    "SELECT * FROM calificaciones ORDER BY id"
  );

  return result.rows;
};


// ======================================================
// OBTENER CALIFICACIÓN POR ID
// ======================================================

export const obtenerCalificacionPorId = async (
  id: number
): Promise<Calificacion | undefined> => {
  const result = await pool.query(
    "SELECT * FROM calificaciones WHERE id = $1",
    [id]
  );

  return result.rows[0];
};


// ======================================================
// OBTENER CALIFICACIONES POR ESTUDIANTE
// ======================================================

export const obtenerCalificacionesPorEstudiante = async (
  estudianteId: number
): Promise<Calificacion[]> => {
  const result = await pool.query(
    "SELECT * FROM calificaciones WHERE estudiante_id = $1 ORDER BY id",
    [estudianteId]
  );

  return result.rows;
};


// ======================================================
// CREAR CALIFICACIÓN
// ======================================================

export const crearCalificacion = async (data: {
  estudiante_id: number;
  profesor_id: number;
  materia: string;
  nota: number;
}): Promise<Calificacion> => {

  /*
    BUG:
    Los valores de estudiante_id y profesor_id
    estaban enviados al revés.

    ANTES:
    [data.profesor_id, data.estudiante_id, ...]

    CORRECCIÓN:
    [data.estudiante_id, data.profesor_id, ...]
  */

  const result = await pool.query(
    `INSERT INTO calificaciones
      (estudiante_id, profesor_id, materia, nota)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      data.estudiante_id,
      data.profesor_id,
      data.materia,
      data.nota
    ]
  );

  return result.rows[0];
};


// ======================================================
// ACTUALIZAR CALIFICACIÓN
// ======================================================

export const actualizarCalificacion = async (
  id: number,
  data: Partial<{
    estudiante_id: number;
    profesor_id: number;
    materia: string;
    nota: number;
  }>
): Promise<Calificacion | undefined> => {

  const actual = await obtenerCalificacionPorId(id);

  if (!actual) {
    return undefined;
  }

  const estudiante_id =
    data.estudiante_id ?? actual.estudiante_id;

  const profesor_id =
    data.profesor_id ?? actual.profesor_id;

  const materia =
    data.materia ?? actual.materia;

  /*
    BUG:
    Antes se utilizaba:

    const nota = data.nota || actual.nota;

    Si queríamos colocar nota = 0:

    0 || actual.nota

    JavaScript considera 0 como falso y mantenía
    la nota anterior.

    CORRECCIÓN:
    Utilizamos ?? en lugar de ||.
  */

  const nota =
    data.nota ?? actual.nota;

  const result = await pool.query(
    `UPDATE calificaciones
     SET estudiante_id = $1,
         profesor_id = $2,
         materia = $3,
         nota = $4
     WHERE id = $5
     RETURNING *`,
    [
      estudiante_id,
      profesor_id,
      materia,
      nota,
      id
    ]
  );

  return result.rows[0];
};


// ======================================================
// ELIMINAR CALIFICACIÓN
// ======================================================

export const eliminarCalificacion = async (
  id: number
): Promise<boolean> => {

  const result = await pool.query(
    "DELETE FROM calificaciones WHERE id = $1",
    [id]
  );

  return (result.rowCount ?? 0) > 0;
};


// ======================================================
// VALIDAR QUE ESTUDIANTE Y PROFESOR EXISTAN
// ======================================================

export const validarEstudianteYProfesorExisten = async (
  estudianteId: number,
  profesorId: number
): Promise<boolean> => {


  const estudiante = await pool.query(
    "SELECT id FROM estudiantes WHERE id = $1",
    [estudianteId]
  );

  const profesor = await pool.query(
    "SELECT id FROM profesores WHERE id = $1",
    [profesorId]
  );

  return (
    (estudiante.rowCount ?? 0) > 0 &&
    (profesor.rowCount ?? 0) > 0
  );
};


// ======================================================
// OBTENER CALIFICACIONES DE HOY
// ======================================================

export const obtenerCalificacionesDeHoy =
  async (): Promise<Calificacion[]> => {


  const result = await pool.query(
    `SELECT *
     FROM calificaciones
     WHERE fecha = CURRENT_DATE
     ORDER BY id`
  );

  return result.rows;
};