import { Request, Response } from "express";
import { Op } from "sequelize";
import { AppointmentSlot, Booking, Patient } from "../models/associations.ts";
import { ServiceType, AppointmentStatus } from "../models/Appointment.ts";
import { AppError, asyncHandler } from "../middleware/errorHandler.ts";
import sequelize from "../database/config.ts";

export const createAppointmentSlot = asyncHandler(
  async (req: Request, res: Response) => {
    const { date, startTime, endTime, serviceType } = req.body;

    if (startTime >= endTime) {
      throw new AppError("End time must be after start time", 400);
    }

    const existingSlot = await AppointmentSlot.findOne({
      where: {
        date,
        [Op.or]: [
          {
            startTime: {
              [Op.between]: [startTime, endTime],
            },
          },
          {
            endTime: {
              [Op.between]: [startTime, endTime],
            },
          },
          {
            [Op.and]: [
              { startTime: { [Op.lte]: startTime } },
              { endTime: { [Op.gte]: endTime } },
            ],
          },
        ],
      },
    });

    if (existingSlot) {
      throw new AppError(
        "Time slot conflicts with existing appointment slot",
        409
      );
    }

    const appointmentSlot = await AppointmentSlot.create({
      date,
      startTime,
      endTime,
      serviceType,
      status: AppointmentStatus.AVAILABLE,
    });

    res.status(201).json({
      success: true,
      message: "Appointment slot created successfully",
      data: appointmentSlot,
    });
  }
);

export const getAppointmentSlots = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      date,
      serviceType,
      status = "available",
      page = 1,
      limit = 10,
    } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};

    if (date) {
      whereClause.date = date;
    }

    if (serviceType) {
      whereClause.serviceType = serviceType;
    }

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: slots } = await AppointmentSlot.findAndCountAll({
      where: whereClause,
      limit: Number(limit),
      offset,
      order: [
        ["date", "ASC"],
        ["startTime", "ASC"],
      ],
    });

    res.json({
      success: true,
      message: "Appointment slots retrieved successfully",
      data: slots,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        totalItems: count,
        itemsPerPage: Number(limit),
      },
    });
  }
);

export const getAvailableSlots = asyncHandler(
  async (req: Request, res: Response) => {
    const { date, serviceType } = req.query;

    const whereClause: any = {
      status: AppointmentStatus.AVAILABLE,
    };

    if (date) {
      whereClause.date = date;
    }

    if (serviceType) {
      whereClause.serviceType = serviceType;
    }

    const slots = await AppointmentSlot.findAll({
      where: whereClause,
      order: [
        ["date", "ASC"],
        ["startTime", "ASC"],
      ],
    });

    res.json({
      success: true,
      message: "Available appointment slots retrieved successfully",
      data: slots,
    });
  }
);

export const updateAppointmentSlot = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const slot = await AppointmentSlot.findByPk(id);

    if (!slot) {
      throw new AppError("Appointment slot not found", 404);
    }

    if (slot.status === AppointmentStatus.BOOKED) {
      throw new AppError("Cannot update booked appointment slot", 400);
    }

    await slot.update(updateData);

    res.json({
      success: true,
      message: "Appointment slot updated successfully",
      data: slot,
    });
  }
);

export const bookAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    const { patientId, slotId, notes } = req.body;

    const transaction = await sequelize.transaction();

    try {
      const patient = await Patient.findByPk(patientId, { transaction });
      if (!patient) {
        throw new AppError("Patient not found", 404);
      }

      const slot = await AppointmentSlot.findByPk(slotId, { transaction });
      if (!slot) {
        throw new AppError("Appointment slot not found", 404);
      }

      if (!slot.isAvailable()) {
        throw new AppError("Appointment slot is not available", 400);
      }

      const booking = await Booking.create(
        {
          patientId,
          slotId,
          notes,
          status: AppointmentStatus.BOOKED,
        },
        { transaction }
      );

      slot.status = AppointmentStatus.BOOKED;
      await slot.save({ transaction });

      await transaction.commit();

      const completeBooking = await Booking.findByPk(booking.id, {
        include: [
          {
            model: Patient,
            as: "patient",
            attributes: ["id", "name", "email", "phone"],
          },
          {
            model: AppointmentSlot,
            as: "slot",
            attributes: ["id", "date", "startTime", "endTime", "serviceType"],
          },
        ],
      });

      res.status(201).json({
        success: true,
        message: "Appointment booked successfully",
        data: completeBooking,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
);

export const getBookings = asyncHandler(async (req: Request, res: Response) => {
  const { patientId, status, date, page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const whereClause: any = {};

  if (patientId) {
    whereClause.patientId = patientId;
  }

  if (status) {
    whereClause.status = status;
  }

  const slotWhere: any = {};
  if (date) {
    slotWhere.date = date;
  }

  const { count, rows: bookings } = await Booking.findAndCountAll({
    where: whereClause,
    limit: Number(limit),
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Patient,
        as: "patient",
        attributes: ["id", "name", "email", "phone"],
      },
      {
        model: AppointmentSlot,
        as: "slot",
        where: Object.keys(slotWhere).length > 0 ? slotWhere : undefined,
        attributes: ["id", "date", "startTime", "endTime", "serviceType"],
      },
    ],
  });

  res.json({
    success: true,
    message: "Bookings retrieved successfully",
    data: bookings,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(count / Number(limit)),
      totalItems: count,
      itemsPerPage: Number(limit),
    },
  });
});

export const getBookingById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Patient,
          as: "patient",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: AppointmentSlot,
          as: "slot",
          attributes: ["id", "date", "startTime", "endTime", "serviceType"],
        },
      ],
    });

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    res.json({
      success: true,
      message: "Booking retrieved successfully",
      data: booking,
    });
  }
);

export const cancelBooking = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const transaction = await sequelize.transaction();

    try {
      const booking = await Booking.findByPk(id, {
        include: [
          {
            model: AppointmentSlot,
            as: "slot",
          },
        ],
        transaction,
      });

      if (!booking) {
        throw new AppError("Booking not found", 404);
      }

      if (booking.status === AppointmentStatus.CANCELLED) {
        throw new AppError("Booking is already cancelled", 400);
      }

      if (booking.status === AppointmentStatus.COMPLETED) {
        throw new AppError("Cannot cancel completed booking", 400);
      }

      booking.status = AppointmentStatus.CANCELLED;
      await booking.save({ transaction });

      const slot = (booking as any).slot;
      if (slot) {
        slot.status = AppointmentStatus.AVAILABLE;
        await slot.save({ transaction });
      }

      await transaction.commit();

      res.json({
        success: true,
        message: "Booking cancelled successfully",
        data: booking,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
);

export const getPatientBookings = asyncHandler(
  async (req: Request, res: Response) => {
    const { patientId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      throw new AppError("Patient not found", 404);
    }

    const whereClause: any = { patientId };

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: bookings } = await Booking.findAndCountAll({
      where: whereClause,
      limit: Number(limit),
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: AppointmentSlot,
          as: "slot",
          attributes: ["id", "date", "startTime", "endTime", "serviceType"],
        },
      ],
    });

    res.json({
      success: true,
      message: "Patient bookings retrieved successfully",
      data: bookings,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        totalItems: count,
        itemsPerPage: Number(limit),
      },
    });
  }
);
