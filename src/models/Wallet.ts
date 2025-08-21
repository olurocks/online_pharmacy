import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database/config.ts";

interface WalletAttributes {
  id: string;
  patientId: string;
  balance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface WalletCreationAttributes
  extends Optional<
    WalletAttributes,
    "id" | "balance" | "createdAt" | "updatedAt"
  > {}

class Wallet
  extends Model<WalletAttributes, WalletCreationAttributes>
  implements WalletAttributes
{
  public id!: string;
  public patientId!: string;
  public balance!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public hasEnoughBalance(amount: number): boolean {
    return this.balance >= amount;
  }

  public debitBalance(amount: number): void {
    if (!this.hasEnoughBalance(amount)) {
      throw new Error("Insufficient funds");
    }
    this.balance -= amount;
  }

  public creditBalance(amount: number): void {
    this.balance += amount;
  }
}

Wallet.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: "patient_id",
      references: {
        model: "patients",
        key: "id",
      },
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
        isDecimal: true,
      },
    },
  },
  {
    sequelize,
    modelName: "Wallet",
    tableName: "wallets",
    underscored: true,
    timestamps: true,
    indexes: [
      {
        fields: ["patient_id"],
        unique: true,
      },
    ],
  }
);

export default Wallet;
