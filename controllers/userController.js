const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const TechnicianModel = require("../models/TechnicianModel");
const { getPermissions } = require("../middlewares/PermissionValidation");
const { sql, dbConfig } = require("../dbConfig");

// Register a new user
async function registerUser(req, res) {
  try {
    const { username, password, role, name, phone, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const userRole = role || 'Admin';
    
    if (!['Admin', 'Technician', 'Customer'].includes(userRole)) {
      return res.status(400).json({ error: "Role must be Admin, Technician, or Customer" });
    }

    // If registering as Technician, validate additional fields
    if (userRole === 'Technician') {
      if (!name || !phone || !email) {
        return res.status(400).json({ error: "Name, phone, and email are required for Technician registration" });
      }

      // Validate phone format (8 digits)
      if (!/^\d{8}$/.test(phone)) {
        return res.status(400).json({ error: "Phone must be 8 digits" });
      }

      // Validate email format
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
    }

    // Check if user already exists
    const existingUser = await userModel.getUserByUsername(username);
    
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    
    const newUser = await userModel.registerUser({ username, password, role: userRole });
    
    if (!newUser || !newUser.id) {
      console.error("User creation failed or missing ID:", newUser);
      return res.status(500).json({ error: "Failed to create user properly" });
}

console.log("Created user:", newUser);

    // If the roles is Technician, create a corresponding technician record
    if (userRole === 'Technician') {
      try {
        const technicianData = {
          name: name,
          phone: phone,
          email: email,
          user_id: newUser.id
        };

      const newTechnician = await TechnicianModel.createTechnician(technicianData);

      // Return both user and technician info
      return res.status(201).json({
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role
        },
        technician: newTechnician,
        message: "Technician user registered successfully with profile created"
      });
    } catch (techError) {
      console.error("Technician creation error:", techError);
      return res.status(500).json({ error: "User created but failed to create technician profile",
        user: newUser
      });
      
    }
  }
    // For Admin users, just return the user info
    return res.status(201).json({
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      },
      message: "Admin user registered successfully"
    });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error registering user" });
  }

}

// Login a user
async function loginUser(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const user = await userModel.getUserByUsername(username);
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const isPasswordValid = await userModel.verifyPassword(user, password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }
    
    const token = userModel.generateJWT(user);
    
    // If user is a Technician, include technician details
    if (user.role === 'Technician') {
      const technician = await TechnicianModel.getTechnicianByUserId(user.id);
      return res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        },
        technician: technician,
      });
    }

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error logging in" });
  }
}

// Delete a user by ID
async function deleteUser(req, res) {
  try {
    const userId = req.params.id;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const result = await userModel.deleteUserById(userId);
    
    if (result.success) {
      return res.status(200).json({ message: "User deleted successfully" });
    } else {
      return res.status(404).json({ error: "User not found" });
    }

  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
}

// Get all users
async function getAllUsers(req, res) {
  try {
    const search = req.query.search;
    const username = req.query.username;
    const role = req.query.role;

    const searchParams = {};

    if (search) {
      searchParams.search = search;
    }

    if (username && !search) {
      searchParams.username = username;
    }

    if (role && !search) {
      searchParams.role = role;
    }
    
    const users = await userModel.getAllUsers(searchParams);
    res.json(users);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
}

// Get user permission
async function getUserPermission(req, res) {
  try {
    const userRole = req.user.role;
    const permission = getPermissions(userRole);
    
    res.json({
      role: userRole,
      permissions: permission
    });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error fetching user permissions" });
  }
}

// Get user by ID
async function getUserById(req, res) {
  try {
    const userId = req.params.id;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await userModel.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role === 'Technician') {
      const technician = await TechnicianModel.getTechnicianByUserId(user.id);
      return res.json({
        ...user,
        technician: technician
      });
    }

    res.json(user);

  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error fetching user by ID" });
  }
}

// Update user
async function updateUser(req, res) {
  try {
    const userId = req.params.id;
    const { username, role } = req.body;
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    if (!username || !role) {
      return res.status(400).json({ error: "Username and role are required" });
    }
    
    if (!['Admin', 'Technician', 'Customer'].includes(role)) {
      return res.status(400).json({ error: "Role must be Admin, Technician, or Customer" });
    }

    const existingUser = await userModel.getUserByUsername(username);
    if (existingUser && existingUser.id !== parseInt(userId)) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const userData = {
      username,
      role
    };
    
    const updatedUser = await userModel.updateUserById(userId, userData);
    
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // If user is a technician, get technician details
    if (updatedUser.role === 'Technician') {
      const technician = await TechnicianModel.getTechnicianByUserId(updatedUser.id);
      return res.json({
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          role: updatedUser.role
        },
        technician: technician,
        message: "User updated successfully"
      });
    }
    
    res.json({
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role
      },
      message: "User updated successfully"
    });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error updating user" });
  }
}

// Reset user password
async function resetUserPassword(req, res) {
  try {
    const userId = req.params.id;
    const { password } = req.body;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number" 
      });
    }

    const result = await userModel.resetUserPassword(userId, password);

    res.json(result);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error resetting password" });
  }
}

module.exports = {
  registerUser,
  loginUser,
  deleteUser,
  getUserPermission,
  getAllUsers,
  getUserById,
  updateUser,
  resetUserPassword
};