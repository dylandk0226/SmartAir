const { hasPermission, getPermissions } = require('../middlewares/PermissionValidation');

function validateUserPermission(resource, action) {
    return (req, res, next) => {
        try {
            const userRole = req.user.role;
            if (!hasPermission(userRole, resource, action)) {
                return res.status(403).json({ error: `Access denied: You do not have ${action} permission for this ${resource}.` });
            }
            next();
        } catch (error) {
            console.error("Error validating user permission:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    };
}

function blockResourceAccess(resource) {
    return (req, res, next) => {
        try {
            const userRole = req.user.role;
            
            const userPermissions = getPermissions(userRole);

            if (!userPermissions[resource] || userPermissions[resource].length === 0) {
                return res.status(403).json({ error: `Access denied: You do not have access to ${resource}.` });
            }
            next();
        } catch (error) {
            console.error("Access control error:", error);
            return res.status(500).json({ error: "Access control check failed" });
        }
    };
}

// Get Permission
async function getUserPermissions(req, res) {
    try {
        const userRole = req.user.role;
        const permissions = getPermissions(userRole);
        return res.status(200).json({
            role: userRole,
            permissions: permissions
        });
    } catch (error) {
        console.error("Error getting user permissions:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    validateUserPermission,
    blockResourceAccess,
    getUserPermissions
};