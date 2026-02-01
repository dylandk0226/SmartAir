const { parse } = require("dotenv");
const dbConfig = require("../dbConfig");
const AirconUnitModel = require ("../models/AirconUnitModel");
const sql = require('mssql');

//format date to yyyy-mm-dd
function formatDate(date){
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

//Get all AirconUnits
async function getAllAirconUnits(req, res) {
    try {
        console.log("Fetching all aircon units...");
        const AirconUnits = await AirconUnitModel.getAllAirconUnits();

        const formattedAirconUnits = AirconUnits.map(unit => {
            unit.purchase_date = formatDate(unit.purchase_date);
            unit.warranty_expiry = formatDate(unit.warranty_expiry);
            return unit;
        })

        res.json(AirconUnits);
    } catch (error) {
        console.error ("Controller error:", error);
        res.status(500).json ({error: "Error retrieving aircon units"});
    }
    
}

//Get aircon unit by ID
async function getAirconUnitById(req, res) {
    try {
        const id = parseInt(req.params.id);
        const AirconUnit = await AirconUnitModel.getAirconUnitById(id);

        if (!AirconUnit){
            return res.status(404).json ({error: "Aircon unit not found"});
        }

        AirconUnit.purchase_date = formatDate(AirconUnit.purchase_date);
        AirconUnit.warranty_expiry = formatDate(AirconUnit.warranty_expiry);

        res.json(AirconUnit);
    } catch (error){
        console.error("Controller error", error);
        res.status(500).json({error: "Error retrieving aircon unit"});
    }
    
}


//Create new aircon unit
async function createAirconUnit(req, res) {
    try {
        const airconUnitData = req.body;

        const customerId = parseInt (airconUnitData.customer_id);
        if (isNaN(customerId)){
            return res.status(400).json({error: "Invalid customer_id: must be a number"});
        }

        //airconUnitData.customer_id = customerId;

        const connection = await sql.connect(dbConfig);

        const customerCheckQuery = "Select id from customers where id = @customer_id";
        const request = connection.request();
        request.input("customer_id", sql.Int, customerId);
        const customerResult = await request.query(customerCheckQuery);

        if (customerResult.recordset.length === 0) {
            return res.status(404).json({ error: `Customer with id ${customerId} does not exist in the database.` });
        }

        airconUnitData.customer_id = customerId;
        airconUnitData.purchase_date = formatDate(airconUnitData.purchase_date);
        airconUnitData.warranty_expiry = formatDate(airconUnitData.warranty_expiry);

        const newAirconUnit = await AirconUnitModel.createAirconUnit(airconUnitData);

        res.status(201).json(newAirconUnit);
    } catch (error){
        console.error("Controller error", error);
        res.status(500).json({error: "Error creating aircon unit"});
    }
    
}

//Update a aircon unit by ID
async function updateAirconUnit(req, res) {
    try {
        const id = parseInt(req.params.id);
        const airconUnitData = req.body;

        const customerId = parseInt(airconUnitData.customer_id);
        if (isNaN(customerId)){
            return res.status(400).json({error: "Invalid customer_id: must be a number"});
        }

        airconUnitData.customer_id = customerId;

        const connection = await sql.connect(dbConfig);

        const customerCheckQuery = "Select id from customers where id = @customer_id";
        const request = connection.request();
        request.input("customer_id", sql.Int, customerId);
        const customerResult = await request.query(customerCheckQuery)
        if (customerResult.recordset.length ===0){
            return res.status(404).json ({error: `Customer with id ${customerId} does not exist in the database`});
        }

        airconUnitData.customer_id = customerId;
        airconUnitData.purchase_date = formatDate(airconUnitData.purchase_date);
        airconUnitData.warranty_expiry = formatDate(airconUnitData.warranty_expiry);

        const updateAirconUnit = await AirconUnitModel.updateAirconUnit(id, airconUnitData);

        if (!updateAirconUnit) {
            return res.status(404).json({error: "Aircon unit not found"});

        }

        res.json(updateAirconUnit);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({error: "Error updating aircon unit"});
    }
}

//Delete a aircon unit by ID
async function deleteAirconUnit(req, res) {
    try {
        const id = parseInt(req.params.id);
        const result = await AirconUnitModel.deleteAirconUnit(id);

        res.json(result);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({error: "Error deleting aircon unit"});
    }
    
}

module.exports = {
    getAllAirconUnits,
    getAirconUnitById,
    createAirconUnit,
    updateAirconUnit,
    deleteAirconUnit,
};