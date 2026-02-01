const Joi = require("joi");

const AirconUnitSchema = Joi.object({
    customer_id: Joi.number().integer().required().messages({
        "number.base": "Customer ID must be a number",
        "any.required": "Customer ID is required",
    }),

    brand: Joi.string().min(1).max(50).required().messages({
        "string.base": "Brand must be a string",
        "string.empty": "Brand cannot be empty",
        "string.min": "Brand must be at least 1 character long",
        "string.max": "Brand cannot exceed 50 characters",
        "any.required": "Brand is required",
    }),

    model: Joi.string().min(1).max(50).required().messages({
        "string.base": "Model must be a string",
        "string.empty": "Model cannot be empty",
        "string.min": "Model must be at least 1 character long",
        "string.max": "Model cannot exceed 50 characters",
        "any.required": "Model is required",
    }),

    serial_number: Joi.string().min(1).max(100).required().messages({
        "string.base": "Serial number must be a string",
        "string.empty": "Serial number cannot be empty",
        "string.min": "Serial number must be at least 1 character long",
        "string.max": "Serial number cannot exceed 100 characters",
        "any.required": "Serial number is required",
    }),

    purchase_date: Joi.date().iso().required().messages({
        "date.base": "Purchase date must be a valid date",
        "date.format": "Purchase date must be in format (YYYY-MM-DD)",
        "any.required": "Purchase date is required",
    }),

    warranty_expiry: Joi.date().iso().required().messages({
        "date.base": "Warranty expiry must be a valid date",
        "date.format": "Warranty expiry must be in format (YYYY-MM-DD)",
        "any.required": "Warranty expiry date is required",
    }),

    installation_address: Joi.string().min(5).max(255).required().messages({
        "string.base": "Installation address must be a string",
        "string.empty": "Installation address cannot be empty",
        "string.min": "Installation address must be at least 5 characters long",
        "string.max": "Installation address cannot exceed 255 characters",
        "any.required": "Installation address is required",
    }),

});

function validateAirconUnit(req, res, next){
    const {error} = AirconUnitSchema.validate(req.body, {abortEarly: false});

    if (error){
        const errorMessage = error.details.map((detail) => detail.message).join(",");
        return res.status(400).json({error: errorMessage});
    }

    next();
}

function validateAirconUnitId(req, res, next){
    const id = req.params.id;

    if (isNaN(id) || parseFloat(id) !== parseInt(id) || parseInt(id) <= 0){
        return res.status(400).json({error: "Invalid aircon unit ID. ID must be a positive number"});
    }

    next();
}

module.exports ={
    validateAirconUnit,
    validateAirconUnitId,
};