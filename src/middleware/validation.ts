import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { AppError } from "./errorHandler.ts";

export const validate = (
  schema: Joi.ObjectSchema,
  source: "body" | "query" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[source];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        value: detail.context?.value,
      }));

      return next(new AppError("Validation Error", 400));
    }

    (req as any).validatedData = value;
    next();
  };
};
