const sql = require ("mssql");
const dbConfig = require("../dbConfig");

//Get all AirconUnits
async function getAllAirconUnits() {
    let connection;
    try{
        connection = await sql.connect (dbConfig);
        const query = "Select id, brand, model, serial_number, customer_id, purchase_date, warranty_expiry, installation_address from AirconUnits";
        const result = await connection.request().query(query);

        console.log("Query result:", result.recordset);

        return result.recordset;
    } catch (error){
        console.error ("Database error:", error);
        throw error;
    } finally {
        if (connection){
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
    
}

// Get AirconUnit by ID

async function getAirconUnitById(id) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = "Select id, brand, model, serial_number, customer_id, purchase_date, warranty_expiry, installation_address from AirconUnits where id = @id";
        const request = connection.request();
        request.input ("id", sql.Int, id);
        const result = await request.query(query);

        if (result.recordset.length === 0){
            return null;
        }

        return result.recordset[0];
    } catch (error){
        console.error ("Database error:", error);
        throw error;
    } finally {
        if (connection){
            try {
                await connection.close();
            } catch (err){
                console.error("Error closing connection:", err);
            }
        }
    }
}

// Create new AirconUnit
async function createAirconUnit(AirconUnitData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);

        const customerId = parseInt(AirconUnitData.customer_id);
        if (isNaN(customerId)){
            throw new Error ("Invalid customer id: must be a number");
        }

        const customerCheckQuery = "Select id from customers where id = @customer_id";
        const checkRequest = connection.request();
        checkRequest.input("customer_id", sql.Int, customerId);
        const customerResult = await checkRequest.query(customerCheckQuery);

        if (customerResult.recordset.length === 0){
            throw new Error (`Customer with id ${customerId} does not exist in database.`);
        }

        const query = `
        Insert into AirconUnits (brand, model, serial_number, customer_id, purchase_date, warranty_expiry, installation_address)
        Values (@brand, @model, @serial_number, @customer_id, @purchase_date, @warranty_expiry, @installation_address);
        Select scope_identity() as id;
        `;

        const request = connection.request();
        request.input("brand", sql.NVarChar, AirconUnitData.brand);
        request.input("model", sql.NVarChar, AirconUnitData.model);
        request.input("serial_number", sql.NVarChar, AirconUnitData.serial_number);
        request.input("customer_id", sql.Int, AirconUnitData.customer_id);
        request.input("purchase_date", sql.Date, AirconUnitData.purchase_date);
        request.input("warranty_expiry", sql.Date, AirconUnitData.warranty_expiry);
        request.input("installation_address", sql.NVarChar, AirconUnitData.installation_address);

        const result = await request.query(query);
        const newAirconUnitId = result.recordset[0].id;
        return await getAirconUnitById(newAirconUnitId);
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    } finally {
        if (connection){
            try {
                await connection.close();
            } catch (err){
                console.error("Error closing connection:", err);
            }
        }
    }
    
}

// Update a AirconUnit by ID

async function updateAirconUnit(id, AirconUnitData) {
    let connection;
    try{
        connection = await sql.connect(dbConfig);

        const customerId = parseInt(AirconUnitData.customer_id);
        if (isNaN(customerId)){
            throw new Error ("Invalid customer id: must be a number");
        }

        const customerCheckQuery = "Select id from customers where id = @customer_id";
        const checkRequest = connection.request();
        checkRequest.input("customer_id", sql.Int, customerId);
        const customerResult = await checkRequest.query(customerCheckQuery);

        if (customerResult.recordset.length === 0){
            throw new Error (`Customer with id ${customerId} does not exist in database.`);
        }

        const query = `Update AirconUnits
        Set brand = @brand, model = @model, serial_number = @serial_number, customer_id = @customer_id, purchase_date = @purchase_date, warranty_expiry = @warranty_expiry, installation_address = @installation_address
        where id = @id;`;

        const request = connection.request();
        request.input("id", sql.Int, id);
        request.input("brand", sql.NVarChar, AirconUnitData.brand);
        request.input("model", sql.NVarChar, AirconUnitData.model);
        request.input("serial_number", sql.NVarChar, AirconUnitData.serial_number);
        request.input("customer_id", sql.Int, AirconUnitData.customer_id);
        request.input("purchase_date", sql.NVarChar, AirconUnitData.purchase_date);
        request.input("warranty_expiry", sql.NVarChar, AirconUnitData.warranty_expiry);
        request.input("installation_address", sql.NVarChar, AirconUnitData.installation_address);

        await request.query(query);
        return await getAirconUnitById(id);
    } catch (error){
        console.error("Database error:", error);
        throw error;
    } finally {
        if (connection){
            try {
                await connection.close();
            } catch (err){
                console.error("Error closing connection:", err);
            }
        }
    }
    
}

//Delete a AirconUnit by ID

async function deleteAirconUnit(id) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = "Delete from AirconUnits where id = @id";

        const request = connection.request();
        request.input ("id", sql.Int, id);
        await request.query(query);
        return {message: "Aircon unit deleted successfully!"};
    } catch (error){
        console.error("Database error:", error);
        throw error;
    } finally {
        if (connection){
            try {
                await connection.close();
            } catch (err){
                console.error("Error closing connection:", err);
            }
        }
    }
    
}


module.exports ={
    getAllAirconUnits,
    getAirconUnitById,
    createAirconUnit,
    updateAirconUnit,
    deleteAirconUnit,
};