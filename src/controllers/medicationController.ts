import { Request, Response } from "express";
import { Op } from "sequelize";
import { Medication } from "../models/associations.ts";
import { AppError, asyncHandler } from "../middleware/errorHandler.ts";

export const createMedication = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, stockQuantity, unitPrice, description } = req.body;

    const medication = await Medication.create({
      name,
      stockQuantity,
      unitPrice,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Medication created successfully",
      data: medication,
    });
  }
);

export const getMedications = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};

    if (search) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`,
      };
    }

    const { count, rows: medications } = await Medication.findAndCountAll({
      where: whereClause,
      limit: Number(limit),
      offset,
      order: [["name", "ASC"]],
    });

    res.json({
      success: true,
      message: "Medications retrieved successfully",
      data: medications,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        totalItems: count,
        itemsPerPage: Number(limit),
      },
    });
  }
);

export const getMedicationById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const medication = await Medication.findByPk(id);

    if (!medication) {
      throw new AppError("Medication not found", 404);
    }

    res.json({
      success: true,
      message: "Medication retrieved successfully",
      data: medication,
    });
  }
);

export const updateMedication = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const medication = await Medication.findByPk(id);

    if (!medication) {
      throw new AppError("Medication not found", 404);
    }

    await medication.update(updateData);

    res.json({
      success: true,
      message: "Medication updated successfully",
      data: medication,
    });
  }
);

export const updateStock = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { stockQuantity } = req.body;

  const medication = await Medication.findByPk(id);

  if (!medication) {
    throw new AppError("Medication not found", 404);
  }

  medication.stockQuantity = stockQuantity;
  await medication.save();

  res.json({
    success: true,
    message: "Medication stock updated successfully",
    data: {
      id: medication.id,
      name: medication.name,
      stockQuantity: medication.stockQuantity,
      updatedAt: medication.updatedAt,
    },
  });
});

export const getLowStockMedications = asyncHandler(
  async (req: Request, res: Response) => {
    const { threshold = 10, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: medications } = await Medication.findAndCountAll({
      where: {
        stockQuantity: {
          [Op.lt]: Number(threshold),
        },
      },
      limit: Number(limit),
      offset,
      order: [["stockQuantity", "ASC"]],
    });

    res.json({
      success: true,
      message: "Low stock medications retrieved successfully",
      data: medications,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        totalItems: count,
        itemsPerPage: Number(limit),
      },
      meta: {
        threshold: Number(threshold),
        totalLowStock: count,
      },
    });
  }
);

export const deleteMedication = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const medication = await Medication.findByPk(id);

    if (!medication) {
      throw new AppError("Medication not found", 404);
    }

    await medication.destroy();

    res.json({
      success: true,
      message: "Medication deleted successfully",
    });
  }
);

export const restockMedication = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      throw new AppError("Quantity must be greater than 0", 400);
    }

    const medication = await Medication.findByPk(id);

    if (!medication) {
      throw new AppError("Medication not found", 404);
    }

    const previousStock = medication.stockQuantity;
    medication.stockQuantity += Number(quantity);
    await medication.save();

    res.json({
      success: true,
      message: "Medication restocked successfully",
      data: {
        id: medication.id,
        name: medication.name,
        previousStock,
        newStock: medication.stockQuantity,
        addedQuantity: Number(quantity),
        updatedAt: medication.updatedAt,
      },
    });
  }
);
