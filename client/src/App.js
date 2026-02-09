import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import CustomerForm from './pages/CustomerForm';
import AirconUnitForm from './pages/AirconUnitForm';
import Bookings from './pages/Bookings';
import BookingForm from './pages/BookingForm';
import ServiceRecords from './pages/ServiceRecords';
import Users from './pages/Users';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - Customers */}
            <Route
              path="/customers"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <Customers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/:id"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <CustomerDetail />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - Customer Form (Combined Add & Edit) */}
            <Route
              path="/customers/new"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <CustomerForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <CustomerForm />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - Aircon Units Form (Combined Add & Edit) */}
            <Route
              path="/customers/:id/aircon/new"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AirconUnitForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/:id/aircon/:unitId/edit"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AirconUnitForm />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes - Bookings */}
            <Route
              path="/bookings"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <Bookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings/new"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <BookingForm />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - Service Records */}
            <Route
              path="/service-records"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <ServiceRecords />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - Users */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <Users />
                </ProtectedRoute>
              }
            />

            {/* New Booking from Customer Detail page */}
            <Route
              path="/customers/:customerId/bookings/new"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <BookingForm />
                </ProtectedRoute>
              }
            />

            {/* Profile Route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Default Route - Redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
            

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;