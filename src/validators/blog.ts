import Joi from "joi";

export const validateBlogForCreate = (CreateInfo: any) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(255).required().messages({
      "string.base": "Title must be a string",
      "string.min": "Title must be at least {#limit} characters long",
      "string.max": "Title must be at most {#limit} characters long",
      "any.required": "Title is required",
    }),
    content: Joi.string().optional().messages({
      "string.base": "Content must be a string",
    }),
  });
  return schema.validate(CreateInfo, { abortEarly: false });
};

export const validateBlogForUpdate = (CreateInfo: any) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(255).required().messages({
      "string.base": "Title must be a string",
      "string.min": "Title must be at least {#limit} characters long",
      "string.max": "Title must be at most {#limit} characters long",
      "any.required": "Title is required",
    }),
    content: Joi.string().optional().messages({
      "string.base": "Content must be a string",
    }),
    comments_enabled: Joi.boolean().optional().default(false).messages({
      "boolean.base": "Comments enabled must be a boolean",
    }),
  });
  return schema.validate(CreateInfo, { abortEarly: false });
};
