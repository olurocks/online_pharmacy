import { DataTypes, Model } from "sequelize";
import type { Optional } from "sequelize";
import sequelize from "../database/config.ts";

interface PatientAttributes {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PatientCreationAttributes
  extends Optional<PatientAttributes, "id" | "createdAt" | "updatedAt"> {}

class Patient
  extends Model<PatientAttributes, PatientCreationAttributes>
  implements PatientAttributes
{
  public id!: string;
  public name!: string;
  public email!: string;
  public phone!: string;
  public dateOfBirth!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Patient.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 20],
      },
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isBefore: new Date().toISOString(),
      },
    },
  },
  {
    sequelize,
    modelName: "Patient",
    tableName: "patients",
    timestamps: true,
    indexes: [{ fields: ["email"], unique: true }, { fields: ["name"] }],
  }
);

export default Patient;