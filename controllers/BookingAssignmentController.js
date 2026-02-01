const BookingAssignmentModel = require("../models/BookingAssignmentModel");

//format date to yyyy-mm-dd
function formatDate(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

//Get all Booking Assignments
async function getAllBookingAssignments(req, res) {
    try {
        console.log("Fetching all booking assignments...");
        const assignments = await BookingAssignmentModel.getAllBookingAssignments();

        const formattedAssignments = assignments.map(assignment => {
            assignment.assigned_date = assignment.assigned_date ? formatDate(assignment.assigned_date) : null;
            assignment.scheduled_date = assignment.scheduled_date ? formatDate(assignment.scheduled_date) : null;
            assignment.completion_date = assignment.completion_date ? formatDate(assignment.completion_date) : null;
            assignment.booking_date = assignment.booking_date ? formatDate(assignment.booking_date) : null;
            return assignment;
        });

        res.json(formattedAssignments);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving booking assignments" });
    }
}

//Get Booking Assignment by ID
async function getBookingAssignmentById(req, res) {
    try {
        const id = parseInt(req.params.id);
        const assignment = await BookingAssignmentModel.getBookingAssignmentById(id);

        if (!assignment) {
            return res.status(404).json({ error: "Booking assignment not found" });
        }

        assignment.assigned_date = assignment.assigned_date ? formatDate(assignment.assigned_date) : null;
        assignment.scheduled_date = assignment.scheduled_date ? formatDate(assignment.scheduled_date) : null;
        assignment.completion_date = assignment.completion_date ? formatDate(assignment.completion_date) : null;
        assignment.preferred_date = assignment.preferred_date ? formatDate(assignment.preferred_date) : null;

        res.json(assignment);
    } catch (error) {
        console.error("Controller error", error);
        res.status(500).json({ error: "Error retrieving booking assignment" });
    }
}

//Get Booking Assignment by Booking ID
async function getBookingAssignmentByBookingId(req, res) {
    try {
        const bookingId = parseInt(req.params.bookingId);
        const assignment = await BookingAssignmentModel.getBookingAssignmentByBookingId(bookingId);

        if (!assignment) {
            return res.status(404).json({ error: "No assignment found for this booking" });
        }

        assignment.assigned_date = assignment.assigned_date ? formatDate(assignment.assigned_date) : null;
        assignment.scheduled_date = assignment.scheduled_date ? formatDate(assignment.scheduled_date) : null;
        assignment.completion_date = assignment.completion_date ? formatDate(assignment.completion_date) : null;

        res.json(assignment);
    } catch (error) {
        console.error("Controller error", error);
        res.status(500).json({ error: "Error retrieving booking assignment" });
    }
}

//Get Booking Assignments by Technician ID
async function getBookingAssignmentsByTechnicianId(req, res) {
    try {
        const technicianId = parseInt(req.params.technicianId);
        const assignments = await BookingAssignmentModel.getBookingAssignmentsByTechnicianId(technicianId);

        const formattedAssignments = assignments.map(assignment => {
            assignment.assigned_date = assignment.assigned_date ? formatDate(assignment.assigned_date) : null;
            assignment.scheduled_date = assignment.scheduled_date ? formatDate(assignment.scheduled_date) : null;
            assignment.completion_date = assignment.completion_date ? formatDate(assignment.completion_date) : null;
            return assignment;
        });

        res.json(formattedAssignments);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving assignments by technician ID" });
    }
}

//Get Booking Assignments by Status
async function getBookingAssignmentsByStatus(req, res) {
    try {
        const status = req.params.status;
        const assignments = await BookingAssignmentModel.getBookingAssignmentsByStatus(status);

        const formattedAssignments = assignments.map(assignment => {
            assignment.assigned_date = assignment.assigned_date ? formatDate(assignment.assigned_date) : null;
            assignment.scheduled_date = assignment.scheduled_date ? formatDate(assignment.scheduled_date) : null;
            assignment.completion_date = assignment.completion_date ? formatDate(assignment.completion_date) : null;
            return assignment;
        });

        res.json(formattedAssignments);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving assignments by status" });
    }
}

//Get Booking Assignments by Date
async function getBookingAssignmentsByDate(req, res) {
    try {
        const date = req.params.date;
        const assignments = await BookingAssignmentModel.getBookingAssignmentsByDate(date);

        const formattedAssignments = assignments.map(assignment => {
            assignment.assigned_date = assignment.assigned_date ? formatDate(assignment.assigned_date) : null;
            assignment.scheduled_date = assignment.scheduled_date ? formatDate(assignment.scheduled_date) : null;
            return assignment;
        });

        res.json(formattedAssignments);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving assignments by date" });
    }
}

//Create Booking Assignment
async function createBookingAssignment(req, res) {
    try {
        const assignmentData = {
            ...req.body
        };

        if (assignmentData.scheduled_date) {
            assignmentData.scheduled_date = formatDate(assignmentData.scheduled_date);
        }

        const newAssignment = await BookingAssignmentModel.createBookingAssignment(assignmentData);
        res.status(201).json(newAssignment);
    } catch (error) {
        console.error("Controller error", error);
        res.status(500).json({ error: error.message || "Error creating booking assignment" });
    }
}

//Update a Booking Assignment by ID
async function updateBookingAssignment(req, res) {
    try {
        const id = parseInt(req.params.id);
        const assignmentData = req.body;

        if (assignmentData.scheduled_date) {
            assignmentData.scheduled_date = formatDate(assignmentData.scheduled_date);
        }

        if (assignmentData.completion_date) {
            assignmentData.completion_date = new Date(assignmentData.completion_date).toISOString();
        }

        const updatedAssignment = await BookingAssignmentModel.updateBookingAssignment(id, assignmentData);

        if (!updatedAssignment) {
            return res.status(404).json({ error: "Booking assignment not found" });
        }

        res.json(updatedAssignment);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error updating booking assignment" });
    }
}

//Update Assignment Status
async function updateAssignmentStatus(req, res) {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "Status is required" });
        }

        const validStatuses = ["assigned", "in_progress", "completed", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: "Invalid status", 
                validStatuses: validStatuses 
            });
        }

        const updatedAssignment = await BookingAssignmentModel.updateAssignmentStatus(id, status);

        if (!updatedAssignment) {
            return res.status(404).json({ error: "Booking assignment not found" });
        }

        res.json(updatedAssignment);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error updating assignment status" });
    }
}

//Delete a Booking Assignment by ID
async function deleteBookingAssignment(req, res) {
    try {
        const id = parseInt(req.params.id);
        const result = await BookingAssignmentModel.deleteBookingAssignment(id);

        res.json(result);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error deleting booking assignment" });
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