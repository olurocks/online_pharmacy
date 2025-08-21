import { Router } from "express";
import {
  createMedication,
  getMedications,
  getMedicationById,
  updateMedication,
  updateStock,
  getLowStockMedications,
  deleteMedication,
  restockMedication,
} from "../controllers/medicationController.ts";
import { validate } from "../middleware/validation.ts";
import {
  createMedicationSchema,
  updateMedicationSchema,
  uuidSchema,
  paginationSchema,
} from "../utils/validation.ts";
import Joi from "joi";

const router = Router();

// Custom validation schemas for medication routes
const updateStockSchema = Joi.object({
  stockQuantity: Joi.number().integer().min(0).required(),
});

const restockSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
});

const lowStockQuerySchema = Joi.object({
  threshold: Joi.number().integer().min(1).default(10),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

router.post("/", validate(createMedicationSchema), createMedication);

router.get("/", validate(paginationSchema, "query"), getMedications);

router.get(
  "/low-stock",
  validate(lowStockQuerySchema, "query"),
  getLowStockMedications
);

router.get("/:id", validate(uuidSchema, "params"), getMedicationById);

router.put(
  "/:id",
  [validate(uuidSchema, "params"), validate(updateMedicationSchema)],
  updateMedication
);

router.put(
  "/:id/stock",
  [validate(uuidSchema, "params"), validate(updateStockSchema)],
  updateStock
);

router.post(
  "/:id/restock",
  [validate(uuidSchema, "params"), validate(restockSchema)],
  restockMedication
);

router.delete("/:id", validate(uuidSchema, "params"), deleteMedication);

export default router;
