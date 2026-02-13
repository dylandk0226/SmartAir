const CustomerModel = require("../models/CustomerModel");
const userModel = require("../models/userModel");
const BookingModel = require("../models/BookingModel");
const ServiceRecordModel = require("../models/ServiceRecordModel");
const bcrypt = require("bcryptjs");

//Get all customers
async function getAllCustomers(req, res) {
    try {
        const customers = await CustomerModel.getAllCustomers();
        res.json(customers);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving customers" });
    }
}

//Get customer by ID
async function getCustomerById(req, res) {
    try {
        const id = parseInt(req.params.id);
        const customer = await CustomerModel.getCustomerById(id);

        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }

        res.json(customer);
    } catch (error) {
        console.error("Controller error", error);
        res.status(500).json({ error: "Error retrieving customer" });
    }
}

//Get customer by user ID
async function getCustomerByUserId(req, res) {
    try {
        const userId = parseInt(req.params.userId);
        const customer = await CustomerModel.getCustomerByUserId(userId);

        if (!customer) {
            return res.status(404).json({ error: "Customer not found for this user" });
        }

        res.json(customer);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving customer by user ID" });
    }
}

// Register customer account
async function registerCustomerAccount(req, res) {
    try {
        const { username, password, name, phone, email, address } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        if (!name || !phone || !email || !address) {
            return res.status(400).json({ 
                error: "Name, phone, email, and address are required for customer registration" 
            });
        }

        if (!/^\d{8}$/.test(phone)) {
            return res.status(400).json({ error: "Phone must be 8 digits" });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters" });
        }

        const existingUser = await userModel.getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const existingCustomer = await CustomerModel.getCustomerByEmail(email);
        if (existingCustomer) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const newUser = await userModel.registerUser({ 
            username, 
            password, 
            role: "Customer" 
        });

        if (!newUser || !newUser.id) {
            console.error("User creation failed:", newUser);
            return res.status(500).json({ error: "Failed to create user account" });
        }

        console.log("Created user:", newUser);

        try {
            const customerData = {
                name,
                phone,
                email,
                address,
                user_id: newUser.id
            };

            const newCustomer = await CustomerModel.createCustomerWithUserId(customerData);

            return res.status(201).json({
                message: "Customer account registered successfully",
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    role: newUser.role
                },
                customer: newCustomer
            });

        } catch (customerError) {
            console.error("Customer profile creation error:", customerError);

            await userModel.deleteUserById(newUser.id);
            
            return res.status(500).json({ 
                error: "User account created but failed to create customer profile. Registration rolled back.",
                details: customerError.message
            });
        }

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Error registering customer account" });
    }
}

//Create new customer
async function createCustomer(req, res) {
    try {
        const newCustomer = await CustomerModel.createCustomer(req.body);
        res.status(201).json(newCustomer);
    } catch (error) {
        console.error("Controller error", error);
        res.status(500).json({ error: "Error creating customer" });
    }
}

//Update a customer by ID
async function updateCustomer(req, res) {
    try {
        const id = parseInt(req.params.id);
        const updatedCustomer = await CustomerModel.updateCustomer(id, req.body);

        if (!updatedCustomer) {
            return res.status(404).json({ error: "Customer not found" });
        }

        res.json(updatedCustomer);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error updating customer" });
    }
}

//Delete a customer by ID
async function deleteCustomer(req, res) {
    try {
        const id = parseInt(req.params.id);
        const result = await CustomerModel.deleteCustomer(id);

        res.json(result);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error deleting customer" });
    }
}

// Get logged-in customer profile
async function getMyProfile(req, res) {
    try {
        const userId = req.user.id;
        
        const customer = await CustomerModel.getCustomerByUserIdWithAirconUnits(userId);
        if (!customer) {
            return res.status(404).json({ error: "Customer profile not found" });
        }
        
        res.json(customer);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving profile" });
    }
}

// Update logged-in customer own profile
async function updateMyProfile(req, res) {
    try {
        const userId = req.user.id;
        
        const customer = await CustomerModel.getCustomerByUserId(userId);
        if (!customer) {
            return res.status(404).json({ error: "Customer profile not found" });
        }
        
        const updatedCustomer = await CustomerModel.updateCustomer(customer.id, req.body);
        res.json(updatedCustomer);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error updating profile" });
    }
}

// Get all bookings for logged-in customer
async function getMyBookings(req, res) {
    try {
        const userId = req.user.id;
        
        const customer = await CustomerModel.getCustomerByUserId(userId);
        if (!customer) {
            return res.status(404).json({ error: "Customer profile not found" });
        }

        const bookings = await BookingModel.getBookingsByCustomerId(customer.id);
        res.json(bookings);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving bookings" });
    }
}

// Create booking for logged-in customer
async function createMyBooking(req, res) {
    try {
        const userId = req.user.id;

        const customer = await CustomerModel.getCustomerByUserId(userId);
        if (!customer) {
            return res.status(404).json({ error: "Customer profile not found" });
        }

        const bookingData = {
            ...req.body,
            customer_id: customer.id
        };
        
        const newBooking = await BookingModel.createBooking(bookingData);
        res.status(201).json(newBooking);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error creating booking" });
    }
}

// Get booking availability for calendar view
async function getBookingAvailability(req, res) {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: "startDate and endDate are required" });
        }

        const bookings = await BookingModel.getBookingsWithFilters({
            start_date: startDate,
            end_date: endDate
        });

        const availabilityMap = {};

        for (const b of bookings || []) {
            if ((b.status || "").toLowerCase() === "cancelled") continue;

            const dateObj = new Date(b.preferred_date);
            if (isNaN(dateObj.getTime())) continue;

            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
            const dd = String(dateObj.getDate()).padStart(2, "0");
            const dateKey = `${yyyy}-${mm}-${dd}`;

            if (!availabilityMap[dateKey]) {
                availabilityMap[dateKey] = { morning: 0, afternoon: 0, evening: 0 };
            }

            const slot = (b.preferred_time || "").toLowerCase();
            if (slot === "morning") availabilityMap[dateKey].morning += 1;
            if (slot === "afternoon") availabilityMap[dateKey].afternoon += 1;
            if (slot === "evening") availabilityMap[dateKey].evening += 1;
        }

        return res.json(availabilityMap);
    } catch (error) {
        console.error("Controller error:", error);
        return res.status(500).json({ error: "Error retrieving availability" });
    }
}

// Get specific booking belongs to logged-in customer
async function getMyBookingById(req, res) {
    try {
        const userId = req.user.id;
        const bookingId = parseInt(req.params.id);

        const customer = await CustomerModel.getCustomerByUserId(userId);
        if (!customer) {
            return res.status(404).json({ error: "Customer profile not found" });
        }

        const booking = await BookingModel.getBookingById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        if (booking.customer_id !== customer.id) {
            return res.status(403).json({ error: "Access denied. This booking does not belong to you." });
        }
        
        res.json(booking);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving booking" });
    }
}

// Update booking belongs to logged-in customer
async function updateMyBooking(req, res) {
    try {
        const userId = req.user.id;
        const bookingId = parseInt(req.params.id);

        const customer = await CustomerModel.getCustomerByUserId(userId);
        if (!customer) {
            return res.status(404).json({ error: "Customer profile not found" });
        }

        const booking = await BookingModel.getBookingById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        if (booking.customer_id !== customer.id) {
            return res.status(403).json({ error: "Access denied. This booking does not belong to you." });
        }

        const bookingData = {
            ...req.body,
            customer_id: customer.id
        };
        
        const updatedBooking = await BookingModel.updateBooking(bookingId, bookingData);
        res.json(updatedBooking);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error updating booking" });
    }
}

// Cancel booking
async function cancelMyBooking(req, res) {
    try {
        const userId = req.user.id;
        const bookingId = parseInt(req.params.id);

        const customer = await CustomerModel.getCustomerByUserId(userId);
        if (!customer) {
            return res.status(404).json({ error: "Customer profile not found" });
        }

        const booking = await BookingModel.getBookingById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        if (booking.customer_id !== customer.id) {
            return res.status(403).json({ error: "Access denied. This booking does not belong to you." });
        }

        const updatedBooking = await BookingModel.updateBookingStatus(bookingId, 'cancelled');
        res.json(updatedBooking);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error cancelling booking" });
    }
}

// Get service history for logged-in customer
async function getMyServiceHistory(req, res) {
    try {
        const userId = req.user.id;
        
        const customer = await CustomerModel.getCustomerByUserId(userId);
        if (!customer) {
            return res.status(404).json({ error: "Customer profile not found" });
        }

        const serviceRecords = await ServiceRecordModel.getServiceRecordsByCustomerId(customer.id);
        res.json(serviceRecords);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving service history" });
    }
}

module.exports = {
    getAllCustomers,
    getCustomerById,
    getCustomerByUserId,
    registerCustomerAccount,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getMyProfile,
    updateMyProfile,
    getMyBookings,
    createMyBooking,
    getMyBookingById,
    updateMyBooking,
    cancelMyBooking,
    getMyServiceHistory,
    getBookingAvailability,
};