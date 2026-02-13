const BookingModel = require("../models/BookingModel");
const ServiceRecordModel = require("../models/ServiceRecordModel");

//format date to yyyy-mm-dd
function formatDate(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

//Get all Bookings
async function getAllBookings(req, res) {
    try {
        console.log("Fetching all bookings...");
        const bookings = await BookingModel.getAllBookings();

        const formattedBookings = bookings.map(booking => {
            booking.preferred_date = formatDate(booking.preferred_date);
            booking.created_at = booking.created_at ? formatDate(booking.created_at) : null;
            booking.updated_at = booking.updated_at ? formatDate(booking.updated_at) : null;
            return booking;
        });

        res.json(formattedBookings);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving bookings" });
    }
}

//Get Booking by ID
async function getBookingById(req, res) {
    try {
        const id = parseInt(req.params.id);
        const booking = await BookingModel.getBookingById(id);

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        booking.preferred_date = formatDate(booking.preferred_date);
        booking.created_at = booking.created_at ? formatDate(booking.created_at) : null;
        booking.updated_at = booking.updated_at ? formatDate(booking.updated_at) : null;
        if (booking.scheduled_date) {
            booking.scheduled_date = formatDate(booking.scheduled_date);
        }

        res.json(booking);
    } catch (error) {
        console.error("Controller error", error);
        res.status(500).json({ error: "Error retrieving booking" });
    }
}

//Get Bookings by Customer ID
async function getBookingsByCustomerId(req, res) {
    try {
        const customerId = parseInt(req.params.customerId);
        const bookings = await BookingModel.getBookingsByCustomerId(customerId);

        const formattedBookings = bookings.map(booking => {
            booking.preferred_date = formatDate(booking.preferred_date);
            booking.created_at = booking.created_at ? formatDate(booking.created_at) : null;
            if (booking.scheduled_date) {
                booking.scheduled_date = formatDate(booking.scheduled_date);
            }
            return booking;
        });

        res.json(formattedBookings);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving bookings by customer ID" });
    }
}

//Get Bookings by Status
async function getBookingsByStatus(req, res) {
    try {
        const status = req.params.status;
        const bookings = await BookingModel.getBookingsByStatus(status);

        const formattedBookings = bookings.map(booking => {
            booking.preferred_date = formatDate(booking.preferred_date);
            booking.created_at = booking.created_at ? formatDate(booking.created_at) : null;
            return booking;
        });

        res.json(formattedBookings);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving bookings by status" });
    }
}

//Get Bookings with Filters
async function getBookingsWithFilters(req, res) {
    try {
        const filters = {
            customer_id: req.query.customer_id ? parseInt(req.query.customer_id) : undefined,
            status: req.query.status,
            service_type: req.query.service_type,
            start_date: req.query.start_date,
            end_date: req.query.end_date,
        };

        const bookings = await BookingModel.getBookingsWithFilters(filters);

        const formattedBookings = bookings.map(booking => {
            booking.preferred_date = formatDate(booking.preferred_date);
            booking.created_at = booking.created_at ? formatDate(booking.created_at) : null;
            return booking;
        });

        res.json(formattedBookings);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving filtered bookings" });
    }
}

//Create new Booking
async function createBooking(req, res) {
    try {
        const bookingData = {
            ...req.body,
            preferred_date: formatDate(req.body.preferred_date)
        };

        const newBooking = await BookingModel.createBooking(bookingData);
        res.status(201).json(newBooking);
    } catch (error) {
        console.error("Controller error", error);
        res.status(500).json({ error: error.message || "Error creating booking" });
    }
}

//Update a Booking by ID
async function updateBooking(req, res) {
    try {
        const id = parseInt(req.params.id);
        const bookingData = req.body;

        if (bookingData.preferred_date) {
            bookingData.preferred_date = formatDate(bookingData.preferred_date);
        }

        const updatedBooking = await BookingModel.updateBooking(id, bookingData);

        if (!updatedBooking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        res.json(updatedBooking);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error updating booking" });
    }
}

//Update Booking Status
async function updateBookingStatus(req, res) {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "Status is required" });
        }

        const validStatuses = ["pending", "confirmed", "assigned", "in_progress", "completed", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: "Invalid status", 
                validStatuses: validStatuses 
            });
        }

        // Get booking details before updating
        const booking = await BookingModel.getBookingById(id);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        // Update the booking status
        const updatedBooking = await BookingModel.updateBookingStatus(id, status);

        // AUTO-CREATE SERVICE RECORD when status changes to "completed"
        if (status === "completed") {
            try {
                // Check if service record already exists for this booking
                const existingRecords = await ServiceRecordModel.getServiceRecordsByBookingId(id);
                
                if (existingRecords.length === 0) {
                    // Create service record data matching ServiceRecords table schema
                    const serviceRecordData = {
                        aircon_unit_id: booking.aircon_unit_id,
                        service_date: booking.preferred_date,
                        description: `${booking.service_type} service completed for booking #${id}`,
                        technician_id: booking.technician_id || null,
                        next_due_date: calculateNextServiceDate(booking.preferred_date, booking.service_type),
                        status: "completed",
                        cost: 0.00 // Default cost - can be updated later
                    };

                    await ServiceRecordModel.createServiceRecord(serviceRecordData);
                    console.log(`✅ Auto-created service record for booking #${id}`);
                } else {
                    console.log(`ℹ️ Service record already exists for booking #${id}`);
                }
            } catch (serviceError) {
                console.error(`⚠️ Failed to create service record for booking #${id}:`, serviceError);
                // Don't fail the status update if service record creation fails
                // The admin can create it manually if needed
            }
        }

        res.json(updatedBooking);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error updating booking status" });
    }
}

// Helper function to calculate next service due date
function calculateNextServiceDate(serviceDate, serviceType) {
    const date = new Date(serviceDate);
    
    // Add months based on service type
    switch (serviceType.toLowerCase()) {
        case 'maintenance':
            date.setMonth(date.getMonth() + 3); // 3 months for maintenance
            break;
        case 'repair':
            date.setMonth(date.getMonth() + 6); // 6 months after repair
            break;
        case 'installation':
            date.setMonth(date.getMonth() + 1); // 1 month after installation (first check)
            break;
        case 'inspection':
            date.setMonth(date.getMonth() + 6); // 6 months for inspection
            break;
        default:
            date.setMonth(date.getMonth() + 3); // Default 3 months
    }
    
    return date.toISOString().split('T')[0];
}

//Delete a Booking by ID
async function deleteBooking(req, res) {
    try {
        const id = parseInt(req.params.id);
        const result = await BookingModel.deleteBooking(id);

        res.json(result);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error deleting booking" });
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