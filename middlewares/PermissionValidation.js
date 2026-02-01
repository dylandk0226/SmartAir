const userModel = require('../models/userModel');

const permissionMiddleware = {
    'Admin': {
        'customers': ['create', 'read', 'update', 'delete'],
        'airconUnits': ['create', 'read', 'update', 'delete'],
        'serviceRecords': ['create', 'read', 'update', 'delete'],
        'reminders': ['create', 'read', 'update', 'delete'],
        'technicians': ['create', 'read', 'update', 'delete'],
        'users': ['create', 'read', 'update', 'delete'],
        'bookings': ['create', 'read', 'update', 'delete'],
        'bookingAssignments': ['create', 'read', 'update', 'delete']
    },
    'Technician': {
        'customers': ['read'],
        'airconUnits': ['read', 'update'],
        'serviceRecords': ['create', 'read', 'update'],
        'reminders': ['read', 'update'],
        'technicians': ['read'],
        'users': [],
        'bookings': ['read', 'update'],
        'bookingAssignments': ['read', 'update']
    },
    'Customer': {
        'customers': ['read', 'update'],
        'airconUnits': ['read'],
        'serviceRecords': ['read'],
        'reminders': ['read'],
        'technicians': ['read'],
        'users': [],
        'bookings': ['create', 'read', 'update'],
        'bookingAssignments': ['read']
    }
};

function getPermissions(role) {
    return permissionMiddleware[role] || {};
}

function hasPermission(role, resource, action) {
    const userPermissions = getPermissions(role);
    const resourcePermissions = userPermissions[resource] || [];
    
    return resourcePermissions.includes(action);
}

module.exports = {
    getPermissions,
    hasPermission
};