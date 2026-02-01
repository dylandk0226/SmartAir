const Joi = require("joi");

const bookingAssignmentSchema = Joi.object({
    booking_id: Joi.number().integer().required().messages({
        "number.base": "Booking ID must be a number",
        "any.required": "Booking ID is required",
    }),

    technician_id: Joi.number().integer().required().messages({
        "number.base": "Technician ID must be a number",
        "any.required": "Technician ID is required",
    }),

    scheduled_date: Joi.date().iso().optional().allow(null).messages({
        "date.base": "Scheduled date must be a valid date",
        "date.format": "Scheduled date must be in format (YYYY-MM-DD)",
    }),

    scheduled_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().messages({
        "string.pattern.base": "Scheduled time must be in HH:MM format (e.g., 09:00, 14:30)"
    }),

    estimated_duration: Joi.number().integer().positive().optional().allow(null).messages({
        "number.base": "Estimated duration must be a number",
        "number.positive": "Estimated duration must be a positive number",
    }),

    special_notes: Joi.string().min(1).max(1000).optional().allow(null, "").messages({
        "string.base": "Special notes must be a string",
        "string.min": "Special notes must be at least 1 character long",
        "string.max": "Special notes cannot exceed 1000 characters",
    }),

    status: Joi.string()
        .valid('assigned', 'in_progress', 'completed', 'cancelled')
        .optional()
        .default('pending').messages({
            "string.base": "Status must be a string",
            "any.only": "Status must be one of: assigned, in_progress, completed, cancelled",
        }),
});

const bookingAssignmentUpdateSchema = Joi.object({
    technician_id: Joi.number().integer().optional().messages({
        "number.base": "Technician ID must be a number",
    }),

    scheduled_date: Joi.date().iso().optional().allow(null).messages({
        "date.base": "Scheduled date must be a valid date",
        "date.format": "Scheduled date must be in format (YYYY-MM-DD)",
    }),

    scheduled_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().allow(null, "").messages({
        "string.pattern.base": "Scheduled time must be in HH:MM format (e.g., 09:00, 14:30)"
    }),

    completion_date: Joi.date().iso().optional().allow(null).messages({
        "date.base": "Completion date must be a valid date",
        "date.format": "Completion date must be in ISO format",
    }),

    actual_cost: Joi.number().precision(2).positive().optional().allow(null).messages({
        "number.base": "Actual cost must be a number",
        "number.positive": "Actual cost must be a positive number",
    }),

    notes: Joi.string().min(1).max(1000).optional().allow(null, "").messages({
        "string.base": "Notes must be a string",
        "string.min": "Notes must be at least 1 character long",
        "string.max": "Notes cannot exceed 1000 characters",
    }),

    status: Joi.string().valid("assigned", "in_progress", "completed", "cancelled").optional().messages({
        "string.base": "Status must be a string",
        "any.only": "Status must be one of: assigned, in_progress, completed, cancelled",
    }),
});

function validateBookingAssignment(req, res, next) {
    const { error } = bookingAssignmentSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(", ");
        return res.status(400).json({ error: errorMessage });
    }

    next();
}

function validateBookingAssignmentUpdate(req, res, next) {
    const { error } = bookingAssignmentUpdateSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(", ");
        return res.status(400).json({ error: errorMessage });
    }

    next();
}

function validateBookingAssignmentId(req, res, next) {
    const id = req.params.id;

    if (isNaN(id) || parseFloat(id) !== parseInt(id) || parseInt(id) <= 0) {
        return res.status(400).json({ error: "Invalid booking assignment ID. ID must be a positive number" });
    }

    next();
}

module.exports = {
    validateBookingAssignment,
    validateBookingAssignmentUpdate,
    validateBookingAssignmentId,
};