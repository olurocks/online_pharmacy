import { Router } from "express";
import {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescriptionStatus,
  deletePrescription,
  getPrescriptionsByPatient,
} from "../controllers/prescriptionController"; //to do
import { validate } from "../middleware/validation"; //to do
import {
  createPrescriptionSchema,
  updatePrescriptionSchema,
  prescriptionFilterSchema,
  uuidSchema,
} from "../utils/validation"; //to do

const router = Router();

/**
 * @route POST /api/prescriptions
 * @desc Create a new prescription
 * @access Public
 */
router.post("/", validate(createPrescriptionSchema), createPrescription);

/**
 * @route GET /api/prescriptions
 * @desc Get all prescriptions with filtering and pagination
 * @access Public
 */
router.get("/", validate(prescriptionFilterSchema, "query"), getPrescriptions);

/**
 * @route GET /api/prescriptions/:id
 * @desc Get prescription by ID
 * @access Public
 */
router.get("/:id", validate(uuidSchema, "params"), getPrescriptionById);

router.put(
  "/:id/status",
  [validate(uuidSchema, "params"), validate(updatePrescriptionSchema)],
  updatePrescriptionStatus
);

router.delete("/:id", validate(uuidSchema, "params"), deletePrescription);

router.get(
  "/patient/:patientId",
  [validate(uuidSchema, "params"), validate(prescriptionFilterSchema, "query")],
  getPrescriptionsByPatient
);

export default router;
