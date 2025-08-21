import { Request, Response } from "express";
import { Op } from "sequelize";
import { Patient, Wallet } from "../models/associations.ts";
import { AppError, asyncHandler } from "../middleware/errorHandler.ts";
import sequelize from "../database/config.ts";

export const createPatient = asyncHandler(
  async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction();

    try {
      const { name, email, phone, dateOfBirth } = req.body;

      const patient = await Patient.create(
        {
          name,
          email,
          phone,
          dateOfBirth,
        },
        { transaction }
      );

      console.log("Patient created:", patient.dataValues.id);

      await Wallet.create(
        {
          patientId: patient.dataValues.id,
          balance: 0.0,
        },
        { transaction }
      );

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: "Patient created successfully",
        data: {
          id: patient.dataValues.id,
          name: patient.dataValues.name,
          email: patient.dataValues.email,
          phone: patient.dataValues.phone,
          dateOfBirth: patient.dataValues.dateOfBirth,
          createdAt: patient.dataValues.createdAt,
        },
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
);

export const getPatients = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const { count, rows: patients } = await Patient.findAndCountAll({
    limit: Number(limit),
    offset,
    order: [["createdAt", "DESC"]],
    attributes: ["id", "name", "email", "phone", "dateOfBirth", "createdAt"],
  });

  res.json({
    success: true,
    message: "Patients retrieved successfully",
    data: patients,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(count / Number(limit)),
      totalItems: count,
      itemsPerPage: Number(limit),
    },
  });
});

export const getPatientById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      attributes: ["id", "name", "email", "phone", "dateOfBirth", "createdAt"],
      include: [
        {
          model: Wallet,
          as: "wallet",
          attributes: ["id", "balance"],
        },
      ],
    });

    if (!patient) {
      throw new AppError("Patient not found", 404);
    }

    res.json({
      success: true,
      message: "Patient retrieved successfully",
      data: patient,
    });
  }
);

export const updatePatient = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      throw new AppError("Patient not found", 404);
    }

    await patient.update(updateData);

    res.json({
      success: true,
      message: "Patient updated successfully",
      data: {
        id: patient.dataValues.id,
        name: patient.dataValues.name,
        email: patient.dataValues.email,
        phone: patient.dataValues.phone,
        dateOfBirth: patient.dataValues.dateOfBirth,
        updatedAt: patient.dataValues.updatedAt,
      },
    });
  }
);

export const searchPatients = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    if (!name && !email) {
      throw new AppError("Please provide name or email to search", 400);
    }

    const whereClause: any = {};

    if (name) {
      whereClause.name = {
        [Op.iLike]: `%${name}%`,
      };
    }

    if (email) {
      whereClause.email = {
        [Op.iLike]: `%${email}%`,
      };
    }

    const { count, rows: patients } = await Patient.findAndCountAll({
      where: whereClause,
      limit: Number(limit),
      offset,
      order: [["name", "ASC"]],
      attributes: ["id", "name", "email", "phone", "dateOfBirth", "createdAt"],
    });

    res.json({
      success: true,
      message: "Search completed successfully",
      data: patients,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        totalItems: count,
        itemsPerPage: Number(limit),
      },
    });
  }
);

export const deletePatient = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      throw new AppError("Patient not found", 404);
    }

    await patient.destroy();

    res.json({
      success: true,
      message: "Patient deleted successfully",
    });
  }
);
