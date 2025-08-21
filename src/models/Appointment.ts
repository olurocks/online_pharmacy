import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database/config.ts";

export enum ServiceType {
  CONSULTATION = "consultation",
  PICKUP = "pickup",
}

export enum AppointmentStatus {
  AVAILABLE = "available",
  BOOKED = "booked",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

// Appointment Slot Model
interface AppointmentSlotAttributes {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  serviceType: ServiceType;
  status: AppointmentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AppointmentSlotCreationAttributes
  extends Optional<
    AppointmentSlotAttributes,
    "id" | "status" | "createdAt" | "updatedAt"
  > {}

class AppointmentSlot
  extends Model<AppointmentSlotAttributes, AppointmentSlotCreationAttributes>
  implements AppointmentSlotAttributes
{
  public id!: string;
  public date!: Date;
  public startTime!: string;
  public endTime!: string;
  public serviceType!: ServiceType;
  public status!: AppointmentStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public isAvailable(): boolean {
    return this.status === AppointmentStatus.AVAILABLE;
  }
}

AppointmentSlot.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
      field: "start_time",
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
      field: "end_time",
    },
    serviceType: {
      type: DataTypes.ENUM(...Object.values(ServiceType)),
      allowNull: false,
      field: "service_type",
    },
    status: {
      type: DataTypes.ENUM(...Object.values(AppointmentStatus)),
      allowNull: false,
      defaultValue: AppointmentStatus.AVAILABLE,
    },
  },
  {
    sequelize,
    modelName: "AppointmentSlot",
    tableName: "appointment_slots",
    underscored: true,
    timestamps: true,
    indexes: [
      {
        fields: ["date"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["service_type"],
      },
      {
        fields: ["date", "start_time", "end_time"],
        unique: true,
      },
    ],
  }
);

// Booking Model
interface BookingAttributes {
  id: string;
  patientId: string;
  slotId: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BookingCreationAttributes
  extends Optional<
    BookingAttributes,
    "id" | "notes" | "status" | "createdAt" | "updatedAt"
  > {}

class Booking
  extends Model<BookingAttributes, BookingCreationAttributes>
  implements BookingAttributes
{
  public id!: string;
  public patientId!: string;
  public slotId!: string;
  public notes?: string;
  public status!: AppointmentStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Booking.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
    slotId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "appointment_slots",
        key: "id",
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(AppointmentStatus)),
      allowNull: false,
      defaultValue: AppointmentStatus.BOOKED,
    },
  },
  {
    sequelize,
    modelName: "Booking",
    tableName: "bookings",
    underscored: true,
    timestamps: true,
    indexes: [
      {
        fields: ["patient_id"],
      },
      {
        fields: ["slot_id"],
      },
      {
        fields: ["status"],
      },
    ],
  }
);

export { AppointmentSlot, Booking };
