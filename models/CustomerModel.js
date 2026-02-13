const { sql, getConnection } = require('../dbConfig');

//Get all Customers
async function getAllCustomers() {
    try {
        const pool = await getConnection();
        const query = "SELECT id, name, phone, email, address, user_id FROM Customers";
        const result = await pool.request().query(query);

        console.log("Query result:", result.recordset);

        return result.recordset;
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

// Get customer by ID
async function getCustomerById(id) {
    try {
        const pool = await getConnection();
        const query = "SELECT id, name, phone, email, address, user_id FROM Customers WHERE id = @id";
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

// Get customer by user ID
async function getCustomerByUserId(userId) {
    try {
        const pool = await getConnection();
        const query = "SELECT id, name, phone, email, address, user_id FROM Customers WHERE user_id = @user_id";
        const request = pool.request();
        request.input("user_id", sql.Int, userId);
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

// Get customer by user ID WITH aircon units
async function getCustomerByUserIdWithAirconUnits(userId) {
    try {
        const pool = await getConnection();

        const customerQuery = `SELECT * FROM Customers WHERE user_id = @user_id`;
        const request = pool.request();
        request.input("user_id", sql.Int, userId);
        const customerResult = await request.query(customerQuery);

        if (customerResult.recordset.length === 0) {
            return null;
        }

        const customer = customerResult.recordset[0];

        const airconQuery = `Select * from AirconUnits where customer_id = @customer_id`;
        const airconRequest = pool.request();
        airconRequest.input("customer_id", sql.Int, customer.id);
        const airconResult = await airconRequest.query(airconQuery);

        customer.aircon_units = airconResult.recordset;

        return customer;
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

// Get customer by email
async function getCustomerByEmail(email) {
    try {
        const pool = await getConnection();
        const query = "SELECT id, name, phone, email, address, user_id FROM Customers WHERE email = @email";
        const request = pool.request();
        request.input("email", sql.NVarChar, email);
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

// Create new customer with user_id
async function createCustomer(customerData) {
    try {
        const pool = await getConnection();
        const query = `
        INSERT INTO Customers (name, phone, email, address)
        VALUES (@name, @phone, @email, @address);
        SELECT SCOPE_IDENTITY() AS id;
        `;

        const request = pool.request();
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
    }
}

// Create new customer
async function createCustomerWithUserId(customerData) {
    try {
        const pool = await getConnection();
        const query = `
        INSERT INTO Customers (name, phone, email, address, user_id)
        VALUES (@name, @phone, @email, @address, @user_id);
        SELECT SCOPE_IDENTITY() AS id;
        `;

        const request = pool.request();
        request.input("name", sql.NVarChar, customerData.name);
        request.input("phone", sql.NVarChar, customerData.phone);
        request.input("email", sql.NVarChar, customerData.email);
        request.input("address", sql.NVarChar, customerData.address);
        request.input("user_id", sql.Int, customerData.user_id);

        const result = await request.query(query);
        const newCustomerId = result.recordset[0].id;
        return await getCustomerById(newCustomerId);
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

// Update a customer by ID
async function updateCustomer(id, customerData) {
    try{
        const pool = await getConnection();
        const query = `UPDATE Customers
        SET name = @name, phone = @phone, email = @email, address = @address
        WHERE id = @id;
        `;

        const request = pool.request();
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
    }
}

//Delete a customer by ID
async function deleteCustomer(id) {
    try {
        const pool = await getConnection();
        const query = "DELETE FROM Customers WHERE id = @id";

        const request = pool.request();
        request.input("id", sql.Int, id);
        await request.query(query);
        return { message: "Customer deleted successfully!" };
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

module.exports = {
    getAllCustomers,
    getCustomerById,
    getCustomerByUserId,
    getCustomerByUserIdWithAirconUnits,
    getCustomerByEmail,
    createCustomer,
    createCustomerWithUserId,
    updateCustomer,
    deleteCustomer,
};