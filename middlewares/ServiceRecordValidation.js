const Joi = require("joi");

const serviceRecordSchema = Joi.object({
    aircon_unit_id: Joi.number().integer().required().messages({
        "number.base": "Aircon unit ID must be a number",
        "any.required": "Aircon unit ID is required",
    }),
    
    service_date: Joi.date().iso().required().messages({
        "date.base": "Service date must be a valid date",
        "any.required": "Service date is required",
    }),
    
    description: Joi.string().min(1).max(255).required().messages({
        "string.base": "Description must be a string",
        "string.empty": "Description cannot be empty",
        "string.min": "Description must be at least 1 character long",
        "string.max": "Description cannot exceed 255 characters",
        "any.required": "Description is required",
    }),
    
    technician_id: Joi.number().integer().required().messages({
        "number.base": "Technician ID must be a number",
        "any.required": "Technician ID is required",
    }),
    
    next_due_date: Joi.date().iso().required().messages({
        "date.base": "Next due date must be a valid date",
        "any.required": "Next due date is required",
    }),
    
    status: Joi.string().valid("Scheduled", "Completed", "In Progress").required().messages({
        "string.base": "Status must be a string",
        "any.required": "Status is required",
        "any.only": "Status must be one of 'Scheduled', 'Completed', or 'In Progress'",
    })
});


function validateServiceRecord(req, res, next) {
    const { error } = serviceRecordSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(", ");
        return res.status(400).json({ error: errorMessage });
    }
    
    next();
}


function validateServiceRecordId(req, res, next) {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid service record ID. ID must be a positive number" });
    }
    
    next();
}

module.exports = {
    validateServiceRecord,
    validateServiceRecordId,
};
