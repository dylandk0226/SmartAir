const Joi = require("joi");

const bookingSchema = Joi.object({
    customer_id: Joi.number().integer().optional().messages({
        "number.base": "Customer ID must be a number",
    }),

    aircon_unit_id: Joi.number().integer().optional().allow(null).messages({
        "number.base": "Aircon unit ID must be a number",
    }),

    service_type: Joi.string().valid("maintenance", "repair", "installation", "inspection").required().messages({
        "string.base": "Service type must be a string",
        "any.only": "Service type must be one of: maintenance, repair, installation, inspection",
        "any.required": "Service type is required",
    }),

    preferred_date: Joi.date().iso().min("now").required().messages({
        "date.base": "Preferred date must be a valid date",
        "date.format": "Preferred date must be in format (YYYY-MM-DD)",
        "date.min": "Preferred date must be today or in the future",
        "any.required": "Preferred date is required",
    }),

    preferred_time: Joi.string().valid("morning", "afternoon", "evening").required().messages({
        "string.base": "Preferred time must be a string",
        "any.only": "Preferred time must be one of: morning, afternoon, evening",
        "any.required": "Preferred time is required",
    }),

    service_address: Joi.string().min(5).max(500).required().messages({
        "string.base": "Service address must be a string",
        "string.empty": "Service address cannot be empty",
        "string.min": "Service address must be at least 5 characters long",
        "string.max": "Service address cannot exceed 500 characters",
        "any.required": "Service address is required",
    }),

    postal_code: Joi.string().pattern(/^\d{6}$/).optional().allow(null, "").messages({
        "string.base": "Postal code must be a string",
        "string.pattern.base": "Postal code must be 6 digits",
    }),

    contact_phone: Joi.string().pattern(/^[0-9]{8}$/).required().messages({
        "string.base": "Contact phone must be a string of numbers",
        "string.empty": "Contact phone cannot be empty",
        "string.pattern.base": "Contact phone must be 8 digits",
        "any.required": "Contact phone is required",
    }),

    aircon_brand: Joi.string().min(1).max(50).optional().allow(null, "").messages({
        "string.base": "Aircon brand must be a string",
        "string.min": "Aircon brand must be at least 1 character long",
        "string.max": "Aircon brand cannot exceed 50 characters",
    }),

    aircon_model: Joi.string().min(1).max(50).optional().allow(null, "").messages({
        "string.base": "Aircon model must be a string",
        "string.min": "Aircon model must be at least 1 character long",
        "string.max": "Aircon model cannot exceed 50 characters",
    }),

    issue_description: Joi.string().min(5).max(1000).optional().allow(null, "").messages({
        "string.base": "Issue description must be a string",
        "string.min": "Issue description must be at least 5 characters long",
        "string.max": "Issue description cannot exceed 1000 characters",
    }),

    technician_id: Joi.number().integer().optional().allow(null, "").messages({
        "number.base": "Technician ID must be a number",
    }),
});

const bookingUpdateSchema = Joi.object({
    service_type: Joi.string().valid("maintenance", "repair", "installation", "inspection").optional().messages({
        "string.base": "Service type must be a string",
        "any.only": "Service type must be one of: maintenance, repair, installation, inspection",
    }),

    preferred_date: Joi.date().iso().min("now").optional().messages({
        "date.base": "Preferred date must be a valid date",
        "date.format": "Preferred date must be in format (YYYY-MM-DD)",
        "date.min": "Preferred date must be today or in the future",
    }),

    preferred_time: Joi.string().valid("morning", "afternoon", "evening").optional().messages({
        "string.base": "Preferred time must be a string",
        "any.only": "Preferred time must be one of: morning, afternoon, evening",
    }),

    service_address: Joi.string().min(5).max(500).optional().messages({
        "string.base": "Service address must be a string",
        "string.min": "Service address must be at least 5 characters long",
        "string.max": "Service address cannot exceed 500 characters",
    }),

    postal_code: Joi.string().pattern(/^\d{6}$/).optional().allow(null, "").messages({
        "string.base": "Postal code must be a string",
        "string.pattern.base": "Postal code must be 6 digits",
    }),

    contact_phone: Joi.string().pattern(/^[0-9]{8}$/).optional().messages({
        "string.base": "Contact phone must be a string of numbers",
        "string.pattern.base": "Contact phone must be 8 digits",
    }),

    aircon_brand: Joi.string().min(1).max(50).optional().allow(null, "").messages({
        "string.base": "Aircon brand must be a string",
        "string.min": "Aircon brand must be at least 1 character long",
        "string.max": "Aircon brand cannot exceed 50 characters",
    }),

    aircon_model: Joi.string().min(1).max(50).optional().allow(null, "").messages({
        "string.base": "Aircon model must be a string",
        "string.min": "Aircon model must be at least 1 character long",
        "string.max": "Aircon model cannot exceed 50 characters",
    }),

    issue_description: Joi.string().min(5).max(1000).optional().allow(null, "").messages({
        "string.base": "Issue description must be a string",
        "string.min": "Issue description must be at least 5 characters long",
        "string.max": "Issue description cannot exceed 1000 characters",
    }),

    status: Joi.string().valid("pending", "confirmed", "assigned", "in_progress", "completed", "cancelled").optional().messages({
        "string.base": "Status must be a string",
        "any.only": "Status must be one of: pending, confirmed, assigned, in_progress, completed, cancelled",
    }),

    technician_id: Joi.number().integer().optional().allow(null, "").messages({
        "number.base": "Technician ID must be a number",
    }),
});

function validateBooking(req, res, next) {
    const { error } = bookingSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(", ");
        return res.status(400).json({ error: errorMessage });
    }

    next();
}

function validateBookingUpdate(req, res, next) {
    const { error } = bookingUpdateSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(", ");
        return res.status(400).json({ error: errorMessage });
    }

    next();
}

function validateBookingId(req, res, next) {
    const id = req.params.id;

    if (isNaN(id) || parseFloat(id) !== parseInt(id) || parseInt(id) <= 0) {
        return res.status(400).json({ error: "Invalid booking ID. ID must be a positive number" });
    }

    next();
}

module.exports = {
    validateBooking,
    validateBookingUpdate,
    validateBookingId,
};