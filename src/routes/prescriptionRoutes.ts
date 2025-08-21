import { Router } from "express";
import {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescriptionStatus,
  deletePrescription,
  getPrescriptionsByPatient,
} from "../controllers/prescriptionController"; // to do
import { validate } from "../middleware/validation";
import {
  createPrescriptionSchema,
  updatePrescriptionSchema,
  prescriptionFilterSchema,
  uuidSchema,
} from "../utils/validation";

const router = Router();

router.post("/", validate(createPrescriptionSchema), createPrescription);

router.get("/", validate(prescriptionFilterSchema, "query"), getPrescriptions);

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
