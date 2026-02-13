import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import adminService from '../services/adminService';

const BookingForm = () => {
  const navigate = useNavigate();
  const { customerId: customerIdParam, id: bookingIdParam } = useParams();
  const location = useLocation();
  const bookingId = bookingIdParam || location.state?.bookingId;
  const customerId = customerIdParam || location.state?.customerId;
  const isEditMode = !!bookingId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customers, setCustomers] = useState([]);
  const [airconUnits, setAirconUnits] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(customerId || '');

  const [formData, setFormData] = useState({
    customer_id: customerId || '',
    aircon_unit_id: '',
    service_type: 'maintenance',
    preferred_date: '',
    preferred_time: 'morning',
    service_address: '',
    postal_code: '',
    contact_phone: '',
    aircon_brand: '',
    aircon_model: '',
    issue_description: '',
    technician_id: '',
  });

  const loadCustomerData = useCallback(async (custId) => {
    try {
      const customer = await adminService.getCustomerById(custId);
      const units = await adminService.getAllAirconUnits();
      const customerUnits = units.filter(unit => unit.customer_id === parseInt(custId));
      
      setAirconUnits(customerUnits);
      
      if (!isEditMode) {
        setFormData(prev => ({
          ...prev,
          customer_id: custId,
          service_address: customer.address || '',
          contact_phone: customer.phone || '',
        }));
      }
    } catch (err) {
      console.error('Error loading customer data:', err);
    }
  }, [isEditMode]);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (isEditMode) {
        const booking = await adminService.getBookingById(bookingId);
        setFormData({
          customer_id: booking.customer_id,
          aircon_unit_id: booking.aircon_unit_id || '',
          service_type: booking.service_type.toLowerCase(),
          preferred_date: booking.preferred_date,
          preferred_time: booking.preferred_time.toLowerCase(),
          service_address: booking.service_address,
          postal_code: booking.postal_code || '',
          contact_phone: booking.contact_phone,
          aircon_brand: booking.aircon_brand || '',
          aircon_model: booking.aircon_model || '',
          issue_description: booking.issue_description || '',
          technician_id: booking.technician_id || '',
        });
        setSelectedCustomer(booking.customer_id);
      }

      if (!customerId) {
        const allCustomers = await adminService.getAllCustomers();
        setCustomers(allCustomers);
      }

      // Load technicians
      const allTechnicians = await adminService.getAllTechnicians();
      setTechnicians(allTechnicians);

      if (customerId) {
        await loadCustomerData(customerId);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [isEditMode, bookingId, customerId, loadCustomerData]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerData(selectedCustomer);
    }
  }, [selectedCustomer, loadCustomerData]);



  const handleCustomerChange = (e) => {
    const custId = e.target.value;
    setSelectedCustomer(custId);
    setFormData(prev => ({
      ...prev,
      customer_id: custId,
      aircon_unit_id: '',
      aircon_brand: '',
      aircon_model: '',
    }));
  };

  const handleAirconUnitChange = (e) => {
    const unitId = e.target.value;
    const unit = airconUnits.find(u => u.id === parseInt(unitId));
    
    if (unit) {
      setFormData(prev => ({
        ...prev,
        aircon_unit_id: unitId,
        aircon_brand: unit.brand,
        aircon_model: unit.model,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        aircon_unit_id: '',
        aircon_brand: '',
        aircon_model: '',
      }));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let dataToSend;
      
      if (isEditMode) {
        const { customer_id, aircon_unit_id, ...editableFields } = formData;
        dataToSend = editableFields;
      } else {
        dataToSend = {
          ...formData,
          customer_id: parseInt(formData.customer_id),
          aircon_unit_id: formData.aircon_unit_id ? parseInt(formData.aircon_unit_id) : null,
        };
      }

      if (isEditMode) {
        await adminService.updateBooking(bookingId, dataToSend);
        setSuccess('Booking updated successfully!');
      } else {
        await adminService.createBooking(dataToSend);
        setSuccess('Booking created successfully!');
      }

      setTimeout(() => {
        if (customerId) {
          navigate(`/customers/${customerId}bookings`);
        } else {
          navigate('/bookings');
        }
      }, 1500);
    } catch (err) {
      console.error('Error saving booking:', err);
      setError(err.response?.data?.error || 'Failed to save booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (customerId) {
      navigate(`/customers/${customerId}bookings`);
    } else {
      navigate('/bookings');
    }
  };

  if (loading && !formData.customer_id) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Booking' : 'New Booking'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isEditMode ? 'Update booking details' : 'Create a new service booking'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          {!customerId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                name="customer_id"
                value={formData.customer_id}
                onChange={handleCustomerChange}
                required
                disabled={isEditMode}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type <span className="text-red-500">*</span>
              </label>
              <select
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="maintenance">Maintenance</option>
                <option value="repair">Repair</option>
                <option value="installation">Installation</option>
                <option value="inspection">Inspection</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aircon Unit (Optional)
              </label>
              <select
                name="aircon_unit_id"
                value={formData.aircon_unit_id}
                onChange={handleAirconUnitChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                disabled={!selectedCustomer}
              >
                <option value="">None (New Installation)</option>
                {airconUnits.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.brand} {unit.model} - {unit.serial_number}
                  </option>
                ))}
              </select>
              {!selectedCustomer && (
                <p className="mt-1 text-sm text-gray-500">Select a customer first</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="preferred_date"
                value={formData.preferred_date}
                onChange={handleChange}
                required
                min={isEditMode ? undefined : new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time <span className="text-red-500">*</span>
              </label>
              <select
                name="preferred_time"
                value={formData.preferred_time}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="morning">Morning (9AM - 12PM)</option>
                <option value="afternoon">Afternoon (12PM - 3PM)</option>
                <option value="evening">Evening (3PM - 6PM)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="service_address"
              value={formData.service_address}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Enter the service address"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                maxLength={6}
                placeholder="e.g., 123456"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                required
                maxLength={8}
                placeholder="e.g., 91234567"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {!formData.aircon_unit_id && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aircon Brand
                </label>
                <input
                  type="text"
                  name="aircon_brand"
                  value={formData.aircon_brand}
                  onChange={handleChange}
                  placeholder="e.g., Daikin, Mitsubishi"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aircon Model
                </label>
                <input
                  type="text"
                  name="aircon_model"
                  value={formData.aircon_model}
                  onChange={handleChange}
                  placeholder="e.g., FTXM25N"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          )}

          {/* Assign Technician */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Technician
            </label>
            <select
              name="technician_id"
              value={formData.technician_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">-- No Technician Assigned --</option>
              {technicians.map(tech => (
                <option key={tech.id} value={tech.id}>
                  {tech.name} - {tech.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Description
            </label>
            <textarea
              name="issue_description"
              value={formData.issue_description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the issue or service requirements..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Booking' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;