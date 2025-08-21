import { Router } from "express";
import {
  getWalletBalance,
  addFunds,
  processPayment,
  getTransactionHistory,
  getWalletSummary,
} from "../controllers/walletController"; //to do
import { validate } from "../middleware/validation";
import {
  addFundsSchema,
  processPaymentSchema,
  uuidSchema,
  paginationSchema,
} from "../utils/validation";
import Joi from "joi";

const router = Router();

const transactionHistorySchema = Joi.object({
  type: Joi.string().valid("credit", "debit").optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

router.get(
  "/:patientId/balance",
  validate(uuidSchema, "params"),
  getWalletBalance
);

router.post(
  "/:patientId/add-funds",
  [validate(uuidSchema, "params"), validate(addFundsSchema)],
  addFunds
);

router.post(
  "/:patientId/payment",
  [validate(uuidSchema, "params"), validate(processPaymentSchema)],
  processPayment
);

router.get(
  "/:patientId/transactions",
  [validate(uuidSchema, "params"), validate(transactionHistorySchema, "query")],
  getTransactionHistory
);

router.get(
  "/:patientId/summary",
  validate(uuidSchema, "params"),
  getWalletSummary
);

export default router;
