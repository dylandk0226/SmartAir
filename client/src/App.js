import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import Technicians from './pages/Technicians';
import Users from './pages/Users';
import Profile from './pages/Profile';
import CustomerServiceHistory from './pages/CustomerServiceHistory';
import CustomerBookingCalendar from './pages/CustomerBookingCalendar';

// Root redirect component - checks authentication before redirecting
function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

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
            
            {/* Bookings Route - handles Admin and Customer */}
            <Route
              path="/bookings"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Customer']}>
                  <Bookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings/new/admin"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <BookingForm />
                </ProtectedRoute>
              }
            />
            {/* Customer New Booking - Calendar view */}
            <Route
              path="/bookings/new"
              element={
                <ProtectedRoute allowedRoles={['Customer']}>
                  <CustomerBookingCalendar />
                </ProtectedRoute>
              }
            />
            {/* Admin New Booking from Customer Detail */}
            <Route
              path="/customers/:customerId/bookings/new"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <BookingForm />
                </ProtectedRoute>
              }
            />
            {/* Edit/View Booking - Allows BOTH Admin and Customer */}
            <Route
              path="/bookings/:id"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Customer']}>
                  <BookingForm />
                </ProtectedRoute>
              }
            />

            {/* Customer Routes - Service History */}
            <Route
              path="/service-history"
              element={
                <ProtectedRoute allowedRoles={['Customer']}>
                  <CustomerServiceHistory />
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

            {/* Admin Routes - Technicians */}
            <Route
              path="/technicians"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <Technicians />
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

            {/* Profile Route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Default Route - Smart redirect based on authentication */}
            <Route path="/" element={<RootRedirect />} />
            
            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
            

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;