const { sql, getConnection } = require('../dbConfig');

// Create a new reminder
async function createReminder(reminderData) {
    try {
        const pool = await getConnection();
        const query = `Insert into Reminders (service_record_id, reminder_date, sent, note)
        values (@service_record_id, @reminder_date, @sent, @note);
        Select SCOPE_IDENTITY() AS id;
        `;
        
        const request = pool.request();
        request.input('service_record_id', sql.Int, reminderData.service_record_id);
        request.input('reminder_date', sql.Date, reminderData.reminder_date);
        request.input('sent', sql.Bit, reminderData.sent);
        request.input('note', sql.Text, reminderData.note);
        
        const result = await request.query(query);
        const newReminderId = result.recordset[0].id;
        
        return await getReminderById(newReminderId);
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

// Get all reminders
async function getAllReminders() {
    try {
        const pool = await getConnection();
        const query = 'Select * from Reminders';
        const result = await pool.request().query(query);
        
        return result.recordset;
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

// Get reminder by ID
async function getReminderById(id) {
    try {
        const pool = await getConnection();
        const query = 'Select * from Reminders where id = @id';
        const request = pool.request();
        request.input('id', sql.Int, id);
        const result = await request.query(query);
        return result.recordset[0];
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}


// Update a reminder by ID
async function updateReminder(id, reminderData) {
    try {
        const pool = await getConnection();
        const query = `Update Reminders
        Set service_record_id = @service_record_id,
        reminder_date = @reminder_date,
        sent = @sent,
        note = @note
        where id = @id;
        `;
        
        const request = pool.request();
        request.input('id', sql.Int, id);
        request.input('service_record_id', sql.Int, reminderData.service_record_id);
        request.input('reminder_date', sql.Date, reminderData.reminder_date);
        request.input('sent', sql.Bit, reminderData.sent);
        request.input('note', sql.Text, reminderData.note);
        
        await request.query(query);
        return await getReminderById(id);
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}


// Delete a reminder by ID
async function deleteReminder(id) {
    try {
        const pool = await getConnection();
        const query = 'Delete from Reminders where id = @id';
        const request = pool.request();
        
        request.input('id', sql.Int, id);
        await request.query(query);
        return { message: `Reminder with id ${id} deleted` };
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}


module.exports = {
    createReminder,
    getAllReminders,
    getReminderById,
    updateReminder,
    deleteReminder,
};