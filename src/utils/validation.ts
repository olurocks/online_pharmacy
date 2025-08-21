import Joi from "joi";
import { PrescriptionStatus } from "../models/Prescription.ts";
import { ServiceType, AppointmentStatus } from "../models/Appointment.ts";
// import { TransactionType } from "../models/Transaction.ts";

export const createPatientSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().max(150).required(),
  phone: Joi.string().min(10).max(20).required(),
  dateOfBirth: Joi.date().max("now").required(),
});

export const updatePatientSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().max(150).optional(),
  phone: Joi.string().min(10).max(20).optional(),
  dateOfBirth: Joi.date().max("now").optional(),
});

export const searchPatientSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().max(150).optional(),
}).or("name", "email");

export const createPrescriptionSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  medicationName: Joi.string().min(2).max(200).required(),
  dosage: Joi.string().min(1).max(100).required(),
  quantity: Joi.number().integer().min(1).required(),
  instructions: Joi.string().max(1000).optional(),
  prescribedBy: Joi.string().max(100).optional(),
});

export const updatePrescriptionSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(PrescriptionStatus))
    .required(),
});

export const prescriptionFilterSchema = Joi.object({
  patientId: Joi.string().uuid().optional(),
  status: Joi.string()
    .valid(...Object.values(PrescriptionStatus))
    .optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

export const createMedicationSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  stockQuantity: Joi.number().integer().min(0).required(),
  unitPrice: Joi.number().precision(2).min(0).required(),
  description: Joi.string().max(1000).optional(),
});

export const updateMedicationSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  stockQuantity: Joi.number().integer().min(0).optional(),
  unitPrice: Joi.number().precision(2).min(0).optional(),
  description: Joi.string().max(1000).optional(),
});

export const addFundsSchema = Joi.object({
  amount: Joi.number().precision(2).min(0.01).required(),
});

export const processPaymentSchema = Joi.object({
  amount: Joi.number().precision(2).min(0.01).required(),
  description: Joi.string().min(1).max(255).required(),
  referenceId: Joi.string().uuid().optional(),
});

export const createAppointmentSlotSchema = Joi.object({
  date: Joi.date().min("now").required(),
  startTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .required(),
  endTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .required(),
  serviceType: Joi.string()
    .valid(...Object.values(ServiceType))
    .required(),
});

export const bookAppointmentSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  slotId: Joi.string().uuid().required(),
  notes: Joi.string().max(1000).optional(),
});

export const appointmentFilterSchema = Joi.object({
  date: Joi.date().optional(),
  serviceType: Joi.string()
    .valid(...Object.values(ServiceType))
    .optional(),
  status: Joi.string()
    .valid(...Object.values(AppointmentStatus))
    .optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

export const uuidSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});
