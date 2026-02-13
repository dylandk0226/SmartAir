import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import customerService from '../services/customerService';

const CustomerBookingCalendar = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [airconUnits, setAirconUnits] = useState([]);
  const [selectedAirconUnit, setSelectedAirconUnit] = useState('');

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingAvailability, setBookingAvailability] = useState({});

  const [formData, setFormData] = useState({
    service_type: '',
    service_address: '',
    postal_code: '',
    contact_phone: '',
    aircon_brand: '',
    aircon_model: '',
    issue_description: '',
  });

  const serviceTypes = [
    'inspection',
    'repair',
    'installation',
    'maintenance',
  ];

  const timeSlots = [
    'morning',
    'afternoon',
    'evening',
  ];

  const loadCustomerProfile = useCallback(async () => {
    try {
      const profile = await customerService.getMyProfile();

      setFormData(prev => ({
        ...prev,
        service_address: profile.service_address || '',
        postal_code: profile.postal_code || '',
        contact_phone: profile.contact_phone || profile.phone || '',
      }));

      if (profile.aircon_units && profile.aircon_units.length > 0) {
        setAirconUnits(profile.aircon_units);
      }
    } catch (err) {
      console.error('Error loading customer profile:', err);
    }
  }, []);

  const loadAvailability = useCallback(async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const availability = await customerService.getBookingAvailability(
        firstDay.toISOString().split('T')[0],
        lastDay.toISOString().split('T')[0]
      );
      
      setBookingAvailability(availability);
    } catch (err) {
      console.error('Error loading availability:', err);
    }
  }, [currentMonth]);
  
  useEffect(() => {
    loadCustomerProfile();
    loadAvailability();
  }, [loadCustomerProfile, loadAvailability]);

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateAvailable = (date) => {
    if (!date) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    const dayAvailability = bookingAvailability[dateStr];

    if (!dayAvailability) return true;

    return dayAvailability.morning < 1 || 
           dayAvailability.afternoon < 1 || 
           dayAvailability.evening < 1;
  };

  const getAvailableTimeSlots = (date) => {
    if (!date) return [];
    
    const dateStr = date.toISOString().split('T')[0];
    const dayAvailability = bookingAvailability[dateStr];
    
    if (!dayAvailability) {
      return timeSlots;
    }
    
    return timeSlots.filter(slot => {
      return (dayAvailability[slot] || 0) < 1;
    });
  };

  const getDateStatus = (date) => {
    if (!date) return '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return 'past';
    
    const dateStr = date.toISOString().split('T')[0];
    const dayAvailability = bookingAvailability[dateStr];
    
    if (!dayAvailability) return 'available';
    
    const totalBookings = (dayAvailability.morning || 0) + 
                          (dayAvailability.afternoon || 0) + 
                          (dayAvailability.evening || 0);
    
    if (totalBookings >= 3) return 'fully-booked';
    if (totalBookings >= 2) return 'limited';
    return 'available';
  };

  const handleDateClick = (date) => {
    if (!isDateAvailable(date)) return;
    
    setSelectedDate(date);
    setSelectedTime('');
    setError('');
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    setSelectedDate(null);
    setSelectedTime('');
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    setSelectedDate(null);
    setSelectedTime('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleAirconUnitChange = (e) => {
    const unitId = e.target.value;
    setSelectedAirconUnit(unitId);
    
    if (unitId) {
      const unit = airconUnits.find(u => u.id === parseInt(unitId));
      if (unit) {
        setFormData(prev => ({
          ...prev,
          aircon_brand: unit.brand || '',
          aircon_model: unit.model || '',
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        aircon_brand: '',
        aircon_model: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }
    
    if (!selectedTime) {
      setError('Please select a time slot');
      return;
    }
    
    if (!formData.service_type) {
      setError('Please select a service type');
      return;
    }
    
    if (!formData.service_address) {
      setError('Please enter service address');
      return;
    }
    
    if (!formData.contact_phone) {
      setError('Please enter contact phone');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const bookingData = {
        ...formData,
        preferred_date: selectedDate.toISOString().split('T')[0],
        preferred_time: selectedTime,
      };

      await customerService.createBooking(bookingData);
      setSuccess('Booking created successfully!');
      
      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.error || 'Failed to create booking');
      setSaving(false);
    }
  };

  const days = getDaysInMonth();
  const availableSlots = selectedDate ? getAvailableTimeSlots(selectedDate) : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Schedule a Service</h1>
          <p className="mt-2 text-sm text-gray-600">
            Select an available date and time for your service
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg font-semibold">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} />;
                }
                
                const status = getDateStatus(date);
                const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                const isAvailable = isDateAvailable(date);
                
                let dayClasses = "aspect-square flex items-center justify-center rounded-lg cursor-pointer transition ";
                
                if (status === 'past') {
                  dayClasses += "bg-gray-100 text-gray-400 cursor-not-allowed";
                } else if (status === 'fully-booked') {
                  dayClasses += "bg-red-100 text-red-400 cursor-not-allowed";
                } else if (status === 'limited') {
                  dayClasses += "bg-yellow-100 text-yellow-700 hover:bg-yellow-200";
                } else if (isSelected) {
                  dayClasses += "bg-primary-600 text-white";
                } else {
                  dayClasses += "bg-green-50 text-green-700 hover:bg-green-100";
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    disabled={!isAvailable}
                    className={dayClasses}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-green-50 border border-green-200 mr-2"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200 mr-2"></div>
                <span>Limited availability</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-red-100 border border-red-200 mr-2"></div>
                <span>Fully booked</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200 mr-2"></div>
                <span>Past date</span>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selected Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Date
                </label>
                <input
                  type="text"
                  value={selectedDate ? selectedDate.toLocaleDateString() : 'No date selected'}
                  readOnly
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>

              {/* Time Slot */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Slot <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">-- Select Time --</option>
                    {availableSlots.map(slot => (
                      <option key={slot} value={slot}>
                        {slot.charAt(0).toUpperCase() + slot.slice(1)}
                      </option>
                    ))}
                  </select>
                  {availableSlots.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">No time slots available for this date</p>
                  )}
                </div>
              )}

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">-- Select Service --</option>
                  {serviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Service Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="service_address"
                  value={formData.service_address}
                  onChange={handleChange}
                  rows="2"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 123 Clementi Ave 3, #01-01"
                  required
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  maxLength="6"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 123456"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  maxLength="8"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 91234567"
                  required
                />
              </div>

              {/* Aircon Unit Selector - only show if customer has units */}
              {airconUnits.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Aircon Unit
                  </label>
                  <select
                    value={selectedAirconUnit}
                    onChange={handleAirconUnitChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">-- Select Aircon Unit --</option>
                    {airconUnits.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.brand} {unit.model} - {unit.location}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Select an existing unit to auto-fill brand and model
                  </p>
                </div>
              )}

              {/* Aircon Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aircon Brand
                </label>
                <input
                  type="text"
                  name="aircon_brand"
                  value={formData.aircon_brand}
                  onChange={handleChange}
                  readOnly={!!selectedAirconUnit}
                  className={`block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 ${selectedAirconUnit ? 'bg-gray-50' : ''}`}
                  placeholder="e.g., Daikin, Mitsubishi"
                />
                {selectedAirconUnit && (
                  <p className="mt-1 text-xs text-gray-500">
                    Auto-filled from selected unit
                  </p>
                )}
              </div>

              {/* Aircon Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aircon Model
                </label>
                <input
                  type="text"
                  name="aircon_model"
                  value={formData.aircon_model}
                  onChange={handleChange}
                  readOnly={!!selectedAirconUnit}
                  className={`block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 ${selectedAirconUnit ? 'bg-gray-50' : ''}`}
                  placeholder="e.g., FTXS35K"
                />
                {selectedAirconUnit && (
                  <p className="mt-1 text-xs text-gray-500">
                    Auto-filled from selected unit
                  </p>
                )}
              </div>

              {/* Issue Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Description
                </label>
                <textarea
                  name="issue_description"
                  value={formData.issue_description}
                  onChange={handleChange}
                  rows="3"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe the issue or service needed..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving || !selectedDate || !selectedTime}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {saving ? 'Creating Booking...' : 'Book Service'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerBookingCalendar;