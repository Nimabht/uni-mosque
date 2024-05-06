import Joi from "joi";
import { UpdateInfo } from "../interface/validators";

export const validateUserForUpdate = (UpdateInfo: UpdateInfo) => {
  const schema = Joi.object<UpdateInfo>({
    first_name: Joi.string().min(3).max(225).optional().messages({
      "string.base": "First name must be a string",
      "string.min": "First name must be at least {#limit} characters long",
      "string.max": "First name must be at most {#limit} characters long",
    }),
    last_name: Joi.string().min(3).max(225).optional().messages({
      "string.base": "Last name must be a string",
      "string.min": "Last name must be at least {#limit} characters long",
      "string.max": "Last name must be at most {#limit} characters long",
    }),
    username: Joi.string().min(1).max(225).optional().messages({
      "string.base": "Username must be a string",
      "string.min": "Username must be at least {#limit} characters long",
      "string.max": "Username must be at most {#limit} characters long",
    }),
    phone_number: Joi.string()
      .optional()
      .pattern(new RegExp("^(\\+98|0)?9\\d{9}$"))
      .messages({
        "string.pattern.base":
          "Phone number must be in Iranian format (starting with +98 or 0 and followed by 9 digits)",
      }),
    role: Joi.string().valid("User").default("User").messages({
      "any.only": 'Role can only be "User"',
    }),
  });
  return schema.validate(UpdateInfo, { abortEarly: false });
};
