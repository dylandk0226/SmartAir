import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';

const Technicians = () => {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    try {
      setLoading(true);
      // Get all technicians
      const techData = await adminService.getAllTechnicians();
      
      // Get all bookings to count assignments
      const bookings = await adminService.getAllBookings();
      
      // Count bookings per technician
      const techniciansWithBookings = techData.map(tech => {
        const assignedBookings = bookings.filter(
          booking => booking.technician_id === tech.id
        );
        
        return {
          ...tech,
          assignedJobs: assignedBookings.length,
          bookings: assignedBookings
        };
      });
      
      setTechnicians(techniciansWithBookings);
    } catch (err) {
      console.error('Error loading technicians:', err);
      setError('Failed to load technicians');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manage Technicians
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                View technicians and their assigned jobs
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Technicians List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Technicians ({technicians.length})
            </h2>
          </div>

          {technicians.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4">No technicians found</p>
              <Link
                to="/users"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Go to Users Page
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {technicians.map((technician) => (
                <div key={technician.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    {/* Technician Info */}
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-medium text-sm">
                              {technician.name?.charAt(0)?.toUpperCase() || 'T'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">
                            {technician.name}
                          </h3>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {technician.email}
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {technician.phone}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Assigned Jobs Count */}
                    <div className="ml-4 flex-shrink-0 flex items-center">
                      <div className="text-right mr-4">
                        <p className="text-2xl font-bold text-gray-900">
                          {technician.assignedJobs}
                        </p>
                        <p className="text-sm text-gray-500">
                          Assigned {technician.assignedJobs === 1 ? 'Job' : 'Jobs'}
                        </p>
                      </div>
                      
                      {/* View Jobs Button */}
                      {technician.assignedJobs > 0 && (
                        <button
                          onClick={() => {
                            // Show bookings for this technician
                            navigate('/bookings', { 
                              state: { 
                                technicianId: technician.id,
                                technicianName: technician.name 
                              } 
                            });
                          }}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                        >
                          View Jobs
                          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Show assigned bookings if expanded */}
                  {technician.assignedJobs > 0 && (
                    <div className="mt-4 pl-14">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-700 mb-2">Recent Assignments:</p>
                        <div className="space-y-1">
                          {technician.bookings.slice(0, 3).map((booking) => (
                            <div key={booking.id} className="text-xs text-gray-600">
                              • Booking {booking.id} - {booking.service_type}
                            </div>
                          ))}
                          {technician.bookings.length > 3 && (
                            <p className="text-xs text-gray-500 italic">
                              +{technician.bookings.length - 3} more...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={() => navigate('/users')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Manage All Users
          </button>
          <button
            onClick={() => navigate('/bookings')}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            View All Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Technicians;