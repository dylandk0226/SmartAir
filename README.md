# SmartAir

**Smart Aircon Service Management System**

A full-stack web application for managing air conditioning service bookings, customer records, technician assignments, and service history.

---

## Quick Links

- **Live Demo:** https://smartair-1vb7.onrender.com
- **Repository:** https://github.com/dylandk0226/SmartAir.git

---

## Features

- **Customer Portal:** Book services, view history, manage profile
- **Admin Dashboard:** Manage bookings, customers, technicians, service records
- **Auto-Service Records:** Automatically creates service records on booking completion
- **Role-Based Access:** Admin, Technician, and Customer roles with specific permissions
- **Secure Authentication:** JWT-based authentication with bcrypt password hashing

---

## Tech Stack

**Frontend:**
- React 18
- React Router
- Tailwind CSS
- Axios

**Backend:**
- Node.js + Express
- Azure SQL Database
- JWT Authentication
- bcrypt Password Hashing

**Deployment:**
- Render (Backend + Frontend)
- Azure SQL Database

---

### Local Setup

**Configure environment variables:**
   
   Create `.env` in root directory:
   ```env
   DB_SERVER=your-server.database.windows.net
   DB_DATABASE=SmartAir
   DB_USER=your-username
   DB_PASSWORD=your-password
   JWT_SECRET=your-secret-key
   PORT=3000
   ```
   
---

## Default Login Credentials

**Admin:**
- Username: `admin1`
- Password: `Admin123!`

**Customer:**
- Username: `customer123`
- Password: `Customer123!`

---

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt (10 salt rounds)
- Protected API routes with role-based access control
- CORS configuration for secure cross-origin requests
- Environment variable management