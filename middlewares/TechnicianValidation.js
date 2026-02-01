const Joi = require("joi");

const technicianSchema = Joi.object({
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

    user_id: Joi.number().integer().positive().optional().messages({
        "number.base": "User ID must be a number",
        "number.integer": "User ID must be an integer",
        "number.positive": "User ID must be a positive number",
    }),
});

function validateTechnician(req, res, next){
    const {error} = technicianSchema.validate(req.body, {abortEarly: false});

    if (error){
        const errorMessage = error.details.map((detail) => detail.message).join(",");
        return res.status(400).json({error: errorMessage});
    }

    next();
}

function validateTechnicianId(req, res, next){
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0){
        return res.status(400).json({error: "Invalid technician ID. ID must be a positive number"});
    }

    next();

}

module.exports ={
    validateTechnician,
    validateTechnicianId,
};