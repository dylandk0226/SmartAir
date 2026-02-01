const ReminderModel = require('../models/ReminderModel');

// Create a new reminder
async function createReminder(req, res) {
    try {
        const newReminder = await ReminderModel.createReminder(req.body);
        res.status(201).json(newReminder);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error creating reminder" });
    }
}


// Get all reminders
async function getAllReminders(req, res) {
    try {
        const reminders = await ReminderModel.getAllReminders()
        res.json(reminders);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving reminders" });
    }
}


// Get a reminder by ID
async function getReminderById(req, res) {
    try {
        const id = parseInt(req.params.id);
        const reminder = await ReminderModel.getReminderById(id);
        if (!reminder) {
            return res.status(404).json({ error: "Reminder not found" });
        }
        
        res.json(reminder);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving reminder" });
    }
}


// Update a reminder by ID
async function updateReminder(req, res) {
    try {
        const id = parseInt(req.params.id);
        const updatedReminder = await ReminderModel.updateReminder(id, req.body);
        if (!updatedReminder) {
            return res.status(404).json({ error: "Reminder not found" });
        }

        res.json(updatedReminder);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error updating reminder" });
    }
}


// Delete a reminder by ID
async function deleteReminder(req, res) {
    try {
        const id = parseInt(req.params.id);
        const result = await ReminderModel.deleteReminder(id);
        
        res.json(result);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error deleting reminder" });
    }
}

module.exports = {
    createReminder,
    getAllReminders,
    getReminderById,
    updateReminder,
    deleteReminder,
};
