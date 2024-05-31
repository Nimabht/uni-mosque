import Joi from "joi";

// Define the interface for comment validation
interface CommentInfo {
  body: string;
  name: string;
  email: string;
  parentId?: number;
  ownerId: number;
  commentableType: "blog" | "journal";
  commentableId: number;
}

export const validateCommentForCreate = (commentInfo: CommentInfo) => {
  // Define the Joi schema for comment validation
  const schema = Joi.object<CommentInfo>({
    body: Joi.string().min(3).max(2000).required().messages({
      "string.base": "Body must be a string",
      "any.required": "Body is required",
      "string.min": "Name must be at least {#limit} characters long",
      "string.max": "Name must be at most {#limit} characters long",
    }),
    name: Joi.string().min(3).max(255).required().messages({
      "string.base": "Name must be a string",
      "string.min": "Name must be at least {#limit} characters long",
      "string.max": "Name must be at most {#limit} characters long",
      "any.required": "Name is required",
    }),
    email: Joi.string().email().optional().messages({
      "string.base": "Email must be a string",
      "string.email": "Email must be a valid email address",
    }),
    parentId: Joi.number().optional().allow(null).messages({
      "number.base": "Parent ID must be a number",
    }),
    commentableType: Joi.string().valid("blog", "journal").required().messages({
      "any.only": 'Commentable type must be either "blog" or "journal"',
      "any.required": "Commentable type is required",
    }),
    commentableId: Joi.number().required().messages({
      "number.base": "Commentable ID must be a number",
      "any.required": "Commentable ID is required",
    }),
  });

  // Validate the comment info against the schema
  return schema.validate(commentInfo, { abortEarly: false });
};

// Define the interface for comment show status validation
interface CommentShowStatus {
  show: boolean;
}

export const validateCommentShowStatus = (
  commentShowStatus: CommentShowStatus,
) => {
  // Define the Joi schema for comment show status validation
  const schema = Joi.object<CommentShowStatus>({
    show: Joi.boolean().required().messages({
      "boolean.base": "Show must be a boolean value",
      "any.required": "Show status is required",
    }),
  });

  // Validate the comment show status against the schema
  return schema.validate(commentShowStatus, { abortEarly: false });
};
