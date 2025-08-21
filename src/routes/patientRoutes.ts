import { Router } from "express";
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  searchPatients,
  deletePatient,
} from "../controllers/patientController"; //to do
import { validate } from "../middleware/validation"; //to do
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
