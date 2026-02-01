const TechnicianModel = require ("../models/TechnicianModel");

//Get all technicians
async function getAllTechnicians(req, res) {
    try {
        const technicians = await TechnicianModel.getAllTechnicians();
        res.json(technicians);
    } catch (error) {
        console.error ("Controller error:", error);
        res.status(500).json ({error: "Error retrieving technicians"});
    }
    
}

//Get technician by ID
async function getTechnicianById(req, res) {
    try {
        const id = parseInt(req.params.id);
        const technician = await TechnicianModel.getTechnicianById(id);

        if (!technician){
            return res.status(400).json ({error: "Technician not found"});
        }

        res.json(technician);
    } catch (error){
        console.error("Controller error", error);
        res.status(500).json({error: "Error retrieving technician"});
    }
    
}

//Get technician by user ID
async function getTechnicianByUserId(req, res) {
    try {
        const userId = parseInt(req.params.userId);
        const technician = await TechnicianModel.getTechnicianByUserId(userId);

        if (!technician){
            return res.status(400).json ({error: "Technician not found for this user"});
        }

        res.json(technician);
    } catch (error){
        console.error("Controller error", error);
        res.status(500).json({error: "Error retrieving technician by user ID"});
    }
    
}

//Create new technician
async function createTechnician(req, res) {
    try {
        const newTechnician = await TechnicianModel.createTechnician(req.body);
        res.status(201).json(newTechnician);
    } catch (error){
        console.error("Controller error", error);
        res.status(500).json({error: "Error creating technician"});
    }
    
}

//Update a technician by ID
async function updateTechnician(req, res) {
    try {
        const id = parseInt(req.params.id);
        const updateTechnician = await TechnicianModel.updateTechnician(id, req.body);

        if (!updateTechnician) {
            return res.status(404).json({error: "Technician not found"});
        }

        res.json(updateTechnician);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({error: "Error updating technician"});
    }
}

//Delete a technician by ID
async function deleteTechnician(req, res) {
    try {
        const id = parseInt(req.params.id);
        const result = await TechnicianModel.deleteTechnician(id);

        res.json(result);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({error: "Error deleting technician"});
    }
    
}

module.exports = {
    getAllTechnicians,
    getTechnicianById,
    getTechnicianByUserId,
    createTechnician,
    updateTechnician,
    deleteTechnician,
};