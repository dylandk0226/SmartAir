const Joi = require("joi");

// Existing customer schema (for creating customer records)
const customerSchema = Joi.object({
    name: Joi.string().min(1).max(100).required().messages({
        "string.base": "Name must be string",
        "string.empty": "Name cannot be empty",
        "string.min": "Name must be at least 1 character long",
        "string.max": "Name cannot exceed 100 characters",
        "any.required": "Name is required",
    }),

    phone: Joi.string().pattern(/^[0-9]{8}$/).required().messages({
        "string.base": "Phone must be a string of numbers",
        "string.empty": "Phone cannot be empty",
        "string.pattern.base": "Phone must be 8 digits",
        "any.required": "Phone is required",
    }),

    email: Joi.string().email().required().messages({
        "string.base": "Email must be a valid string",
        "string.email": "Email must be a valid email address",
        "string.empty": "Email cannot be empty",
        "any.required": "Email is required",
    }),

    address: Joi.string().min(5).max(255).required().messages({
        "string.base": "Address must be a string",
        "string.empty": "Address cannot be empty",
        "string.min": "Address must be at least 5 characters long",
        "string.max": "Address cannot exceed 255 characters",
        "any.required": "Address is required",
    }),
});

// Customer registration schema
const customerRegistrationSchema = Joi.object({
    username: Joi.string().min(3).max(50).required().messages({
        "string.base": "Username must be a string",
        "string.empty": "Username cannot be empty",
        "string.min": "Username must be at least 3 characters long",
        "string.max": "Username cannot exceed 50 characters",
        "any.required": "Username is required",
    }),

    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            "string.base": "Password must be a string",
            "string.empty": "Password cannot be empty",
            "string.min": "Password must be at least 8 characters long",
            "string.pattern.base": "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number",
            "any.required": "Password is required",
        }),

    name: Joi.string().min(1).max(100).required().messages({
        "string.base": "Name must be string",
        "string.empty": "Name cannot be empty",
        "string.min": "Name must be at least 1 character long",
        "string.max": "Name cannot exceed 100 characters",
        "any.required": "Name is required",
    }),

    phone: Joi.string().pattern(/^[0-9]{8}$/).required().messages({
        "string.base": "Phone must be a string of numbers",
        "string.empty": "Phone cannot be empty",
        "string.pattern.base": "Phone must be 8 digits",
        "any.required": "Phone is required",
    }),

    email: Joi.string().email().required().messages({
        "string.base": "Email must be a valid string",
        "string.email": "Email must be a valid email address",
        "string.empty": "Email cannot be empty",
        "any.required": "Email is required",
    }),

    address: Joi.string().min(5).max(255).required().messages({
        "string.base": "Address must be a string",
        "string.empty": "Address cannot be empty",
        "string.min": "Address must be at least 5 characters long",
        "string.max": "Address cannot exceed 255 characters",
        "any.required": "Address is required",
    }),
});

function validateCustomer(req, res, next) {
    const { error } = customerSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(", ");
        return res.status(400).json({ error: errorMessage });
    }

    next();
}

// Validate customer registration
function validateCustomerRegistration(req, res, next) {
    const { error } = customerRegistrationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(", ");
        return res.status(400).json({ error: errorMessage });
    }

    next();
}

function validateCustomerId(req, res, next) {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid customer ID. ID must be a positive number" });
    }

    next();
}

module.exports = {
    validateCustomer,
    validateCustomerRegistration,
    validateCustomerId,
};