import { Router } from "express";
import {
  obtenerEstudiantes,
  obtenerEstudiantePorId,
  buscarEstudiantesPorNombre,
  crearEstudiante,
  actualizarEstudiante,
  eliminarEstudiante,
} from "../models/estudiantes.model.js";
import { validate } from "../middlewares/validate.js";
import {
  estudianteSchema,
  actualizarEstudianteSchema,
} from "../schemas/estudiantes.schema.js";
import type { Request, Response, NextFunction } from "express";

export const estudiantesRouter = Router();

estudiantesRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const estudiantes = await obtenerEstudiantes();
      res.json(estudiantes);
    } catch (err) {
      next(err);
    }
  },
);

estudiantesRouter.get(
  "/buscar",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nombre = String(req.query.nombre ?? "");
      const estudiantes = await buscarEstudiantesPorNombre(nombre);
      if (estudiantes.length === 0) {
        res.status(404).json({ error: "Estudiante no encontrado" });
        return;
      }
      res.json(estudiantes);
    } catch (err) {
      next(err);
    }
  },
);

estudiantesRouter.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const estudiante = await obtenerEstudiantePorId(id);
      if (!estudiante) {
        res.status(404).json({ error: "Estudiante no encontrado" });
        return;
      }
      res.json(estudiante);
    } catch (err) {
      next(err);
    }
  },
);

estudiantesRouter.post(
  "/",
  validate(estudianteSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nuevoEstudiante = await crearEstudiante(req.body);
      res.status(201).json(nuevoEstudiante);
    } catch (err) {
      next(err);
    }
  },
);

estudiantesRouter.put(
  "/:id",
  validate(actualizarEstudianteSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const estudiante = await actualizarEstudiante(id, req.body);
      if (!estudiante) {
        res.status(404).json({ error: "Estudiante no encontrado" });
        return;
      }
      res.json(estudiante);
    } catch (err) {
      next(err);
    }
  },
);

estudiantesRouter.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const eliminado = await eliminarEstudiante(id);
      if (!eliminado) {
        res.status(404).json({ error: "Estudiante no encontrado" });
        return;
      }
      res.json({ message: "Estudiante eliminado" });
    } catch (err) {
      next(err);
    }
  },
);
