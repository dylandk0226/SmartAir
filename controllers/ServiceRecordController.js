const ServiceRecordModel = require ("../models/ServiceRecordModel");

//format date to yyyy-mm-dd
function formatDate(date){
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

//Get all ServiceRecords
async function getAllServiceRecords(req, res) {
    try {
        console.log("Fetching all service records...");
        const ServiceRecords = await ServiceRecordModel.getAllServiceRecords();

        const formattedServiceRecords = ServiceRecords.map(unit => {
            unit.service_date = formatDate(unit.service_date);
            unit.next_due_date = formatDate(unit.next_due_date);
            return unit;
        })

        res.json(ServiceRecords);
    } catch (error) {
        console.error ("Controller error:", error);
        res.status(500).json ({error: "Error retrieving service records"});
    }
    
}

//Get service record by ID
async function getServiceRecordById(req, res) {
    try {
        const id = parseInt(req.params.id);
        const ServiceRecord = await ServiceRecordModel.getServiceRecordById(id);

        if (!ServiceRecord){
            return res.status(400).json ({error: "Service record not found"});
        }

        ServiceRecord.service_date = formatDate(ServiceRecord.service_date);
        ServiceRecord.next_due_date = formatDate(ServiceRecord.next_due_date);

        res.json(ServiceRecord);
    } catch (error){
        console.error("Controller error", error);
        res.status(500).json({error: "Error retrieving service record"});
    }
    
}

// Get Service Records by Aircon Unit ID
async function getServiceRecordsByAirconUnitId(req, res) {
    try {
        const airconUnitId = parseInt(req.params.airconUnitId);
        const serviceRecords = await ServiceRecordModel.getServiceRecordsByAirconUnitId(airconUnitId);
        
        const formattedServiceRecords = serviceRecords.map(record => {
            record.service_date = formatDate(record.service_date);
            record.next_due_date = formatDate(record.next_due_date);
            return record;
        });
        
        res.json(formattedServiceRecords);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving service records by aircon unit ID" });
    }
}

// Get Service Records by Technician ID
async function getServiceRecordsByTechnicianId(req, res) {
    try {
        const technicianId = parseInt(req.params.technicianId);
        const serviceRecords = await ServiceRecordModel.getServiceRecordsByTechnicianId(technicianId);
        
        const formattedServiceRecords = serviceRecords.map(record => {
            record.service_date = formatDate(record.service_date);
            record.next_due_date = formatDate(record.next_due_date);
            return record;
        });
        
        res.json(formattedServiceRecords);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving service records by technician ID" });
    }
}

// Get Service Records by Status
async function getServiceRecordsByStatus(req, res) {
    try {
        const status = req.params.status;
        const serviceRecords = await ServiceRecordModel.getServiceRecordsByStatus(status);
        
        const formattedServiceRecords = serviceRecords.map(record => {
            record.service_date = formatDate(record.service_date);
            record.next_due_date = formatDate(record.next_due_date);
            return record;
        });
        
        res.json(formattedServiceRecords);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving service records by status" });
    }
}

// Get Service Records by Date Range
async function getServiceRecordsByDateRange(req, res) {
    try {
        const startDate = req.params.startDate;
        const endDate = req.params.endDate;
        const serviceRecords = await ServiceRecordModel.getServiceRecordsByDateRange(startDate, endDate);
        
        const formattedServiceRecords = serviceRecords.map(record => {
            record.service_date = formatDate(record.service_date);
            record.next_due_date = formatDate(record.next_due_date);
            return record;
        });
        
        res.json(formattedServiceRecords);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving service records by date range" });
    }
}

// Get Service Records by Due Date (upcoming or overdue)
async function getServiceRecordsByDueDate(req, res) {
    try {
        const isOverdue = req.query.overdue === 'true';
        const serviceRecords = await ServiceRecordModel.getServiceRecordsByDueDate(isOverdue);
        
        const formattedServiceRecords = serviceRecords.map(record => {
            record.service_date = formatDate(record.service_date);
            record.next_due_date = formatDate(record.next_due_date);
            return record;
        });
        
        res.json(formattedServiceRecords);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving service records by due date" });
    }
}

// Get Service Records with Advanced Filtering
async function getServiceRecordsWithFilters(req, res) {
    try {
        const filters = {
            aircon_unit_id: req.query.aircon_unit_id ? parseInt(req.query.aircon_unit_id) : undefined,
            technician_id: req.query.technician_id ? parseInt(req.query.technician_id) : undefined,
            status: req.query.status,
            start_date: req.query.start_date,
            end_date: req.query.end_date,
            due_soon_days: req.query.due_soon_days ? parseInt(req.query.due_soon_days) : undefined
        };
        
        const serviceRecords = await ServiceRecordModel.getServiceRecordsWithFilters(filters);
        
        const formattedServiceRecords = serviceRecords.map(record => {
            record.service_date = formatDate(record.service_date);
            record.next_due_date = formatDate(record.next_due_date);
            return record;
        });
        
        res.json(formattedServiceRecords);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving filtered service records" });
    }
}


//Create new service record
async function createServiceRecord(req, res) {
    try {
        const serviceRecordData = {
            ...req.body,
            service_date: formatDate(req.body.service_date),
            next_due_date: formatDate(req.body.next_due_date)
        };

        const newServiceRecord = await ServiceRecordModel.createServiceRecord(serviceRecordData);
        res.status(201).json(newServiceRecord);


    } catch (error){
        console.error("Controller error", error);
        res.status(500).json({error: "Error creating service record"});
    }
    
}

//Update a service record by ID
async function updateServiceRecord(req, res) {
    try {
        const id = parseInt(req.params.id);
        const serviceRecordData = req.body;

        serviceRecordData.service_date = formatDate(serviceRecordData.service_date);
        serviceRecordData.next_due_date = formatDate(serviceRecordData.next_due_date);

        const updateServiceRecord = await ServiceRecordModel.updateServiceRecord(id, serviceRecordData);

        if (!updateServiceRecord) {
            return res.status(404).json({error: "Service record not found"});

        }

        res.json(updateServiceRecord);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({error: "Error updating service record"});
    }
}

//Delete a service record by ID
async function deleteServiceRecord(req, res) {
    try {
        const id = parseInt(req.params.id);
        const result = await ServiceRecordModel.deleteServiceRecord(id);

        res.json(result);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({error: "Error deleting service record"});
    }
    
}

module.exports = {
    getAllServiceRecords,
    getServiceRecordById,
    getServiceRecordsByAirconUnitId,
    getServiceRecordsByTechnicianId,
    getServiceRecordsByStatus,
    getServiceRecordsByDateRange,
    getServiceRecordsByDueDate,
    getServiceRecordsWithFilters,
    createServiceRecord,
    updateServiceRecord,
    deleteServiceRecord,
};