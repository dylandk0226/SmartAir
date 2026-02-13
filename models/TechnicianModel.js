const { sql, getConnection } = require('../dbConfig');

//Get all Technicians
async function getAllTechnicians() {
    try{
        const pool = await getConnection();
        const query = "Select id, name, phone, email, user_id from Technicians";
        const result = await pool.request().query(query);

        console.log("Query result:", result.recordset); //Log the result for debugging

        return result.recordset;
    } catch (error){
        console.error ("Database error:", error);
        throw error;
    }
}

// Get technician by ID

async function getTechnicianById(id) {
    try {
        const pool = await getConnection();
        const query = "Select id, name, phone, email, user_id from Technicians where id = @id";
        const request = pool.request();
        request.input ("id", sql.Int, id);
        const result = await request.query(query);

        if (result.recordset.length === 0){
            return null;
        }

        return result.recordset[0];
    } catch (error){
        console.error ("Database error:", error);
        throw error;
    }
}

// Get technician by user ID
async function getTechnicianByUserId(userId) {
    try {
        const pool = await getConnection();
        const query = "Select id, name, phone, email, user_id from Technicians where user_id = @user_id";
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

// Create new technician
async function createTechnician(technicianData) {
    try {
        const pool = await getConnection();
        const query = `
        Insert into Technicians (name, phone, email, user_id)
        Values (@name, @phone, @email, @user_id);
        Select scope_identity() as id;
        `;

        const request = pool.request();
        request.input("name", sql.NVarChar, technicianData.name);
        request.input("phone", sql.NVarChar, technicianData.phone);
        request.input("email", sql.NVarChar, technicianData.email);
        request.input("user_id", sql.Int, technicianData.user_id);

        const result = await request.query(query);
        const newTechnicianId = result.recordset[0].id;
        return await getTechnicianById(newTechnicianId);
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

// Update a technician by ID

async function updateTechnician(id, technicianData) {
    try{
        const pool = await getConnection();
        const query = `Update Technicians
        Set name = @name, phone = @phone, email = @email, user_id = @user_id
        where id = @id;`;

        const request = pool.request();
        request.input("id", sql.Int, id);
        request.input("name", sql.NVarChar, technicianData.name);
        request.input("phone", sql.NVarChar, technicianData.phone);
        request.input("email", sql.NVarChar, technicianData.email);
        request.input("user_id", sql.Int, technicianData.user_id);

        await request.query(query);
        return await getTechnicianById(id);
    } catch (error){
        console.error("Database error:", error);
        throw error;
    }
}

//Delete a technician by ID

async function deleteTechnician(id) {
    try {
        const pool = await getConnection();
        const query = "Delete from Technicians where id = @id";

        const request = pool.request();
        request.input ("id", sql.Int, id);
        await request.query(query);
        return {message: "Technician deleted successfully!"};
    } catch (error){
        console.error("Database error:", error);
        throw error;
    }
}


module.exports ={
    getAllTechnicians,
    getTechnicianById,
    getTechnicianByUserId,
    createTechnician,
    updateTechnician,
    deleteTechnician,
};