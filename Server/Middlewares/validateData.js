const joi = require('joi');

const signupValidation = async (req, res, next) => {
  const schema = joi.object({
    name: joi.string().min(6).max(100).required(),
    email: joi.string().email().required(),
    // Allowing any characters in password, with length between 4-8
    password: joi.string().min(4).max(12).pattern(/^.*$/).required()
      .messages({
        'string.min': 'Password must be at least 4 characters long',
        'string.max': 'Password cannot exceed 8 characters',
        'string.pattern.base': 'Password can contain any characters',
        'any.required': 'Password is required'
      }),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    return res.json({
      message: "Validation error",
      errors: error.details.map(err => err.message)
    });
  }
  
  next();
};

const loginValidation = async (req, res, next) => {
  const schema = joi.object({
    email: joi.string().email().required(),
    // Using the same password validation as signup
    password: joi.string().min(4).max(12).pattern(/^.*$/).required()
      .messages({
        'string.min': 'Password must be at least 4 characters long',
        'string.max': 'Password cannot exceed 8 characters',
        'string.pattern.base': 'Password can contain any characters',
        'any.required': 'Password is required'
      }),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    return res.json({
      message: "Validation error",
      errors: error.details.map(err => err.message),
    });
  }
  
  next();
};

module.exports = { signupValidation, loginValidation };