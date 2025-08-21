import { Request, Response } from "express";
import { Op } from "sequelize";
import { Prescription, Patient, Medication } from "../models/associations.ts";
import { PrescriptionStatus } from "../models/Prescription.ts";
import { AppError, asyncHandler } from "../middleware/errorHandler.ts";
import sequelize from "../database/config.ts";

export const createPrescription = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      patientId,
      medicationName,
      dosage,
      quantity,
      instructions,
      prescribedBy,
    } = req.body;

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      throw new AppError("Patient not found", 404);
    }

    const medication = await Medication.findOne({
      where: { name: medicationName },
    });
    let totalAmount = 0;

    if (medication) {
      totalAmount = Number(medication.unitPrice) * quantity;
    }

    const prescription = await Prescription.create({
      patientId,
      medicationName,
      dosage,
      quantity,
      instructions,
      prescribedBy,
      totalAmount: totalAmount > 0 ? totalAmount : undefined,
      status: PrescriptionStatus.PENDING,
    });

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      data: prescription,
    });
  }
);

export const getPrescriptions = asyncHandler(
  async (req: Request, res: Response) => {
    const { patientId, status, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};

    if (patientId) {
      whereClause.patientId = patientId;
    }

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: prescriptions } = await Prescription.findAndCountAll({
      where: whereClause,
      limit: Number(limit),
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Patient,
          as: "patient",
          attributes: ["id", "name", "email", "phone"],
        },
      ],
    });

    res.json({
      success: true,
      message: "Prescriptions retrieved successfully",
      data: prescriptions,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        totalItems: count,
        itemsPerPage: Number(limit),
      },
    });
  }
);

export const getPrescriptionById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const prescription = await Prescription.findByPk(id, {
      include: [
        {
          model: Patient,
          as: "patient",
          attributes: ["id", "name", "email", "phone"],
        },
      ],
    });

    if (!prescription) {
      throw new AppError("Prescription not found", 404);
    }

    res.json({
      success: true,
      message: "Prescription retrieved successfully",
      data: prescription,
    });
  }
);

export const updatePrescriptionStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const transaction = await sequelize.transaction();

    try {
      const prescription = await Prescription.findByPk(id, { transaction });

      if (!prescription) {
        throw new AppError("Prescription not found", 404);
      }

      const currentStatus = prescription.dataValues
        .status as PrescriptionStatus;
      const validTransitions: Record<PrescriptionStatus, PrescriptionStatus[]> =
        {
          [PrescriptionStatus.PENDING]: [PrescriptionStatus.FILLED],
          [PrescriptionStatus.FILLED]: [PrescriptionStatus.PICKED_UP],
          [PrescriptionStatus.PICKED_UP]: [],
        };

      if (
        !validTransitions[currentStatus].includes(status as PrescriptionStatus)
      ) {
        throw new AppError(
          `Cannot change status from ${currentStatus} to ${status}`,
          400
        );
      }

      if (status === PrescriptionStatus.FILLED) {
        const medication = await Medication.findOne({
          where: { name: prescription.dataValues.medicationName },
          transaction,
        });

        if (medication) {
          if (
            medication.dataValues.stockQuantity <
            prescription.dataValues.quantity
          ) {
            throw new AppError("Insufficient medication stock", 400);
          }

          medication.dataValues.stockQuantity -=
            prescription.dataValues.quantity;
          await medication.save({ transaction });

          if (!prescription.totalAmount) {
            prescription.totalAmount =
              Number(medication.unitPrice) * prescription.quantity;
          }
        }
      }

      prescription.dataValues.status = status;
      await prescription.save({ transaction });

      await transaction.commit();

      res.json({
        success: true,
        message: `Prescription status updated to ${status}`,
        data: prescription,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
);

export const deletePrescription = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const prescription = await Prescription.findByPk(id);

    if (!prescription) {
      throw new AppError("Prescription not found", 404);
    }

    if (prescription.status !== PrescriptionStatus.PENDING) {
      throw new AppError(
        "Cannot delete prescription that has been filled or picked up",
        400
      );
    }

    await prescription.destroy();

    res.json({
      success: true,
      message: "Prescription deleted successfully",
    });
  }
);

export const getPrescriptionsByPatient = asyncHandler(
  async (req: Request, res: Response) => {
    const { patientId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      throw new AppError("Patient not found", 404);
    }

    const whereClause: any = { patientId };

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: prescriptions } = await Prescription.findAndCountAll({
      where: whereClause,
      limit: Number(limit),
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      message: "Patient prescriptions retrieved successfully",
      data: prescriptions,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        totalItems: count,
        itemsPerPage: Number(limit),
      },
    });
  }
);
