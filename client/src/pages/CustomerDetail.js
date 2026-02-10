import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import adminService from '../services/adminService';
import { getStatusColor } from '../utils/statusColors';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [customer, setCustomer] = useState(null);
  const [airconUnits, setAirconUnits] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [serviceRecords, setServiceRecords] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('profile');
  const [statusModal, setStatusModal] = useState({ open: false, bookingId: null, currentStatus: '' });


  const loadCustomerData = useCallback(async () => {
    try {
      setError(null);

      const customerData = await adminService.getCustomerById(id);

      if (!customerData) {
        setError('Customer not found');
        return;
      }

      setCustomer(customerData);

      const [airconUnitsResult, bookingsResult, serviceRecordsResult, techniciansResult] = await Promise.allSettled([
        adminService.getAllAirconUnits(),
        adminService.getAllBookings(),
        adminService.getAllServiceRecords(),
        adminService.getAllTechnicians(),
      ]);

      const allAirconUnits = airconUnitsResult.status === 'fulfilled' ? airconUnitsResult.value : [];
      const customerAirconUnits = allAirconUnits.filter(unit => unit.customer_id === parseInt(id));
      setAirconUnits(customerAirconUnits);

      const allBookings = bookingsResult.status === 'fulfilled' ? bookingsResult.value : [];
      const customerBookings = allBookings.filter(booking => booking.customer_id === parseInt(id));
      setBookings(customerBookings);

      const allServiceRecords = serviceRecordsResult.status === 'fulfilled' ? serviceRecordsResult.value : [];
      
      const customerServiceRecords = allServiceRecords.filter(record => 
        customerAirconUnits.some(unit => unit.id === record.aircon_unit_id)
      );
      
      setServiceRecords(customerServiceRecords);

      const allTechnicians = techniciansResult.status === 'fulfilled' ? techniciansResult.value : [];
      setTechnicians(allTechnicians);

      if (airconUnitsResult.status === 'rejected') {
        console.warn('Failed to load aircon units:', airconUnitsResult.reason);
      }
      if (bookingsResult.status === 'rejected') {
        console.warn('Failed to load bookings:', bookingsResult.reason);
      }
      if (serviceRecordsResult.status === 'rejected') {
        console.warn('Failed to load service records:', serviceRecordsResult.reason);
      }
      if (techniciansResult.status === 'rejected') {
        console.warn('Failed to load technicians:', techniciansResult.reason);
      }
      
    } catch (error) {
      console.error('Error loading customer data:', error);
      setError(error.response?.data?.error || 'Failed to load customer data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCustomerData();
  }, [id, location.key, loadCustomerData]);

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['profile', 'aircon', 'bookings', 'service'].includes(hash)) {
      setActiveTab(hash);
    } else if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.hash, location.state]);

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      assigned: 'Assigned',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  const handleEditBooking = (bookingId, customerId) => {
    navigate('/bookings/new', { state: { bookingId, customerId } });
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await adminService.updateBookingStatus(statusModal.bookingId, newStatus);
      setStatusModal({ open: false, bookingId: null, currentStatus: '' });
      await loadCustomerData();
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    }
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Customer Not Found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {error 
              ? 'There was an error loading the customer data.'
              : 'The customer you are looking for does not exist.'
            }
          </p>
          <Link to="/customers" className="text-primary-600 hover:text-primary-700">
            ← Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/customers" className="text-sm text-primary-600 hover:text-primary-700 mb-4 inline-block">
            ← Back to Customers
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
              <p className="mt-2 text-gray-600">Customer ID: {customer.id}</p>
            </div>

          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Aircon Units</p>
                <p className="text-2xl font-semibold text-gray-900">{airconUnits.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Service Records</p>
                <p className="text-2xl font-semibold text-gray-900">{serviceRecords.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Pending Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('profile')}
                className={`${
                  activeTab === 'profile'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('aircon')}
                className={`${
                  activeTab === 'aircon'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Aircon Units ({airconUnits.length})
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`${
                  activeTab === 'bookings'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Bookings ({bookings.length})
              </button>
              <button
                onClick={() => setActiveTab('service')}
                className={`${
                  activeTab === 'service'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Service History ({serviceRecords.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                {/* Edit Profile Button */}
                <div className="flex justify-end mb-6">
                  <Link
                    to={`/customers/${customer.id}/edit`}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="mt-1 text-sm text-gray-900">{customer.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-sm text-gray-900">{customer.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p className="mt-1 text-sm text-gray-900">{customer.phone}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p className="mt-1 text-sm text-gray-900">{customer.address}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Customer Since</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">User ID</h3>
                    <p className="mt-1 text-sm text-gray-900">{customer.user_id}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Aircon Units Tab */}
            {activeTab === 'aircon' && (
              <div>
                {/* Add Aircon Unit Button */}
                <div className="flex justify-end mb-6">
                  <Link
                    to={`/customers/${customer.id}/aircon/new`}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Aircon Unit
                  </Link>
                </div>

                {airconUnits.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No aircon units</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding an aircon unit.</p>
                    <div className="mt-6">
                      <Link
                        to={`/customers/${customer.id}/aircon/new`}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Aircon Unit
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {airconUnits.map((unit) => (
                      <div key={unit.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition relative">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{unit.brand} {unit.model}</h3>
                            <p className="text-sm text-gray-500">Unit ID: {unit.id}</p>
                          </div>
                          {unit.status && (
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(unit.status)}`}>
                              {unit.status}
                            </span>
                          )}
                        </div>
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Serial Number:</dt>
                            <dd className="text-sm font-medium text-gray-900">{unit.serial_number}</dd>
                          </div>
                          {unit.purchase_date && (
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-500">Purchase Date:</dt>
                              <dd className="text-sm font-medium text-gray-900">
                                {new Date(unit.purchase_date).toLocaleDateString()}
                              </dd>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Warranty Expires:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {unit.warranty_expiry ? new Date(unit.warranty_expiry).toLocaleDateString() : 'N/A'}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Installation Address:</dt>
                            <dd className="text-sm font-medium text-gray-900">{unit.installation_address || 'N/A'}</dd>
                          </div>
                        </dl>
                        {/* Edit Aircon Button */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <Link
                            to={`/customers/${customer.id}/aircon/${unit.id}/edit`}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Unit
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Bookings</h3>
                  <Link
                    to={`/customers/${id}/bookings/new`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Booking
                  </Link>
                </div>
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new booking.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking.service_type}
                            </h3>
                            <p className="text-sm text-gray-500">Booking ID: {booking.id}</p>
                          </div>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {getStatusLabel(booking.status)}
                          </span>
                        </div>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <dt className="text-sm text-gray-500">Preferred Date:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {booking.preferred_date ? new Date(booking.preferred_date).toLocaleDateString() : 'N/A'}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm text-gray-500">Preferred Time:</dt>
                            <dd className="text-sm font-medium text-gray-900">{booking.preferred_time || 'N/A'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm text-gray-500">Service Address:</dt>
                            <dd className="text-sm font-medium text-gray-900">{booking.service_address || 'N/A'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm text-gray-500">Contact Phone:</dt>
                            <dd className="text-sm font-medium text-gray-900">{booking.contact_phone || 'N/A'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm text-gray-500">Assigned Technician:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {booking.technician_id ? (
                                <div className="flex items-center">
                                  <span>
                                    {technicians.find(t => t.id === booking.technician_id)?.name || 'Unknown'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">Not assigned</span>
                              )}
                            </dd>
                          </div>
                          {booking.unit_brand && (
                            <div>
                              <dt className="text-sm text-gray-500">Aircon Unit:</dt>
                              <dd className="text-sm font-medium text-gray-900">{booking.unit_brand} {booking.unit_model}</dd>
                            </div>
                          )}
                          {booking.issue_description && (
                            <div className="md:col-span-2">
                              <dt className="text-sm text-gray-500">Issue Description:</dt>
                              <dd className="text-sm font-medium text-gray-900">{booking.issue_description}</dd>
                            </div>
                          )}
                        </dl>
                        {/* Booking Actions */}
                        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center space-x-3">
                          <button
                            onClick={() => handleEditBooking(booking.id, booking.customer_id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => setStatusModal({ open: true, bookingId: booking.id, currentStatus: booking.status })}
                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Update Status
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Service History Tab */}
            {activeTab === 'service' && (
              <div>
                {serviceRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No service records</h3>
                    <p className="mt-1 text-sm text-gray-500">Service history will appear here once services are completed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {serviceRecords.map((record) => (
                      <div key={record.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Service Record {record.id}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Aircon Unit ID: {record.aircon_unit_id}
                            </p>
                          </div>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </div>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <dt className="text-sm text-gray-500">Service Date:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {record.service_date ? new Date(record.service_date).toLocaleDateString() : 'N/A'}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm text-gray-500">Next Due Date:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {record.next_due_date ? new Date(record.next_due_date).toLocaleDateString() : 'N/A'}
                            </dd>
                          </div>
                          {record.technician_id && (
                            <div>
                              <dt className="text-sm text-gray-500">Technician ID:</dt>
                              <dd className="text-sm font-medium text-gray-900">{record.technician_id}</dd>
                            </div>
                          )}
                          {record.description && (
                            <div className="md:col-span-2">
                              <dt className="text-sm text-gray-500">Description:</dt>
                              <dd className="text-sm font-medium text-gray-900">{record.description}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Status Update Modal */}
    {statusModal.open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black opacity-50" onClick={() => setStatusModal({ open: false, bookingId: null, currentStatus: '' })}></div>
        <div className="bg-white rounded-lg shadow-xl z-10 w-full max-w-md mx-4">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Update Booking Status</h3>
            <p className="text-sm text-gray-500 mb-4">
              Booking {statusModal.bookingId} — current status:{' '}
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(statusModal.currentStatus)}`}>
                {getStatusLabel(statusModal.currentStatus)}
              </span>
            </p>

            <div className="grid grid-cols-2 gap-3">
              {['pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  disabled={status === statusModal.currentStatus}
                  onClick={() => handleStatusUpdate(status)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition
                    ${status === statusModal.currentStatus
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  {getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end">
            <button
              onClick={() => setStatusModal({ open: false, bookingId: null, currentStatus: '' })}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default CustomerDetail;