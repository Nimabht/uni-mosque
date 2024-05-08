import Joi from "joi";
import {
  AvailableTimeBody,
  AvailableTimesQuery,
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

export const validateCreateNewAvailableTimeBody = (
  queryParams: AvailableTimeBody,
) => {
  const schema = Joi.object({
    start_date: Joi.string()
      .pattern(new RegExp(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/))
      .required()
      .messages({
        "string.base": "Date from must be a string",
        "any.required": "start_date is required",
        "string.empty": "start_date cannot be empty",
        "string.pattern.base":
          "Date from must be in the format 'YYYY-MM-DD HH:MM:SS'",
      }),
    end_date: Joi.string()
      .pattern(new RegExp(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/))
      .required()
      .messages({
        "string.base": "Date to must be a string",
        "any.required": "end_date is required",
        "string.empty": "end_date cannot be empty",
        "string.pattern.base":
          "Date to must be in the format 'YYYY-MM-DD HH:MM:SS'",
      }),
  });
  return schema.validate(queryParams, { abortEarly: false });
};
