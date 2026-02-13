const { sql, getConnection } = require('../dbConfig');

//Get all Bookings
async function getAllBookings() {
    try {
        const pool = await getConnection();
        const query = `
            SELECT 
                b.*,
                c.name as customer_name,
                c.phone as customer_phone,
                c.email as customer_email,
                au.brand as unit_brand,
                au.model as unit_model
            FROM Bookings b
            INNER JOIN Customers c ON b.customer_id = c.id
            LEFT JOIN AirconUnits au ON b.aircon_unit_id = au.id
            ORDER BY b.created_at DESC
        `;
        const result = await pool.request().query(query);

        console.log("Query result:", result.recordset);

        return result.recordset;
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

//Get Booking by ID
async function getBookingById(id) {
    try {
        const pool = await getConnection();
        const query = `
            SELECT 
                b.*,
                c.name as customer_name,
                c.phone as customer_phone,
                c.email as customer_email,
                au.brand as unit_brand,
                au.model as unit_model,
                au.serial_number
            FROM Bookings b
            INNER JOIN Customers c ON b.customer_id = c.id
            LEFT JOIN AirconUnits au ON b.aircon_unit_id = au.id
            WHERE b.id = @id
        `;
        const request = pool.request();
        request.input("id", sql.Int, id);
        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return null;
        }

        return result.recordset[0];
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

//Get Bookings by Customer ID
async function getBookingsByCustomerId(customerId) {
    try {
        const pool = await getConnection();
        const query = `
            SELECT 
                b.*,
                au.brand as unit_brand,
                au.model as unit_model
            FROM Bookings b
            LEFT JOIN AirconUnits au ON b.aircon_unit_id = au.id
            WHERE b.customer_id = @customer_id
            ORDER BY b.created_at DESC
        `;
        const request = pool.request();
        request.input("customer_id", sql.Int, customerId);
        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

//Get Bookings by Status
async function getBookingsByStatus(status) {
    try {
        const pool = await getConnection();
        const query = `
            SELECT 
                b.*,
                c.name as customer_name,
                c.phone as customer_phone,
                au.brand as unit_brand,
                au.model as unit_model
            FROM Bookings b
            INNER JOIN Customers c ON b.customer_id = c.id
            LEFT JOIN AirconUnits au ON b.aircon_unit_id = au.id
            WHERE b.status = @status
            ORDER BY b.preferred_date ASC
        `;
        const request = pool.request();
        request.input("status", sql.VarChar, status);
        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

//Get Bookings with Filters
async function getBookingsWithFilters(filters) {
    try {
        const pool = await getConnection();

        let query = `
            SELECT 
                b.*,
                c.name as customer_name,
                c.phone as customer_phone,
                c.email as customer_email,
                au.brand as unit_brand,
                au.model as unit_model
            FROM Bookings b
            INNER JOIN Customers c ON b.customer_id = c.id
            LEFT JOIN AirconUnits au ON b.aircon_unit_id = au.id
            WHERE 1=1
        `;
        const request = pool.request();

        if (filters.customer_id) {
            query += " AND b.customer_id = @customer_id";
            request.input("customer_id", sql.Int, filters.customer_id);
        }

        if (filters.status) {
            query += " AND b.status = @status";
            request.input("status", sql.VarChar, filters.status);
        }

        if (filters.service_type) {
            query += " AND b.service_type = @service_type";
            request.input("service_type", sql.VarChar, filters.service_type);
        }

        if (filters.start_date) {
            query += " AND b.preferred_date >= @start_date";
            request.input("start_date", sql.Date, filters.start_date);
        }

        if (filters.end_date) {
            query += " AND b.preferred_date <= @end_date";
            request.input("end_date", sql.Date, filters.end_date);
        }

        query += " ORDER BY b.created_at DESC";

        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

//Create new Booking
async function createBooking(bookingData) {
    try {
        const pool = await getConnection();

        const customerCheckQuery = "SELECT id FROM Customers WHERE id = @customer_id";
        const customerCheck = pool.request();
        customerCheck.input("customer_id", sql.Int, bookingData.customer_id);
        const customerResult = await customerCheck.query(customerCheckQuery);

        if (customerResult.recordset.length === 0) {
            throw new Error(`Customer with id ${bookingData.customer_id} does not exist in database.`);
        }

        if (bookingData.aircon_unit_id) {
            const unitCheckQuery = `
                SELECT id FROM AirconUnits 
                WHERE id = @aircon_unit_id AND customer_id = @customer_id
            `;
            const unitCheck = pool.request();
            unitCheck.input("aircon_unit_id", sql.Int, bookingData.aircon_unit_id);
            unitCheck.input("customer_id", sql.Int, bookingData.customer_id);
            const unitResult = await unitCheck.query(unitCheckQuery);

            if (unitResult.recordset.length === 0) {
                throw new Error(`Aircon unit with id ${bookingData.aircon_unit_id} does not exist or does not belong to this customer.`);
            }
        }

        const query = `
            INSERT INTO Bookings (
                customer_id, aircon_unit_id, service_type, preferred_date, preferred_time,
                service_address, postal_code, contact_phone, aircon_brand, aircon_model,
                issue_description, technician_id, status
            )
            VALUES (
                @customer_id, @aircon_unit_id, @service_type, @preferred_date, @preferred_time,
                @service_address, @postal_code, @contact_phone, @aircon_brand, @aircon_model,
                @issue_description, @technician_id, 'pending'
            );
            SELECT SCOPE_IDENTITY() AS id;
        `;

        const request = pool.request();
        request.input("customer_id", sql.Int, bookingData.customer_id);
        request.input("aircon_unit_id", sql.Int, bookingData.aircon_unit_id || null);
        request.input("service_type", sql.VarChar, bookingData.service_type);
        request.input("preferred_date", sql.Date, bookingData.preferred_date);
        request.input("preferred_time", sql.VarChar, bookingData.preferred_time);
        request.input("service_address", sql.Text, bookingData.service_address);
        request.input("postal_code", sql.VarChar, bookingData.postal_code || null);
        request.input("contact_phone", sql.VarChar, bookingData.contact_phone);
        request.input("aircon_brand", sql.VarChar, bookingData.aircon_brand || null);
        request.input("aircon_model", sql.VarChar, bookingData.aircon_model || null);
        request.input("issue_description", sql.Text, bookingData.issue_description || null);
        request.input("technician_id", sql.Int, bookingData.technician_id || null);

        const result = await request.query(query);
        const newBookingId = result.recordset[0].id;
        return await getBookingById(newBookingId);
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

//Update Booking by ID
async function updateBooking(id, bookingData) {
    try {
        const pool = await getConnection();

        // Build dynamic UPDATE query - only update fields that are provided
        let updateFields = [];
        const request = pool.request();
        request.input("id", sql.Int, id);

        if (bookingData.service_type !== undefined) {
            updateFields.push("service_type = @service_type");
            request.input("service_type", sql.VarChar, bookingData.service_type);
        }
        if (bookingData.preferred_date !== undefined) {
            updateFields.push("preferred_date = @preferred_date");
            request.input("preferred_date", sql.Date, bookingData.preferred_date);
        }
        if (bookingData.preferred_time !== undefined) {
            updateFields.push("preferred_time = @preferred_time");
            request.input("preferred_time", sql.VarChar, bookingData.preferred_time);
        }
        if (bookingData.service_address !== undefined) {
            updateFields.push("service_address = @service_address");
            request.input("service_address", sql.Text, bookingData.service_address);
        }
        if (bookingData.postal_code !== undefined) {
            updateFields.push("postal_code = @postal_code");
            request.input("postal_code", sql.VarChar, bookingData.postal_code || null);
        }
        if (bookingData.contact_phone !== undefined) {
            updateFields.push("contact_phone = @contact_phone");
            request.input("contact_phone", sql.VarChar, bookingData.contact_phone);
        }
        if (bookingData.aircon_brand !== undefined) {
            updateFields.push("aircon_brand = @aircon_brand");
            request.input("aircon_brand", sql.VarChar, bookingData.aircon_brand || null);
        }
        if (bookingData.aircon_model !== undefined) {
            updateFields.push("aircon_model = @aircon_model");
            request.input("aircon_model", sql.VarChar, bookingData.aircon_model || null);
        }
        if (bookingData.issue_description !== undefined) {
            updateFields.push("issue_description = @issue_description");
            request.input("issue_description", sql.Text, bookingData.issue_description || null);
        }
        if (bookingData.technician_id !== undefined) {
            updateFields.push("technician_id = @technician_id");
            request.input("technician_id", sql.Int, bookingData.technician_id || null);
        }
        if (bookingData.status && bookingData.status.trim() !== '') {
            updateFields.push("status = @status");
            request.input("status", sql.VarChar, bookingData.status);
        }

        updateFields.push("updated_at = GETDATE()");

        if (updateFields.length === 1) {
            throw new Error("No fields to update");
        }

        const query = `
            UPDATE Bookings
            SET ${updateFields.join(', ')}
            WHERE id = @id
        `;

        await request.query(query);
        return await getBookingById(id);
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

//Update Booking Status
async function updateBookingStatus(id, status) {
    try {
        const pool = await getConnection();

        const query = `
            UPDATE Bookings
            SET status = @status, updated_at = GETDATE()
            WHERE id = @id
        `;

        const request = pool.request();
        request.input("id", sql.Int, id);
        request.input("status", sql.VarChar, status);

        await request.query(query);
        return await getBookingById(id);
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

//Delete Booking by ID
async function deleteBooking(id) {
    try {
        const pool = await getConnection();
        const query = "DELETE FROM Bookings WHERE id = @id";

        const request = pool.request();
        request.input("id", sql.Int, id);
        await request.query(query);
        return { message: "Booking deleted successfully!" };
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

module.exports = {
    getAllBookings,
    getBookingById,
    getBookingsByCustomerId,
    getBookingsByStatus,
    getBookingsWithFilters,
    createBooking,
    updateBooking,
    updateBookingStatus,
    deleteBooking,
};