import { Model, DataTypes } from "sequelize";
import { Optional } from "sequelize";
import sequelize from "../database/config.ts";

export enum PrescriptionStatus {
  PENDING = "pending",
  FILLED = "filled",
  PICKED_UP = "picked-up",
}
interface PrescriptionAttributes {
  id: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  quantity: number;
  status: PrescriptionStatus;
  instructions?: string;
  prescribedBy?: string;
  totalAmount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PrescriptionCreationAttributes
  extends Optional<
    PrescriptionAttributes,
    | "id"
    | "instructions"
    | "prescribedBy"
    | "totalAmount"
    | "createdAt"
    | "updatedAt"
  > {}

class Prescription
  extends Model<PrescriptionAttributes, PrescriptionCreationAttributes>
  implements PrescriptionAttributes
{
  public id!: string;
  public patientId!: string;
  public medicationName!: string;
  public dosage!: string;
  public quantity!: number;
  public status!: PrescriptionStatus;
  public instructions?: string;
  public prescribedBy?: string;
  public totalAmount?: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Prescription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "patients",
        key: "id",
      },
    },
    medicationName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 200],
      },
    },
    dosage: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1,
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PrescriptionStatus)),
      allowNull: false,
      defaultValue: PrescriptionStatus.PENDING,
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    prescribedBy: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
        isDecimal: true,
      },
    },
  },
  {
    sequelize,
    modelName: "Prescription",
    tableName: "prescriptions",
    indexes: [
      {
        fields: ["patientId"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["medicationName"],
      },
    ],
  }
);

export default Prescription;
