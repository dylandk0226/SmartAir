const { sql, dbConfig } = require('../dbConfig');

// Create a new reminder
async function createReminder(reminderData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `Insert into Reminders (service_record_id, reminder_date, sent, note)
        values (@service_record_id, @reminder_date, @sent, @note);
        Select SCOPE_IDENTITY() AS id;
        `;
        
        const request = connection.request();
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
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }

}

// Get all reminders
async function getAllReminders() {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = 'Select * from Reminders';
        const result = await connection.request().query(query);
        
        return result.recordset;
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }

}

// Get reminder by ID
async function getReminderById(id) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = 'Select * from Reminders where id = @id';
        const request = connection.request();
        request.input('id', sql.Int, id);
        const result = await request.query(query);
        return result.recordset[0];
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }

}


// Update a reminder by ID
async function updateReminder(id, reminderData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `Update Reminders
        Set service_record_id = @service_record_id,
        reminder_date = @reminder_date,
        sent = @sent,
        note = @note
        where id = @id;
        `;
        
        const request = connection.request();
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
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }

}


// Delete a reminder by ID
async function deleteReminder(id) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = 'Delete from Reminders where id = @id';
        const request = connection.request();
        
        request.input('id', sql.Int, id);
        await request.query(query);
        return { message: `Reminder with id ${id} deleted` };
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }

}


module.exports = {
    createReminder,
    getAllReminders,
    getReminderById,
    updateReminder,
    deleteReminder,
};