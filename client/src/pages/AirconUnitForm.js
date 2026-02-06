import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import adminService from '../services/adminService';

const AirconUnitForm = () => {
  const { id: customerId, unitId } = useParams();
  const navigate = useNavigate();

  const isEditMode = !!unitId;
  
  const [customer, setCustomer] = useState(null);
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    warranty_expiry: '',
    installation_address: '',
  });

  const loadData = useCallback(async () => {
    try {
      if (isEditMode) {
        const [customerData, unitData] = await Promise.all([
          adminService.getCustomerById(customerId),
          adminService.getAirconUnitById(unitId),
        ]);

        setCustomer(customerData);
        setUnit(unitData);

        setFormData({
          brand: unitData.brand || '',
          model: unitData.model || '',
          serial_number: unitData.serial_number || '',
          purchase_date: unitData.purchase_date ? unitData.purchase_date.split('T')[0] : '',
          warranty_expiry: unitData.warranty_expiry ? unitData.warranty_expiry.split('T')[0] : '',
          installation_address: unitData.installation_address || '',
        });
      } else {
        const customerData = await adminService.getCustomerById(customerId);
        setCustomer(customerData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [isEditMode, customerId, unitId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.brand || !formData.model || !formData.serial_number || 
        !formData.purchase_date || !formData.warranty_expiry || !formData.installation_address) {
      setError('All fields are required');
      return;
    }

    if (formData.installation_address.length < 5) {
      setError('Installation address must be at least 5 characters');
      return;
    }

    setSaving(true);

    try {
      const dataToSend = {
        customer_id: parseInt(customerId),
        brand: formData.brand,
        model: formData.model,
        serial_number: formData.serial_number,
        purchase_date: formData.purchase_date,
        warranty_expiry: formData.warranty_expiry,
        installation_address: formData.installation_address,
      };

      if (isEditMode) {
        await adminService.updateAirconUnit(unitId, dataToSend);
        navigate(`/customers/${customerId}aircon`, { replace: true });
      } else {
        await adminService.createAirconUnit(dataToSend);
        navigate(`/customers/${customerId}aircon`, { replace: true });
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} aircon unit:`, error);
      setError(error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'add'} aircon unit`);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this aircon unit? This action cannot be undone.')) {
      return;
    }

    try {
      await adminService.deleteAirconUnit(unitId);
      navigate(`/customers/${customerId}aircon`, { replace: true });
    } catch (error) {
      console.error('Error deleting aircon unit:', error);
      alert(error.response?.data?.error || 'Failed to delete aircon unit');
    }
  };

  const handleCancel = () => {
    navigate(`/customers/${customerId}aircon`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/customers/${customerId}aircon`}
            className="text-sm text-primary-600 hover:text-primary-700 mb-4 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {customer?.name}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit' : 'Add'} Aircon Unit
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditMode 
              ? `${unit?.brand} ${unit?.model} - Serial: ${unit?.serial_number}`
              : `Add a new aircon unit for ${customer?.name}`
            }
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Brand & Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                  Brand <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  required
                  maxLength="50"
                  value={formData.brand}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="e.g., Daikin, Mitsubishi, LG"
                />
              </div>

              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  required
                  maxLength="50"
                  value={formData.model}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="e.g., FTKM25U2V, MSZ-AP25VG"
                />
              </div>
            </div>

            {/* Serial Number */}
            <div>
              <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700 mb-2">
                Serial Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="serial_number"
                name="serial_number"
                required
                maxLength="100"
                value={formData.serial_number}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="e.g., ABC123456789"
              />
            </div>

            {/* Purchase Date & Warranty Expiry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="purchase_date"
                  name="purchase_date"
                  required
                  value={formData.purchase_date}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label htmlFor="warranty_expiry" className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty Expiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="warranty_expiry"
                  name="warranty_expiry"
                  required
                  value={formData.warranty_expiry}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Installation Address */}
            <div>
              <label htmlFor="installation_address" className="block text-sm font-medium text-gray-700 mb-2">
                Installation Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="installation_address"
                name="installation_address"
                required
                rows="3"
                maxLength="255"
                value={formData.installation_address}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="e.g., 123 Main Street, #01-01, Singapore 123456"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {saving ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditMode ? 'Saving...' : 'Adding...'}
                  </span>
                ) : (
                  isEditMode ? 'Save Changes' : 'Add Aircon Unit'
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Delete Button - Only show in Edit Mode */}
          {isEditMode && (
            <div className="px-6 pb-6">
              <div className="pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
                >
                  Delete Aircon Unit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AirconUnitForm;