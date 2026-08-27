import { z } from "zod";

export const calificacionSchema = z.object({
  estudiante_id: z.number().int().positive(),
  profesor_id: z.number().int().positive(),
  materia: z.string().min(1, "La materia es requerida"),
  nota: z.number().int().min(0).max(100),
});

export const actualizarCalificacionSchema = calificacionSchema.partial();

export const filtroCalificacionesSchema = z.object({

  // BUG: req.query recibe notaMinima como texto.
  // Se cambió z.number() por z.coerce.number() para convertir "70" a 70.
  notaMinima: z.coerce.number().int().min(0).max(100).optional(),

});