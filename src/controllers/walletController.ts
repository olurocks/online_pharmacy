import { Request, Response } from "express";
import { Wallet, Transaction, Patient } from "../models/associations.ts";
import { TransactionType } from "../models/Transaction.ts";
import { AppError, asyncHandler } from "../middleware/errorHandler.ts";
import sequelize from "../database/config.ts";

export const getWalletBalance = asyncHandler(
  async (req: Request, res: Response) => {
    const { patientId } = req.params;

    const existingPatient = await Patient.findByPk(patientId);
    if (!existingPatient) {
      throw new AppError("Patient not found", 404);
    }

    const wallet = await Wallet.findOne({
      where: { patientId },
      include: [
        {
          model: Patient,
          as: "patient",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!wallet) {
      throw new AppError("Wallet not found", 404);
    }

    res.json({
      success: true,
      message: "Wallet balance retrieved successfully",
      data: {
        walletId: wallet.dataValues.id,
        patientId: wallet.dataValues.patientId,
        balance: wallet.dataValues.balance,
        patient: existingPatient,
      },
    });
  }
);

export const addFunds = asyncHandler(async (req: Request, res: Response) => {
  const { patientId } = req.params;
  const { amount } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const patient = await Patient.findByPk(patientId, { transaction });
    if (!patient) {
      throw new AppError("Patient not found", 404);
    }

    const wallet = await Wallet.findOne({
      where: { patientId },
      transaction,
    });

    if (!wallet) {
      throw new AppError("Wallet not found", 404);
    }

    const balanceBefore = Number(wallet.dataValues.balance);
    console.log("balanceBefore:", balanceBefore);
    const balanceAfter = balanceBefore + Number(amount);
    await wallet.update({ balance: balanceAfter });
    // wallet.creditBalance(Number(amount));
    await wallet.save({ transaction });

    await Transaction.create(
      {
        walletId: wallet.dataValues.id,
        type: TransactionType.CREDIT,
        amount: Number(amount),
        description: "Funds added to wallet",
        balanceBefore,
        balanceAfter: balanceAfter,
      },
      { transaction }
    );

    await transaction.commit();

    res.json({
      success: true,
      message: "Funds added successfully",
      data: {
        walletId: wallet.dataValues.id,
        patientId: wallet.dataValues.patientId,
        amountAdded: Number(amount),
        previousBalance: balanceBefore,
        newBalance: Number(wallet.dataValues.balance),
      },
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

export const processPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const { patientId } = req.params;
    const { amount, description, referenceId } = req.body;

    const transaction = await sequelize.transaction();

    try {
      const patient = await Patient.findByPk(patientId, { transaction });
      if (!patient) {
        throw new AppError("Patient not found", 404);
      }

      const wallet = await Wallet.findOne({
        where: { patientId },
        transaction,
      });

      if (!wallet) {
        throw new AppError("Wallet not found", 404);
      }

      if (!wallet.hasEnoughBalance(Number(amount))) {
        throw new AppError("Insufficient funds", 400);
      }

      const balanceBefore = Number(wallet.dataValues.balance);
      wallet.debitBalance(Number(amount));
      await wallet.save({ transaction });

      await Transaction.create(
        {
          walletId: wallet.dataValues.id,
          type: TransactionType.DEBIT,
          amount: Number(amount),
          description,
          referenceId,
          balanceBefore,
          balanceAfter: Number(wallet.dataValues.balance),
        },
        { transaction }
      );

      await transaction.commit();

      res.json({
        success: true,
        message: "Payment processed successfully",
        data: {
          walletId: wallet.dataValues.id,
          patientId: wallet.dataValues.patientId,
          amountPaid: Number(amount),
          description,
          referenceId,
          previousBalance: balanceBefore,
          newBalance: Number(wallet.dataValues.balance),
        },
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
);

export const getTransactionHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const { patientId } = req.params;
    const { page = 1, limit = 10, type } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Verify patient exists
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      throw new AppError("Patient not found", 404);
    }

    const wallet = await Wallet.findOne({
      where: { patientId },
    });

    if (!wallet) {
      throw new AppError("Wallet not found", 404);
    }

    const whereClause: any = { walletId: wallet.dataValues.id };

    if (type) {
      whereClause.type = type;
    }

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      limit: Number(limit),
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      message: "Transaction history retrieved successfully",
      data: {
        walletId: wallet.dataValues.id,
        currentBalance: wallet.dataValues.balance,
        transactions,
      },
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        totalItems: count,
        itemsPerPage: Number(limit),
      },
    });
  }
);

export const getWalletSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const { patientId } = req.params;

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      throw new AppError("Patient not found", 404);
    }

    const wallet = await Wallet.findOne({
      where: { patientId },
      include: [
        {
          model: Transaction,
          as: "transactions",
          limit: 5,
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    if (!wallet) {
      throw new AppError("Wallet not found", 404);
    }

    const allTransactions = await Transaction.findAll({
      where: { walletId: wallet.dataValues.id },
      attributes: ["type", "amount"],
    });

    const totalCredits = allTransactions
      .filter((t: any) => t.type === TransactionType.CREDIT)
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    const totalDebits = allTransactions
      .filter((t: any) => t.type === TransactionType.DEBIT)
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    const latestTransactions = await Transaction.findAll({
      where: { walletId: wallet.dataValues.id },
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    res.json({
      success: true,
      message: "Wallet summary retrieved successfully",
      data: {
        walletId: wallet.dataValues.id,
        patientId: wallet.dataValues.patientId,
        currentBalance: wallet.dataValues.balance,
        totalCredits,
        totalDebits,
        totalTransactions: allTransactions.length,
        recentTransactions: latestTransactions,
      },
    });
  }
);
