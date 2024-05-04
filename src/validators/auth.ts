import Joi from "joi";
import { LoginInfo, SignupInfo } from "../interface/validators";

export const validateUserForLogin = (loginInfo: LoginInfo) => {
  const schema = Joi.object({
    username: Joi.string().required().messages({
      "any.required": "Username is required",
      "string.empty": "Username cannot be empty",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
      "string.empty": "Password cannot be empty",
    }),
  });

  return schema.validate(loginInfo, {
    abortEarly: false,
  });
};

export const validateUserForSignup = (SignupInfo: SignupInfo) => {
  const schema = Joi.object({
    first_name: Joi.string().min(3).max(225).required().messages({
      "string.base": "First name must be a string",
      "string.empty": "First name cannot be empty",
      "string.min": "First name must be at least {#limit} characters long",
      "string.max": "First name must be at most {#limit} characters long",
      "any.required": "First name is required",
    }),
    last_name: Joi.string().min(3).max(225).required().messages({
      "string.base": "Last name must be a string",
      "string.empty": "Last name cannot be empty",
      "string.min": "Last name must be at least {#limit} characters long",
      "string.max": "Last name must be at most {#limit} characters long",
      "any.required": "Last name is required",
    }),
    username: Joi.string().min(1).max(225).required().messages({
      "string.base": "Username must be a string",
      "string.empty": "Username cannot be empty",
      "string.min": "Username must be at least {#limit} characters long",
      "string.max": "Username must be at most {#limit} characters long",
      "any.required": "Username is required",
    }),
    password: Joi.string()
      .min(8)
      .max(255)
      .pattern(/^(?=.*[a-zA-Z])(?=.*\d)/)
      .required()
      .messages({
        "string.base": "Password should be a string",
        "string.empty": "Password is required",
        "string.min": "Password should have a minimum length of {#limit}",
        "any.required": "Password is required",
        "string.pattern.base":
          "Password should have at least one letter and one number",
      }),
    repeat_password: Joi.any().valid(Joi.ref("password")).required().messages({
      "any.only": "password confirmation and password don't match ",
    }),
    phone_number: Joi.string()
      .required()
      .pattern(new RegExp("^(\\+98|0)?9\\d{9}$"))
      .messages({
        "string.empty": "Phone number is required",
        "string.pattern.base":
          "Phone number must be in Iranian format (starting with +98 or 0 and followed by 9 digits)",
      }),
    role: Joi.string().valid("User").default("User").messages({
      "any.only": 'Role can only be "User"',
    }),
  });
  return schema.validate(SignupInfo, { abortEarly: false });
};
