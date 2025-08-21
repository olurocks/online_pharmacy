import sequelize from "../database/config.ts";
import { DataTypes, Model } from "sequelize";
import type { Optional } from "sequelize";

interface MedicationAttributes {
  id: string;
  name: string;
  stockQuantity: number;
  unitPrice: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MedicationCreationAttributes
  extends Optional<MedicationAttributes, "id" | "createdAt" | "updatedAt"> {}

class Medication
  extends Model<MedicationAttributes, MedicationCreationAttributes>
  implements MedicationAttributes
{
  public id!: string;
  public name!: string;
  public stockQuantity!: number;
  public unitPrice!: number;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Medication.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(250),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 250],
      },
    },

    stockQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: true,
        min: 0,
      },
    },
    unitPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        isInt: true,
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {},
    },
  },
  {
    sequelize,
    modelName: "Medication",
    tableName: "medications",
    timestamps: true,
    indexes: [{ fields: ["name"] }, { fields: ["stockQuantity"] }],
  }
);

export default Medication;
