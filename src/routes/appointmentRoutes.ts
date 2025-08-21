import { Router } from "express";
import {
  createAppointmentSlot,
  getAppointmentSlots,
  getAvailableSlots,
  updateAppointmentSlot,
  bookAppointment,
  getBookings,
  getBookingById,
  cancelBooking,
  getPatientBookings,
} from "../controllers/appointmentController"; // to do
import { validate } from "../middleware/validation";
import {
  createAppointmentSlotSchema,
  bookAppointmentSchema,
  appointmentFilterSchema,
  uuidSchema,
} from "../utils/validation"; //to do
import Joi from "joi";

const router = Router();

const availableSlotsSchema = Joi.object({
  date: Joi.date().optional(),
  serviceType: Joi.string().valid("consultation", "pickup").optional(),
});

const bookingFilterSchema = Joi.object({
  patientId: Joi.string().uuid().optional(),
  status: Joi.string().valid("booked", "cancelled", "completed").optional(),
  date: Joi.date().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

router.post(
  "/slots",
  validate(createAppointmentSlotSchema),
  createAppointmentSlot
);

router.get(
  "/slots",
  validate(appointmentFilterSchema, "query"),
  getAppointmentSlots
);

router.get(
  "/slots/available",
  validate(availableSlotsSchema, "query"),
  getAvailableSlots
);

router.put(
  "/slots/:id",
  [validate(uuidSchema, "params"), validate(createAppointmentSlotSchema)],
  updateAppointmentSlot
);

router.post("/book", validate(bookAppointmentSchema), bookAppointment);

router.get("/bookings", validate(bookingFilterSchema, "query"), getBookings);

router.get("/bookings/:id", validate(uuidSchema, "params"), getBookingById);

router.put(
  "/bookings/:id/cancel",
  validate(uuidSchema, "params"),
  cancelBooking
);

router.get(
  "/patient/:patientId",
  [validate(uuidSchema, "params"), validate(bookingFilterSchema, "query")],
  getPatientBookings
);

export default router;
