const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

//Import controllers
const userController = require('./controllers/userController');
const { validateUserPermission, blockResourceAccess } = require('./controllers/PermissionController');
const CustomerController = require('./controllers/CustomerController');
const AirconUnitController = require('./controllers/AirconUnitController');
const ServiceRecordController = require('./controllers/ServiceRecordController');
const ReminderController = require('./controllers/ReminderController');
const TechnicianController = require('./controllers/TechnicianController');
const BookingController = require('./controllers/BookingController');
const BookingModel = require('./models/BookingModel');
const BookingAssignmentController = require('./controllers/BookingAssignmentController');

//Import middlewares
const { validateCustomer, validateCustomerId } = require('./middlewares/CustomerValidation');
const { validateAirconUnit, validateAirconUnitId } = require('./middlewares/AirconUnitValidation');
const { validateServiceRecord, validateServiceRecordId } = require('./middlewares/ServiceRecordValidation');
const { validateReminder } = require('./middlewares/ReminderValidation');
const { validateTechnician, validateTechnicianId } = require('./middlewares/TechnicianValidation');
const { validateBooking, validateBookingUpdate, validateBookingId } = require('./middlewares/BookingValidation');
const { validateBookingAssignment, validateBookingAssignmentUpdate, validateBookingAssignmentId } = require('./middlewares/BookingAssignmentValidation');
const authenticateToken = require("./middlewares/authMiddleware");
const { validateCustomerRegistration } = require('./middlewares/CustomerValidation');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'client/build')));

// Users
app.post("/api/register", userController.registerUser);
app.post("/api/login", userController.loginUser);
app.get("/api/users/permission", authenticateToken, userController.getUserPermission);
app.get('/api/users', authenticateToken, validateUserPermission('users', 'read'), userController.getAllUsers);
app.get('/api/users/:id', authenticateToken, validateUserPermission('users', 'read'), userController.getUserById);
app.put('/api/users/:id', authenticateToken, validateUserPermission('users', 'update'), userController.updateUser);
app.delete("/api/users/:id", authenticateToken, blockResourceAccess('users'), validateUserPermission('users', 'delete'), userController.deleteUser);
app.post("/api/users/:id/resetpassword", authenticateToken, blockResourceAccess('users'), validateUserPermission('users', 'update'), userController.resetUserPassword);
app.put('/api/users/me/password', authenticateToken, userController.changeMyPassword);

// Customer Account Management
app.post("/api/customer/register", validateCustomerRegistration, CustomerController.registerCustomerAccount);
app.get('/api/customer/profile', authenticateToken, CustomerController.getMyProfile);
app.put('/api/customer/profile', authenticateToken, validateCustomer, CustomerController.updateMyProfile);

// Customer Booking Management
app.get('/api/customer/bookings', authenticateToken, CustomerController.getMyBookings);
app.post('/api/customer/bookings', authenticateToken, validateBooking, CustomerController.createMyBooking);
app.get('/api/customer/bookings/:id', authenticateToken, CustomerController.getMyBookingById);
app.put('/api/customer/bookings/:id', authenticateToken, validateBookingUpdate, CustomerController.updateMyBooking);
app.put('/api/customer/bookings/:id/cancel', authenticateToken, CustomerController.cancelMyBooking);
app.get('/api/customer/availability', authenticateToken, CustomerController.getBookingAvailability);

// Customer Service History
app.get('/api/customer/service-records', authenticateToken, CustomerController.getMyServiceHistory);

// Customers
app.get('/api/customers', authenticateToken, validateUserPermission('customers', 'read'), CustomerController.getAllCustomers);
app.get('/api/customers/:id', authenticateToken, validateUserPermission('customers', 'read'), validateCustomerId, CustomerController.getCustomerById);
app.post('/api/customers', authenticateToken, validateUserPermission('customers', 'create'), validateCustomer, CustomerController.createCustomer);
app.put('/api/customers/:id', authenticateToken, validateUserPermission('customers', 'update'), validateCustomerId, validateCustomer, CustomerController.updateCustomer);
app.delete('/api/customers/:id', authenticateToken, validateUserPermission('customers', 'delete'), validateCustomerId, CustomerController.deleteCustomer);
app.get('/api/customers/user/:userId', authenticateToken, validateUserPermission('customers', 'read'), CustomerController.getCustomerByUserId);

// AirconUnits
app.get('/api/airconunits', authenticateToken, validateUserPermission('airconUnits', 'read'), AirconUnitController.getAllAirconUnits);
app.get('/api/airconunits/:id', authenticateToken, validateUserPermission('airconUnits', 'read'), validateAirconUnitId, AirconUnitController.getAirconUnitById);
app.post('/api/airconunits', authenticateToken, validateUserPermission('airconUnits', 'create'), validateAirconUnit, AirconUnitController.createAirconUnit);
app.put('/api/airconunits/:id', authenticateToken, validateUserPermission('airconUnits', 'update'), validateAirconUnitId, validateAirconUnit, AirconUnitController.updateAirconUnit);
app.delete('/api/airconunits/:id', authenticateToken, validateUserPermission('airconUnits', 'delete'), validateAirconUnitId, AirconUnitController.deleteAirconUnit);

// ServiceRecords
app.get('/api/servicerecords', authenticateToken, validateUserPermission('serviceRecords', 'read'), ServiceRecordController.getAllServiceRecords);
app.get('/api/servicerecords/filter', authenticateToken, validateUserPermission('serviceRecords', 'read'), ServiceRecordController.getServiceRecordsWithFilters);
app.get('/api/servicerecords/duedate', authenticateToken, validateUserPermission('serviceRecords', 'read'), ServiceRecordController.getServiceRecordsByDueDate);
app.get('/api/servicerecords/:id', authenticateToken, validateUserPermission('serviceRecords', 'read'), validateServiceRecordId, ServiceRecordController.getServiceRecordById);
app.get('/api/servicerecords/airconunit/:airconUnitId', authenticateToken, validateUserPermission('serviceRecords', 'read'), ServiceRecordController.getServiceRecordsByAirconUnitId);
app.get('/api/servicerecords/technician/:technicianId', authenticateToken, validateUserPermission('serviceRecords', 'read'), ServiceRecordController.getServiceRecordsByTechnicianId);
app.get('/api/servicerecords/status/:status', authenticateToken, validateUserPermission('serviceRecords', 'read'), ServiceRecordController.getServiceRecordsByStatus);
app.get('/api/servicerecords/daterange/:startDate/:endDate', authenticateToken, validateUserPermission('serviceRecords', 'read'), ServiceRecordController.getServiceRecordsByDateRange);
app.post('/api/servicerecords', authenticateToken, validateUserPermission('serviceRecords', 'create'), validateServiceRecord, ServiceRecordController.createServiceRecord);
app.put('/api/servicerecords/:id', authenticateToken, validateUserPermission('serviceRecords', 'update'), validateServiceRecordId, validateServiceRecord, ServiceRecordController.updateServiceRecord);
app.delete('/api/servicerecords/:id', authenticateToken, validateUserPermission('serviceRecords', 'delete'), validateServiceRecordId, ServiceRecordController.deleteServiceRecord);

// Reminder
app.get('/api/reminders', authenticateToken, validateUserPermission('reminders', 'read'), ReminderController.getAllReminders);
app.get('/api/reminders/:id', authenticateToken, validateUserPermission('reminders', 'read'), ReminderController.getReminderById);
app.post('/api/reminders', authenticateToken, validateUserPermission('reminders', 'create'), validateReminder, ReminderController.createReminder);
app.put('/api/reminders/:id', authenticateToken, validateUserPermission('reminders', 'update'), validateReminder, ReminderController.updateReminder);
app.delete('/api/reminders/:id', authenticateToken, validateUserPermission('reminders', 'delete'), ReminderController.deleteReminder);

// Technicians
app.get('/api/technicians', authenticateToken, validateUserPermission('technicians', 'read'), TechnicianController.getAllTechnicians);
app.get('/api/technicians/user/:userId', authenticateToken, validateUserPermission('technicians', 'read'), TechnicianController.getTechnicianByUserId);
app.get('/api/technicians/:id', authenticateToken, validateUserPermission('technicians', 'read'), validateTechnicianId, TechnicianController.getTechnicianById);
app.post('/api/technicians', authenticateToken, validateUserPermission('technicians', 'create'), validateTechnician, TechnicianController.createTechnician);
app.put('/api/technicians/:id', authenticateToken, validateUserPermission('technicians', 'update'), validateTechnicianId, validateTechnician, TechnicianController.updateTechnician);
app.delete('/api/technicians/:id', authenticateToken, validateUserPermission('technicians', 'delete'), validateTechnicianId, TechnicianController.deleteTechnician);

// Bookings
app.get('/api/bookings', authenticateToken, validateUserPermission('bookings', 'read'), BookingController.getAllBookings);
app.get('/api/bookings/filter', authenticateToken, validateUserPermission('bookings', 'read'), BookingController.getBookingsWithFilters);
app.get('/api/bookings/customer/:customerId', authenticateToken, validateUserPermission('bookings', 'read'), BookingController.getBookingsByCustomerId);
app.get('/api/bookings/status/:status', authenticateToken, validateUserPermission('bookings', 'read'), BookingController.getBookingsByStatus);
app.get('/api/bookings/:id', authenticateToken, validateUserPermission('bookings', 'read'), validateBookingId, BookingController.getBookingById);
app.post('/api/bookings', authenticateToken, validateUserPermission('bookings', 'create'), validateBooking, BookingController.createBooking);
app.put('/api/bookings/:id', authenticateToken, validateUserPermission('bookings', 'update'), validateBookingId, validateBookingUpdate, BookingController.updateBooking);
app.put('/api/bookings/:id/status', authenticateToken, validateUserPermission('bookings', 'update'), validateBookingId, BookingController.updateBookingStatus);
app.delete('/api/bookings/:id', authenticateToken, validateUserPermission('bookings', 'delete'), validateBookingId, BookingController.deleteBooking);

// Booking Assignments
app.get('/api/booking-assignments', authenticateToken, validateUserPermission('bookingAssignments', 'read'), BookingAssignmentController.getAllBookingAssignments);
app.get('/api/booking-assignments/date/:date', authenticateToken, validateUserPermission('bookingAssignments', 'read'), BookingAssignmentController.getBookingAssignmentsByDate);
app.get('/api/booking-assignments/booking/:bookingId', authenticateToken, validateUserPermission('bookingAssignments', 'read'), BookingAssignmentController.getBookingAssignmentByBookingId);
app.get('/api/booking-assignments/technician/:technicianId', authenticateToken, validateUserPermission('bookingAssignments', 'read'), BookingAssignmentController.getBookingAssignmentsByTechnicianId);
app.get('/api/booking-assignments/status/:status', authenticateToken, validateUserPermission('bookingAssignments', 'read'), BookingAssignmentController.getBookingAssignmentsByStatus);
app.get('/api/booking-assignments/:id', authenticateToken, validateUserPermission('bookingAssignments', 'read'), validateBookingAssignmentId, BookingAssignmentController.getBookingAssignmentById);
app.post('/api/booking-assignments', authenticateToken, validateUserPermission('bookingAssignments', 'create'), validateBookingAssignment, BookingAssignmentController.createBookingAssignment);
app.put('/api/booking-assignments/:id', authenticateToken, validateUserPermission('bookingAssignments', 'update'), validateBookingAssignmentId, validateBookingAssignmentUpdate, BookingAssignmentController.updateBookingAssignment);
app.put('/api/booking-assignments/:id/status', authenticateToken, validateUserPermission('bookingAssignments', 'update'), validateBookingAssignmentId, BookingAssignmentController.updateAssignmentStatus);
app.delete('/api/booking-assignments/:id', authenticateToken, validateUserPermission('bookingAssignments', 'delete'), validateBookingAssignmentId, BookingAssignmentController.deleteBookingAssignment);

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SmartAir API is running' });
});

app.use((req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});