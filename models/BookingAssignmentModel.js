const sql = require("mssql");
const dbConfig = require("../dbConfig");

//Get all Booking Assignments
async function getAllBookingAssignments() {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
            SELECT 
                ba.*,
                b.service_type,
                b.preferred_date as booking_date,
                b.service_address,
                c.name as customer_name,
                c.phone as customer_phone,
                t.name as technician_name,
                t.phone as technician_phone
            FROM BookingAssignments ba
            INNER JOIN Bookings b ON ba.booking_id = b.id
            INNER JOIN Customers c ON b.customer_id = c.id
            INNER JOIN Technicians t ON ba.technician_id = t.id
            ORDER BY ba.scheduled_date DESC, ba.assigned_date DESC
        `;
        const result = await connection.request().query(query);

        console.log("Query result:", result.recordset);

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

//Get Booking Assignment by ID
async function getBookingAssignmentById(id) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
            SELECT 
                ba.*,
                b.service_type,
                b.preferred_date,
                b.service_address,
                b.contact_phone,
                b.issue_description,
                c.name as customer_name,
                c.phone as customer_phone,
                c.email as customer_email,
                t.name as technician_name,
                t.phone as technician_phone,
                t.email as technician_email
            FROM BookingAssignments ba
            INNER JOIN Bookings b ON ba.booking_id = b.id
            INNER JOIN Customers c ON b.customer_id = c.id
            INNER JOIN Technicians t ON ba.technician_id = t.id
            WHERE ba.id = @id
        `;
        const request = connection.request();
        request.input("id", sql.Int, id);
        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return null;
        }

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

//Get Booking Assignment by Booking ID
async function getBookingAssignmentByBookingId(bookingId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
            SELECT 
                ba.*,
                t.name as technician_name,
                t.phone as technician_phone,
                t.email as technician_email
            FROM BookingAssignments ba
            INNER JOIN Technicians t ON ba.technician_id = t.id
            WHERE ba.booking_id = @booking_id
        `;
        const request = connection.request();
        request.input("booking_id", sql.Int, bookingId);
        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return null;
        }

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

//Get Booking Assignments by Technician ID
async function getBookingAssignmentsByTechnicianId(technicianId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
            SELECT 
                ba.*,
                b.service_type,
                b.service_address,
                b.contact_phone,
                c.name as customer_name,
                c.phone as customer_phone
            FROM BookingAssignments ba
            INNER JOIN Bookings b ON ba.booking_id = b.id
            INNER JOIN Customers c ON b.customer_id = c.id
            WHERE ba.technician_id = @technician_id
            ORDER BY ba.scheduled_date DESC
        `;
        const request = connection.request();
        request.input("technician_id", sql.Int, technicianId);
        const result = await request.query(query);
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

//Get Booking Assignments by Status
async function getBookingAssignmentsByStatus(status) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
            SELECT 
                ba.*,
                b.service_type,
                b.service_address,
                c.name as customer_name,
                t.name as technician_name
            FROM BookingAssignments ba
            INNER JOIN Bookings b ON ba.booking_id = b.id
            INNER JOIN Customers c ON b.customer_id = c.id
            INNER JOIN Technicians t ON ba.technician_id = t.id
            WHERE ba.status = @status
            ORDER BY ba.scheduled_date ASC
        `;
        const request = connection.request();
        request.input("status", sql.VarChar, status);
        const result = await request.query(query);
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

//Get Booking Assignments by Date
async function getBookingAssignmentsByDate(date) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
            SELECT 
                ba.*,
                b.service_type,
                b.service_address,
                c.name as customer_name,
                c.phone as customer_phone,
                t.name as technician_name
            FROM BookingAssignments ba
            INNER JOIN Bookings b ON ba.booking_id = b.id
            INNER JOIN Customers c ON b.customer_id = c.id
            INNER JOIN Technicians t ON ba.technician_id = t.id
            WHERE ba.scheduled_date = @date
            ORDER BY ba.scheduled_time
        `;
        const request = connection.request();
        request.input("date", sql.Date, date);
        const result = await request.query(query);
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

//Create Booking Assignment
async function createBookingAssignment(assignmentData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);

        const bookingCheckQuery = "SELECT id FROM Bookings WHERE id = @booking_id";
        const bookingCheck = connection.request();
        bookingCheck.input("booking_id", sql.Int, assignmentData.booking_id);
        const bookingResult = await bookingCheck.query(bookingCheckQuery);

        if (bookingResult.recordset.length === 0) {
            throw new Error(`Booking with id ${assignmentData.booking_id} does not exist.`);
        }

        const techCheckQuery = "SELECT id FROM Technicians WHERE id = @technician_id";
        const techCheck = connection.request();
        techCheck.input("technician_id", sql.Int, assignmentData.technician_id);
        const techResult = await techCheck.query(techCheckQuery);

        if (techResult.recordset.length === 0) {
            throw new Error(`Technician with id ${assignmentData.technician_id} does not exist.`);
        }

        const existingCheck = connection.request();
        existingCheck.input("booking_id", sql.Int, assignmentData.booking_id);
        const existingResult = await existingCheck.query(
            "SELECT id FROM BookingAssignments WHERE booking_id = @booking_id"
        );

        if (existingResult.recordset.length > 0) {
            throw new Error(`Booking ${assignmentData.booking_id} is already assigned.`);
        }

        const query = `
            INSERT INTO BookingAssignments (
                booking_id, technician_id, scheduled_date, scheduled_time, notes, status
            )
            VALUES (
                @booking_id, @technician_id, @scheduled_date, @scheduled_time, @notes, 'assigned'
            );
            SELECT SCOPE_IDENTITY() AS id;
        `;

        const request = connection.request();
        request.input("booking_id", sql.Int, assignmentData.booking_id);
        request.input("technician_id", sql.Int, assignmentData.technician_id);
        request.input("scheduled_date", sql.Date, assignmentData.scheduled_date || null);
        request.input("scheduled_time", sql.VarChar, assignmentData.scheduled_time || null);
        request.input("notes", sql.Text, assignmentData.notes || null);

        const result = await request.query(query);
        const newAssignmentId = result.recordset[0].id;

        await connection.request()
            .input("booking_id", sql.Int, assignmentData.booking_id)
            .query("UPDATE Bookings SET status = 'assigned', updated_at = GETDATE() WHERE id = @booking_id");

        return await getBookingAssignmentById(newAssignmentId);
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

//Update Booking Assignment
async function updateBookingAssignment(id, assignmentData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);

        const query = `
            UPDATE BookingAssignments
            SET 
                technician_id = @technician_id,
                scheduled_date = @scheduled_date,
                scheduled_time = @scheduled_time,
                completion_date = @completion_date,
                actual_cost = @actual_cost,
                notes = @notes,
                status = @status
            WHERE id = @id
        `;

        const request = connection.request();
        request.input("id", sql.Int, id);
        request.input("technician_id", sql.Int, assignmentData.technician_id);
        request.input("scheduled_date", sql.Date, assignmentData.scheduled_date || null);
        request.input("scheduled_time", sql.VarChar, assignmentData.scheduled_time || null);
        request.input("completion_date", sql.DateTime2, assignmentData.completion_date || null);
        request.input("actual_cost", sql.Decimal(10, 2), assignmentData.actual_cost || null);
        request.input("notes", sql.Text, assignmentData.notes || null);
        request.input("status", sql.VarChar, assignmentData.status);

        await request.query(query);
        return await getBookingAssignmentById(id);
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

//Update Assignment Status
async function updateAssignmentStatus(id, status) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);

        const getAssignmentQuery = "SELECT booking_id FROM BookingAssignments WHERE id = @id";
        const getRequest = connection.request();
        getRequest.input("id", sql.Int, id);
        const assignmentResult = await getRequest.query(getAssignmentQuery);

        if (assignmentResult.recordset.length === 0) {
            return null;
        }

        const bookingId = assignmentResult.recordset[0].booking_id;

        const updateQuery = `
            UPDATE BookingAssignments
            SET status = @status
            WHERE id = @id
        `;

        const updateRequest = connection.request();
        updateRequest.input("id", sql.Int, id);
        updateRequest.input("status", sql.VarChar, status);
        await updateRequest.query(updateQuery);

        if (status === 'completed') {
            const updateBookingQuery = `
                UPDATE Bookings 
                SET status = 'completed', updated_at = GETDATE() 
                WHERE id = @booking_id
            `;
            const bookingRequest = connection.request();
            bookingRequest.input("booking_id", sql.Int, bookingId);
            await bookingRequest.query(updateBookingQuery);
        }

        const finalQuery = `
            SELECT 
                ba.*,
                b.service_type,
                b.preferred_date,
                b.service_address,
                b.contact_phone,
                c.name as customer_name,
                c.phone as customer_phone,
                c.email as customer_email,
                t.name as technician_name,
                t.phone as technician_phone,
                t.email as technician_email
            FROM BookingAssignments ba
            INNER JOIN Bookings b ON ba.booking_id = b.id
            INNER JOIN Customers c ON b.customer_id = c.id
            INNER JOIN Technicians t ON ba.technician_id = t.id
            WHERE ba.id = @id
        `;
        const finalRequest = connection.request();
        finalRequest.input("id", sql.Int, id);
        const result = await finalRequest.query(finalQuery);

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

//Delete Booking Assignment
async function deleteBookingAssignment(id) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = "DELETE FROM BookingAssignments WHERE id = @id";

        const request = connection.request();
        request.input("id", sql.Int, id);
        await request.query(query);
        return { message: "Booking assignment deleted successfully!" };
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
    getAllBookingAssignments,
    getBookingAssignmentById,
    getBookingAssignmentByBookingId,
    getBookingAssignmentsByTechnicianId,
    getBookingAssignmentsByStatus,
    getBookingAssignmentsByDate,
    createBookingAssignment,
    updateBookingAssignment,
    updateAssignmentStatus,
    deleteBookingAssignment,
};