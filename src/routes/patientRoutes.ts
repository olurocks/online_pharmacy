import { Router } from "express";
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  searchPatients,
  deletePatient,
} from "../controllers/patientController.ts";
import { validate } from "../middleware/validation.ts";
import {
  createPatientSchema,
  updatePatientSchema,
  searchPatientSchema,
  uuidSchema,
  paginationSchema,
} from "../utils/validation.ts";

const router = Router();

router.post("/", validate(createPatientSchema), createPatient);

router.get("/", validate(paginationSchema, "query"), getPatients);

router.get("/search", validate(searchPatientSchema, "query"), searchPatients);

router.get("/:id", validate(uuidSchema, "params"), getPatientById);

router.put(
  "/:id",
  [validate(uuidSchema, "params"), validate(updatePatientSchema)],
  updatePatient
);

router.delete("/:id", validate(uuidSchema, "params"), deletePatient);

export default router;
