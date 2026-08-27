import { Router } from "express";
import {
  obtenerCalificaciones,
  obtenerCalificacionPorId,
  obtenerCalificacionesPorEstudiante,
  obtenerCalificacionesDeHoy,
  validarEstudianteYProfesorExisten,
  crearCalificacion,
  actualizarCalificacion,
  eliminarCalificacion,
} from "../models/calificaciones.model.js";

import { validate } from "../middlewares/validate.js";

import {
  calificacionSchema,
  actualizarCalificacionSchema,
  filtroCalificacionesSchema,
} from "../schemas/calificaciones.schema.js";

export const calificacionesRouter = Router();

calificacionesRouter.get("/", async (req, res, next) => {
  try {
    const filtro = filtroCalificacionesSchema.safeParse(req.query);

    if (!filtro.success) {
      res.status(400).json({
        error: filtro.error.flatten(),
      });
      return;
    }

    const calificaciones = await obtenerCalificaciones();

    const resultado =
      filtro.data.notaMinima !== undefined
        ? calificaciones.filter(
            (c) => c.nota >= filtro.data.notaMinima!
          )
        : calificaciones;

    res.json(resultado);

  } catch (err) {
    next(err);
  }
});

calificacionesRouter.get("/hoy", async (req, res, next) => {
  try {
    const calificaciones = await obtenerCalificacionesDeHoy();

    res.json(calificaciones);

  } catch (err) {
    next(err);
  }
});

calificacionesRouter.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // BUG:
    // Antes no se validaba si el id era un número válido.
    // Por ejemplo: /calificaciones/abc -> Number("abc") = NaN
    // CORRECCIÓN:
    // Validamos que sea entero y mayor que 0.
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        error: "El id debe ser un numero entero positivo",
      });
      return;
    }

    const calificacion = await obtenerCalificacionPorId(id);

    if (!calificacion) {
      res.status(404).json({
        error: "Calificacion no encontrada",
      });
      return;
    }

    res.json(calificacion);

  } catch (err) {
    next(err);
  }
});

calificacionesRouter.get(
  "/estudiante/:estudianteId",
  async (req, res, next) => {
    try {
      const estudianteId = Number(req.params.estudianteId);

      // BUG:
      // Antes no se validaba estudianteId.
      // Por ejemplo: /estudiante/abc -> NaN
      // CORRECCIÓN:
      // Validamos que sea entero positivo.
      if (!Number.isInteger(estudianteId) || estudianteId <= 0) {
        res.status(400).json({
          error: "El estudianteId debe ser un numero entero positivo",
        });
        return;
      }

      const calificaciones =
        await obtenerCalificacionesPorEstudiante(estudianteId);

      // BUG:
      // reduce() sin valor inicial falla si el arreglo está vacío.
      //
      // Antes:
      // calificaciones.reduce((acc, c) => acc + c.nota)
      //
      // CORRECCIÓN:
      // Se agrega 0 como valor inicial.
      const suma = calificaciones.reduce(
        (acc, c) => acc + c.nota,
        0
      );

      // BUG:
      // Si no hay calificaciones:
      // 0 / 0 = NaN
      //
      // CORRECCIÓN:
      // Solo calculamos el promedio si hay elementos.
      const promedio =
        calificaciones.length > 0
          ? suma / calificaciones.length
          : 0;

      res.json({
        calificaciones,
        promedio,
      });

    } catch (err) {
      next(err);
    }
  }
);

calificacionesRouter.post(
  "/",
  validate(calificacionSchema),
  async (req, res, next) => {
    try {
      const existen =
        await validarEstudianteYProfesorExisten(
          req.body.estudiante_id,
          req.body.profesor_id
        );

      if (!existen) {
        res.status(404).json({
          error: "estudiante_id o profesor_id no existen",
        });
        return;
      }

      const nuevaCalificacion =
        await crearCalificacion(req.body);

      res.status(201).json(nuevaCalificacion);

    } catch (err) {
      next(err);
    }
  }
);

calificacionesRouter.put(
  "/:id",
  validate(actualizarCalificacionSchema),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);

      // BUG:
      // Antes tampoco se validaba el id del PUT.
      //
      // CORRECCIÓN:
      // Validamos que sea un entero positivo.
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({
          error: "El id debe ser un numero entero positivo",
        });
        return;
      }

      const calificacion =
        await actualizarCalificacion(id, req.body);

      if (!calificacion) {
        res.status(404).json({
          error: "Calificacion no encontrada",
        });
        return;
      }

      res.json(calificacion);

    } catch (err) {
      next(err);
    }
  }
);

calificacionesRouter.delete(
  "/:id",
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);

      // BUG:
      // Antes tampoco se validaba el id del DELETE.
      //
      // CORRECCIÓN:
      // Validamos que sea un entero positivo.
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({
          error: "El id debe ser un numero entero positivo",
        });
        return;
      }

      const eliminada =
        await eliminarCalificacion(id);

      if (!eliminada) {
        res.status(404).json({
          error: "Calificacion no encontrada",
        });
        return;
      }

      res.json({
        message: "Calificacion eliminada",
      });

    } catch (err) {
      next(err);
    }
  }
);