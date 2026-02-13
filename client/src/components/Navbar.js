import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isTechnician, isCustomer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/bookings' || path === '/bookings/new') {
      return location.pathname === path;
    }

    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }

    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getNavLinkClass = (path) => {
    return isActive(path)
      ? "inline-flex items-center px-1 pt-1 text-sm font-bold text-gray-900"
      : "inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900";
  };

  const getMobileNavLinkClass = (path) => {
    return isActive(path)
      ? "block pl-3 pr-4 py-2 text-base font-bold text-gray-900"
      : "block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50";
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
                  className={getNavLinkClass('/dashboard')}
                >
                  Dashboard
                </Link>

                {/* Admin Menu */}
                {isAdmin && (
                  <>
                    <Link
                      to="/customers"
                      className={getNavLinkClass('/customers')}
                    >
                      Customers
                    </Link>
                    <Link
                      to="/bookings"
                      className={getNavLinkClass('/bookings')}
                    >
                      All Bookings
                    </Link>
                    <Link
                      to="/service-records"
                      className={getNavLinkClass('/service-records')}
                    >
                      Service History
                    </Link>
                    <Link
                      to="/technicians"
                      className={getNavLinkClass('/technicians')}
                    >
                      Technicians
                    </Link>
                    <Link
                      to="/users"
                      className={getNavLinkClass('/users')}
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
                      className={getNavLinkClass('/bookings')}
                    >
                      My Bookings
                    </Link>
                    <Link
                      to="/bookings/new"
                      className={getNavLinkClass('/bookings/new')}
                    >
                      New Booking
                    </Link>
                    <Link
                      to="/service-history"
                      className={getNavLinkClass('/service-history')}
                    >
                      Service History
                    </Link>
                  </>
                )}

                {/* Common Menu */}
                <Link
                  to="/profile"
                  className={getNavLinkClass('/profile')}
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
              className={getMobileNavLinkClass('/dashboard')}
            >
              Dashboard
            </Link>

            {isAdmin && (
              <>
                <Link to="/customers" className={getMobileNavLinkClass('/customers')}>
                  Customers
                </Link>
                <Link to="/bookings" className={getMobileNavLinkClass('/bookings')}>
                  All Bookings
                </Link>
                <Link to="/service-records" className={getMobileNavLinkClass('/service-records')}>
                  Service History
                </Link>
                <Link to="/technicians" className={getMobileNavLinkClass('/technicians')}>
                  Technicians
                </Link>
                <Link to="/users" className={getMobileNavLinkClass('/users')}>
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
                <Link to="/bookings" className={getMobileNavLinkClass('/bookings')}>
                  My Bookings
                </Link>
                <Link to="/bookings/new" className={getMobileNavLinkClass('/bookings/new')}>
                  New Booking
                </Link>
                <Link to="/service-history" className={getMobileNavLinkClass('/service-history')}>
                  Service History
                </Link>
              </>
            )}

            <Link to="/profile" className={getMobileNavLinkClass('/profile')}>
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;