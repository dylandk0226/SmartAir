const { sql, getConnection } = require('../dbConfig');

// Get all Service Records
async function getAllServiceRecords() {
    try {
        const pool = await getConnection();
        const query = "SELECT id, aircon_unit_id, service_date, description, technician_id, next_due_date, status, cost FROM ServiceRecords";
        const result = await pool.request().query(query);
        return result.recordset;
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}


// Get Service Record by ID
async function getServiceRecordById(id) {
    try {
        const pool = await getConnection();
        const query = "SELECT id, aircon_unit_id, service_date, description, technician_id, next_due_date, status, cost FROM ServiceRecords WHERE id = @id";
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

// Get Service Records by AirconUnit ID
async function getServiceRecordsByAirconUnitId(airconUnitId) {
    try {
        const pool = await getConnection();
        const query = "SELECT id, aircon_unit_id, service_date, description, technician_id, next_due_date, status, cost FROM ServiceRecords WHERE aircon_unit_id = @aircon_unit_id";
        const request = pool.request();
        request.input("aircon_unit_id", sql.Int, airconUnitId);
        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

// Get Service Records by Customer ID (NEW FUNCTION!)
async function getServiceRecordsByCustomerId(customerId) {
    try {
        const pool = await getConnection();

        const query = `
            SELECT 
                sr.id,
                sr.aircon_unit_id,
                sr.service_date,
                sr.description,
                sr.technician_id,
                sr.next_due_date,
                sr.status,
                sr.cost,
                au.brand AS unit_brand,
                au.model AS unit_model,
                au.serial_number,
                au.installation_address
            FROM ServiceRecords sr
            INNER JOIN AirconUnits au ON sr.aircon_unit_id = au.id
            WHERE au.customer_id = @customer_id
            ORDER BY sr.service_date DESC
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

// Get Service Records by Technician ID
async function getServiceRecordsByTechnicianId(technicianId) {
    try {
        const pool = await getConnection();
        const query = "SELECT id, aircon_unit_id, service_date, description, technician_id, next_due_date, status, cost FROM ServiceRecords WHERE technician_id = @technician_id";
        const request = pool.request();
        request.input("technician_id", sql.Int, technicianId);
        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

// Get Service Records by Status
async function getServiceRecordsByStatus(status) {
    try {
        const pool = await getConnection();
        const query = "SELECT id, aircon_unit_id, service_date, description, technician_id, next_due_date, status, cost FROM ServiceRecords WHERE status = @status";
        const request = pool.request();
        request.input("status", sql.NVarChar, status);
        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

// Get Service Records by Date Range
async function getServiceRecordsByDateRange(startDate, endDate) {
    try {
        const pool = await getConnection();
        const query = "SELECT id, aircon_unit_id, service_date, description, technician_id, next_due_date, status, cost FROM ServiceRecords WHERE service_date BETWEEN @startDate AND @endDate";
        const request = pool.request();
        request.input("startDate", sql.Date, startDate);
        request.input("endDate", sql.Date, endDate);
        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

// Get Service Records by Due Date
async function getServiceRecordsByDueDate(isOverdue = false) {
    try {
        const pool = await getConnection();
        let query;
        if (isOverdue) {
            query = "SELECT id, aircon_unit_id, service_date, description, technician_id, next_due_date, status, cost FROM ServiceRecords WHERE next_due_date < CAST(GETDATE() AS DATE) AND status != 'completed'";
        } else {
            query = "SELECT id, aircon_unit_id, service_date, description, technician_id, next_due_date, status, cost FROM ServiceRecords WHERE next_due_date >= CAST(GETDATE() AS DATE) AND status != 'completed' ORDER BY next_due_date ASC";
        }
        const request = pool.request();
        request.input("currentDate", sql.Date, new Date());
        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

// Get Service Records with Advanced Filtering
async function getServiceRecordsWithFilters(filters) {
    try {
        const pool = await getConnection();

        let query = "SELECT id, aircon_unit_id, service_date, description, technician_id, next_due_date, status, cost FROM ServiceRecords WHERE 1=1";
        const request = pool.request();

        // Apply filters
        if (filters.aircon_unit_id) {
            query += " AND aircon_unit_id = @aircon_unit_id";
            request.input("aircon_unit_id", sql.Int, filters.aircon_unit_id);
        }

        if (filters.technician_id) {
            query += " AND technician_id = @technician_id";
            request.input("technician_id", sql.Int, filters.technician_id);
        }
        if (filters.status) {
            query += " AND status = @status";
            request.input("status", sql.NVarChar, filters.status);
        }
        if (filters.start_date) {
            query += " AND service_date >= @start_date";
            request.input("start_date", sql.Date, filters.start_date);
        }
        if (filters.end_date) {
            query += " AND service_date <= @end_date";
            request.input("end_date", sql.Date, filters.end_date);
        }
        if (filters.due_soon_days) {
            query += " AND next_due_date BETWEEN CAST(GETDATE() AS DATE) AND DATEADD(DAY, @due_soon_days, CAST(GETDATE() AS DATE)) AND status != 'completed'";
            request.input("due_soon_days", sql.Int, filters.due_soon_days);
        }

        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

// Create new Service Record
async function createServiceRecord(serviceRecordData) {
    try {
        const pool = await getConnection();
        const query = `
        INSERT INTO ServiceRecords (aircon_unit_id, service_date, description, technician_id, next_due_date, status, cost)
        VALUES (@aircon_unit_id, @service_date, @description, @technician_id, @next_due_date, @status, @cost);
        SELECT SCOPE_IDENTITY() AS id;
        `;
        
        const request = pool.request();
        request.input("aircon_unit_id", sql.Int, serviceRecordData.aircon_unit_id);
        request.input("service_date", sql.Date, serviceRecordData.service_date);
        request.input("description", sql.NVarChar, serviceRecordData.description);
        request.input("technician_id", sql.Int, serviceRecordData.technician_id);
        request.input("next_due_date", sql.Date, serviceRecordData.next_due_date);
        request.input("status", sql.NVarChar, serviceRecordData.status);
        request.input("cost", sql.Decimal(10, 2), serviceRecordData.cost || 0);
        
        const result = await request.query(query);
        const newServiceRecordId = result.recordset[0].id;
        
        return await getServiceRecordById(newServiceRecordId);
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

// Update Service Record by ID
async function updateServiceRecord(id, serviceRecordData) {
    try {
        const pool = await getConnection();
        
        const query = `UPDATE ServiceRecords
        SET aircon_unit_id = @aircon_unit_id, service_date = @service_date, description = @description, 
        technician_id = @technician_id, next_due_date = @next_due_date, status = @status, cost = @cost
        WHERE id = @id;
        `;
        
        const request = pool.request();
        request.input("id", sql.Int, id);
        request.input("aircon_unit_id", sql.Int, serviceRecordData.aircon_unit_id);
        request.input("service_date", sql.Date, serviceRecordData.service_date);
        request.input("description", sql.NVarChar, serviceRecordData.description);
        request.input("technician_id", sql.Int, serviceRecordData.technician_id);
        request.input("next_due_date", sql.Date, serviceRecordData.next_due_date);
        request.input("status", sql.NVarChar, serviceRecordData.status);
        request.input("cost", sql.Decimal(10, 2), serviceRecordData.cost || 0);
        
        await request.query(query);
        return await getServiceRecordById(id);
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}


// Delete Service Record by ID
async function deleteServiceRecord(id) {
    try {
        const pool = await getConnection();
        const query = "DELETE FROM ServiceRecords WHERE id = @id";
        const request = pool.request();
        request.input("id", sql.Int, id);
        await request.query(query);
        return { message: "Service Record deleted successfully" };
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

// Get Service Records by Booking ID (for auto-create duplicate check)
async function getServiceRecordsByBookingId(bookingId) {
    try {
        const pool = await getConnection();
        return [];
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}


module.exports = {
    getAllServiceRecords,
    getServiceRecordById,
    getServiceRecordsByAirconUnitId,
    getServiceRecordsByCustomerId,
    getServiceRecordsByTechnicianId,
    getServiceRecordsByStatus,
    getServiceRecordsByDateRange,
    getServiceRecordsByDueDate,
    getServiceRecordsWithFilters,
    createServiceRecord,
    updateServiceRecord,
    deleteServiceRecord,
    getServiceRecordsByBookingId,
};