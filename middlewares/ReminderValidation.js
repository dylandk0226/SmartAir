const Joi = require('joi');

// Validation schema for Reminder
const reminderSchema = Joi.object({
    service_record_id: Joi.number().integer().min(1).required().messages({
        'number.base': '"service_record_id" must be a number',
        'any.required': '"service_record_id" is required',
    }),
    
    reminder_date: Joi.date().iso().required().messages({
        'date.base': '"reminder_date" must be a valid date',
        'any.required': '"reminder_date" is required',
    }),
    
    note: Joi.string().max(1000).optional().messages({
        'string.base': '"note" must be a string',
        'string.max': '"note" cannot exceed 1000 characters',
    }),
    
    sent: Joi.boolean().optional().default(false),
});

// Middleware to validate reminder data
function validateReminder(req, res, next) {
    const { error, value } = reminderSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join('\n');
        return res.status(400).json({ error: errorMessage });
    }

    req.body = value;
    next();
}

module.exports = { 
    validateReminder 
};
