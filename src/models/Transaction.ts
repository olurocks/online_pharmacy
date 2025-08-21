import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database/config.ts";

export enum TransactionType {
  CREDIT = "credit",
  DEBIT = "debit",
}

interface TransactionAttributes {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  description: string;
  referenceId?: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TransactionCreationAttributes
  extends Optional<
    TransactionAttributes,
    "id" | "referenceId" | "createdAt" | "updatedAt"
  > {}

class Transaction
  extends Model<TransactionAttributes, TransactionCreationAttributes>
  implements TransactionAttributes
{
  public id!: string;
  public walletId!: string;
  public type!: TransactionType;
  public amount!: number;
  public description!: string;
  public referenceId?: string;
  public balanceBefore!: number;
  public balanceAfter!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    walletId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "wallet_id",
      references: {
        model: "wallets",
        key: "id",
      },
    },
    type: {
      type: DataTypes.ENUM(...Object.values(TransactionType)),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0,
        isDecimal: true,
      },
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    referenceId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "reference_id",
    },
    balanceBefore: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0,
        isDecimal: true,
      },
    },
    balanceAfter: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0,
        isDecimal: true,
      },
    },
  },
  {
    sequelize,
    modelName: "Transaction",
    tableName: "transactions",
    underscored: true,
    timestamps: true,
    indexes: [
      {
        fields: ["wallet_id"],
      },
      {
        fields: ["type"],
      },
      {
        fields: ["reference_id"],
      },
    ],
  }
);

export default Transaction;
