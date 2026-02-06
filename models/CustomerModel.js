const { sql, dbConfig } = require('../dbConfig');

//Get all Customers
async function getAllCustomers() {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = "SELECT id, name, phone, email, address FROM Customers";
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

// Get customer by ID
async function getCustomerById(id) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = "SELECT id, name, phone, email, address FROM Customers WHERE id = @id";
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
            } catch (err){
                console.error("Error closing connection:", err);
            }
        }
    }
}

// Create new customer
async function createCustomer(customerData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
        INSERT INTO Customers (name, phone, email, address)
        VALUES (@name, @phone, @email, @address);
        SELECT SCOPE_IDENTITY() AS id;
        `;

        const request = connection.request();
        request.input("name", sql.NVarChar, customerData.name);
        request.input("phone", sql.NVarChar, customerData.phone);
        request.input("email", sql.NVarChar, customerData.email);
        request.input("address", sql.NVarChar, customerData.address);

        const result = await request.query(query);
        const newCustomerId = result.recordset[0].id;
        return await getCustomerById(newCustomerId);
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

// Update a customer by ID
async function updateCustomer(id, customerData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
        UPDATE Customers
        SET name = @name, phone = @phone, email = @email, address = @address
        WHERE id = @id;
        `;

        const request = connection.request();
        request.input("id", sql.Int, id);
        request.input("name", sql.NVarChar, customerData.name);
        request.input("phone", sql.NVarChar, customerData.phone);
        request.input("email", sql.NVarChar, customerData.email);
        request.input("address", sql.NVarChar, customerData.address);

        await request.query(query);
        return await getCustomerById(id);
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

//Delete a customer by ID
async function deleteCustomer(id) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = "DELETE FROM Customers WHERE id = @id";

        const request = connection.request();
        request.input("id", sql.Int, id);
        await request.query(query);
        return { message: "Customer deleted successfully!" };
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
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
};