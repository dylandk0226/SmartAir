import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isTechnician, isCustomer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to={isAuthenticated ? "/dashboard" : "/login"} className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">SmartAir</span>
            </Link>
            
            {isAuthenticated && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
                >
                  Dashboard
                </Link>

                {/* Admin Menu */}
                {isAdmin && (
                  <>
                    <Link
                      to="/customers"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary-600"
                    >
                      Customers
                    </Link>
                    <Link
                      to="/bookings"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary-600"
                    >
                      All Bookings
                    </Link>
                    <Link
                      to="/service-records"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary-600"
                    >
                      Service History
                    </Link>
                    <Link
                      to="/users"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary-600"
                    >
                      Users
                    </Link>
                  </>
                )}

                {/* Technician Menu */}
                {isTechnician && (
                  <>
                    <Link
                      to="/assignments"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary-600"
                    >
                      My Assignments
                    </Link>
                    <Link
                      to="/assignments/today"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary-600"
                    >
                      Today's Schedule
                    </Link>
                  </>
                )}

                {/* Customer Menu */}
                {isCustomer && (
                  <>
                    <Link
                      to="/bookings"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary-600"
                    >
                      My Bookings
                    </Link>
                    <Link
                      to="/bookings/new"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary-600"
                    >
                      New Booking
                    </Link>
                  </>
                )}

                {/* Common Menu */}
                <Link
                  to="/profile"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary-600"
                >
                  Profile
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-700">{user?.username}</span>
                  <span className="text-xs text-gray-500">{user?.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isAuthenticated && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Dashboard
            </Link>

            {isAdmin && (
              <>
                <Link to="/customers" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
                  Customers
                </Link>
                <Link to="/bookings" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
                  All Bookings
                </Link>
                <Link to="/service-records" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
                  Service History
                </Link>
                <Link to="/users" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
                  Users
                </Link>
              </>
            )}

            {isTechnician && (
              <>
                <Link to="/assignments" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
                  My Assignments
                </Link>
                <Link to="/assignments/today" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
                  Today's Schedule
                </Link>
              </>
            )}

            {isCustomer && (
              <>
                <Link to="/bookings" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
                  My Bookings
                </Link>
                <Link to="/bookings/new" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
                  New Booking
                </Link>
              </>
            )}

            <Link to="/profile" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;