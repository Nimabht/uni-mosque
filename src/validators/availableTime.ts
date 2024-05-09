import Joi from "joi";
import {
  AvailableTimeBody,
  AvailableTimesQuery,
  UpdateAvailableTimeBody,
} from "../interface/validators";

export const validateAvailableTimesQuery = (
  queryParams: AvailableTimesQuery,
) => {
  const schema = Joi.object({
    date_from: Joi.string()
      .pattern(new RegExp(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/))
      .optional()
      .messages({
        "string.base": "Date from must be a string",
        "string.pattern.base":
          "Date from must be in the format 'YYYY-MM-DD HH:MM:SS'",
      }),
    date_to: Joi.string()
      .pattern(new RegExp(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/))
      .optional()
      .messages({
        "string.base": "Date to must be a string",
        "string.pattern.base":
          "Date to must be in the format 'YYYY-MM-DD HH:MM:SS'",
      }),
  });
  return schema.validate(queryParams, { abortEarly: false });
};

export const validateCreateNewAvailableTimeBody = (body: AvailableTimeBody) => {
  const schema = Joi.object({
    start_date: Joi.string()
      .pattern(new RegExp(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/))
      .required()
      .messages({
        "string.base": "Start date must be a string",
        "any.required": "Start date is required",
        "string.empty": "Start date cannot be empty",
        "string.pattern.base":
          "Start date must be in the format 'YYYY-MM-DD HH:MM:SS'",
      }),
    end_date: Joi.string()
      .pattern(new RegExp(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/))
      .required()
      .messages({
        "string.base": "End date must be a string",
        "any.required": "End date is required",
        "string.empty": "End date cannot be empty",
        "string.pattern.base":
          "End date must be in the format 'YYYY-MM-DD HH:MM:SS'",
      }),
    price: Joi.number().required().messages({
      "number.base": "Price must be a number",
      "any.required": "Price is required",
    }),
    description: Joi.string().allow("").max(5000).optional().messages({
      "string.base": "Description must be a string",
    }),
  });
  return schema.validate(body, { abortEarly: false });
};

export const validateUpdateAvailableTimeBody = (
  body: UpdateAvailableTimeBody,
) => {
  const schema = Joi.object({
    price: Joi.number().optional().messages({
      "number.base": "Price must be a number",
    }),
    description: Joi.string().allow("").max(5000).optional().messages({
      "string.base": "Description must be a string",
      "string.max": "Description cannot exceed 5000 characters",
    }),
  });
  return schema.validate(body, { abortEarly: false });
};
