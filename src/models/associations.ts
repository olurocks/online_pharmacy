import Patient from "./Patient.ts";
import Prescription from "./Prescription.ts";
import Medication from "./Medication.ts";
import Wallet from "./Wallet.ts";
import Transaction from "./Transaction.ts";
import { AppointmentSlot, Booking } from "./Appointment.ts";

// Patient associations
Patient.hasMany(Prescription, {
  foreignKey: "patientId",
  as: "prescriptions",
  onDelete: "CASCADE",
});

Patient.hasOne(Wallet, {
  foreignKey: "patientId",
  as: "wallet",
  onDelete: "CASCADE",
});

Patient.hasMany(Booking, {
  foreignKey: "patientId",
  as: "bookings",
  onDelete: "CASCADE",
});

// Prescription associations
Prescription.belongsTo(Patient, {
  foreignKey: "patientId",
  as: "patient",
});

// Wallet associations
Wallet.belongsTo(Patient, {
  foreignKey: "patientId",
  as: "patient",
});

Wallet.hasMany(Transaction, {
  foreignKey: "walletId",
  as: "transactions",
  onDelete: "CASCADE",
});

// Transaction associations
Transaction.belongsTo(Wallet, {
  foreignKey: "walletId",
  as: "wallet",
});

// Booking associations
Booking.belongsTo(Patient, {
  foreignKey: "patientId",
  as: "patient",
});

Booking.belongsTo(AppointmentSlot, {
  foreignKey: "slotId",
  as: "slot",
});

// AppointmentSlot associations
AppointmentSlot.hasMany(Booking, {
  foreignKey: "slotId",
  as: "bookings",
  onDelete: "CASCADE",
});

export {
  Patient,
  Prescription,
  Medication,
  Wallet,
  Transaction,
  AppointmentSlot,
  Booking,
};
