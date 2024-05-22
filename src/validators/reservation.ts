import Joi from "joi";
import {
  AvailableTimeBody,
  AvailableTimesQuery,
  UpdateAvailableTimeBody,
} from "../interface/validators";

export const validateReservationQuery = (queryParams: AvailableTimesQuery) => {
  const schema = Joi.object({
    available_time_date_from: Joi.string()
      .pattern(new RegExp(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/))
      .optional()
      .messages({
        "string.base": "Date from must be a string",
        "string.pattern.base":
          "Date from must be in the format 'YYYY-MM-DD HH:MM:SS'",
      }),
    available_time_date_to: Joi.string()
      .pattern(new RegExp(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/))
      .optional()
      .messages({
        "string.base": "Date to must be a string",
        "string.pattern.base":
          "Date to must be in the format 'YYYY-MM-DD HH:MM:SS'",
      }),
    page: Joi.number().integer().positive().optional().messages({
      "number.base": "Page must be a number",
      "number.integer": "Page must be an integer",
      "number.positive": "Page must be a positive number",
    }),
    per_page: Joi.number()
      .integer()
      .positive()
      .greater(10)
      .optional()
      .messages({
        "number.base": "Per page must be a number",
        "number.integer": "Per page must be an integer",
        "number.positive": "Per page must be a positive number",
        "number.greater": "Per page must be greater than 10",
      }),
  });
  return schema.validate(queryParams, { abortEarly: false });
};
