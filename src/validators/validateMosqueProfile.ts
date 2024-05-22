import Joi from "joi";

interface MosqueProfile {
  enabled: boolean;
  description: string;
  phoneNumbers: string; // Assuming this is a JSON string
  email: string;
  address: string;
  logo: string;
}

export const validateMosqueProfile = (profile: MosqueProfile) => {
  const schema = Joi.object<MosqueProfile>({
    description: Joi.string().min(10).max(5000).required().messages({
      "string.base": "Description must be a string",
      "string.min": "Description must be at least {#limit} characters long",
      "string.max": "Description must be at most {#limit} characters long",
      "any.required": "Description is required",
    }),
    phoneNumbers: Joi.string().required().messages({
      "string.base": "Phone numbers must be a string",
      "any.required": "Phone numbers are required",
    }),
    email: Joi.string().email().required().messages({
      "string.base": "Email must be a string",
      "string.email": "Email must be a valid email address",
      "any.required": "Email is required",
    }),
    address: Joi.string().min(5).max(1000).required().messages({
      "string.base": "Address must be a string",
      "string.min": "Address must be at least {#limit} characters long",
      "string.max": "Address must be at most {#limit} characters long",
      "any.required": "Address is required",
    }),
  });

  return schema.validate(profile, { abortEarly: false });
};
