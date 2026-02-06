const { sql, dbConfig } = require('../dbConfig');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
async function registerUser(userData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const query = `Insert into Users (username, password_hash, role)
    Values (@username, @password_hash, @role);
    Select SCOPE_IDENTITY() as id;
    `;
    
    const request = connection.request();
    request.input('username', sql.NVarChar, userData.username);
    request.input('password_hash', sql.NVarChar, hashedPassword);
    request.input('role', sql.NVarChar, userData.role);
    
    const result = await request.query(query);
    const newUserId = result.recordset[0].id;
    
    return {
      id: newUserId,
      username: userData.username,
      role: userData.role
    };

  } catch (error) {
    console.error('Database error:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }

}

// Get all users with optional search conditions
async function getAllUsers(searchParams = {}) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    
    let query = 'Select id, username, role from Users';
    const conditions = [];
    const request = connection.request();
    
    if (searchParams.search) {
      conditions.push('Lower(username) LIKE Lower(@search)');
      request.input('search', sql.NVarChar, `%${searchParams.search.toLowerCase()}%`);
    }
    
    if (searchParams.username && !searchParams.search) {
      conditions.push('Lower(username) LIKE Lower(@username_search)');
      request.input('username_search', sql.NVarChar, `%${searchParams.username.toLowerCase()}%`);
    }
    
    if (searchParams.role && !searchParams.search) {
      conditions.push('Lower(role) LIKE Lower(@role_search)');
      request.input('role_search', sql.NVarChar, `%${searchParams.role.toLowerCase()}%`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY username';

    console.log('Executing SQL query:', query); // Debug log
    console.log('Search params received:', searchParams); // Debug log
    console.log('SQL parameters:', {
      id: searchParams.id,
      search: searchParams.search ? `%${searchParams.search}%` : undefined,
      role: searchParams.role ? `%${searchParams.role}%` : undefined
    }); // Debug log

    const result = await request.query(query);
    console.log('SQL query result count:', result.recordset.length); // Debug log
    return result.recordset;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

// Get user by username
async function getUserByUsername(username) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = 'Select * from Users where username = @username';
    const request = connection.request();
    request.input('username', sql.NVarChar, username);
    
    const result = await request.query(query);
    
    return result.recordset[0];
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }

}

// Get user by ID
async function getUserById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = 'Select * from Users where id = @id';
    const request = connection.request();
    request.input('id', sql.Int, id);
    const result = await request.query(query);
    
    return result.recordset[0];
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }

}

// Update user by ID
async function updateUserById(id, userData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `Update Users set username = @username, role = @role where id = @id`;
    const request = connection.request();
    request.input('id', sql.Int, id);
    request.input('username', sql.NVarChar, userData.username);
    request.input('role', sql.NVarChar, userData.role);
    await request.query(query);

    if (userData.role === 'Technician' && userData.name && userData.phone && userData.email) {
      const technicianQuery = `Update Technicians set name = @name, phone = @phone, email = @email where user_id = @user_id`;
      const techRequest = connection.request();
      techRequest.input('name', sql.NVarChar, userData.name);
      techRequest.input('phone', sql.NVarChar, userData.phone);
      techRequest.input('email', sql.NVarChar, userData.email);
      techRequest.input('user_id', sql.Int, id);
      await techRequest.query(technicianQuery);
    }

    return await getUserById(id);
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }

}

// Reset user password
async function resetUserPassword(id, newPassword) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = `Update Users set password_hash = @password_hash where id = @id`;
    const request = connection.request();
    request.input('id', sql.Int, id);
    request.input('password_hash', sql.NVarChar, hashedPassword);
    await request.query(query);

    return { success: true, message: 'Password reset successfully' };
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }

}

// Delete user by ID
async function deleteUserById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

        // First check if user is a technician and delete technician record if exists
    const checkTechnicianQuery = 'SELECT id FROM Technicians WHERE user_id = @userId';
    const techRequest = connection.request();
    techRequest.input('userId', sql.Int, id);
    const techResult = await techRequest.query(checkTechnicianQuery);
    
    if (techResult.recordset.length > 0) {
      // Delete the technician record first
      const deleteTechnicianQuery = 'DELETE FROM Technicians WHERE user_id = @userId';
      const deleteTechRequest = connection.request();
      deleteTechRequest.input('userId', sql.Int, id);
      await deleteTechRequest.query(deleteTechnicianQuery);
    }

    const query = 'Delete from Users where id = @id';
    const request = connection.request();
    request.input('id', sql.Int, id);
    
    await request.query(query);
    return { success: true };
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

// Verify user password
async function verifyPassword(user, password) {
  return await bcrypt.compare(password, user.password_hash);
}

// Generate JWT token
function generateJWT(user) {
  const payload = { id: user.id, username: user.username, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;
}

module.exports = {
  registerUser,
  getAllUsers,
  getUserByUsername,
  getUserById,
  updateUserById,
  deleteUserById,
  verifyPassword,
  generateJWT,
  resetUserPassword
};