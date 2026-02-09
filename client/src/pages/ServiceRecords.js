import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../services/adminService';
import { getStatusColor } from '../utils/statusColors';

const ServiceRecords = () => {
  const [serviceRecords, setServiceRecords] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [airconUnits, setAirconUnits] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [enrichedRecords, setEnrichedRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    technicianId: 'all',
  });

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (serviceRecords.length === 0) {
      setEnrichedRecords([]);
      return;
    }

    const techMap = {};
    technicians.forEach((t) => {
      techMap[t.id] = t;
    });

    const unitMap = {};
    airconUnits.forEach((u) => {
      unitMap[u.id] = u;
    });

    const custMap = {};
    customers.forEach((c) => {
      custMap[c.id] = c;
    });

    const enriched = serviceRecords.map((record) => {
      const tech = techMap[record.technician_id] || null;
      const unit = unitMap[record.aircon_unit_id] || null;
      const cust = unit ? custMap[unit.customer_id] || null : null;

      return {
        ...record,
        technician_name: tech ? tech.name : 'Unassigned',
        unit_brand: unit ? unit.brand : '-',
        unit_model: unit ? unit.model : '-',
        unit_serial: unit ? unit.serial_number : '-',
        customer_name: cust ? cust.name : '-',
        customer_id: cust ? cust.id : null,
      };
    });

    setEnrichedRecords(enriched);
  }, [serviceRecords, technicians, airconUnits, customers]);


  const applyFilters = useCallback(() => {
    let filtered = [...enrichedRecords];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.customer_name?.toLowerCase().includes(q) ||
          r.technician_name?.toLowerCase().includes(q) ||
          r.unit_serial?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.id?.toString().includes(filters.search)
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    if (filters.technicianId !== 'all') {
      filtered = filtered.filter(
        (r) => r.technician_id?.toString() === filters.technicianId
      );
    }

    setFilteredRecords(filtered);
  }, [enrichedRecords, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [records, techs, units, custs] = await Promise.all([
        adminService.getAllServiceRecords(),
        adminService.getAllTechnicians(),
        adminService.getAllAirconUnits(),
        adminService.getAllCustomers(),
      ]);
      setServiceRecords(records);
      setTechnicians(techs);
      setAirconUnits(units);
      setCustomers(custs);
      setError(null);
    } catch (err) {
      console.error('Error loading service records:', err);
      setError('Failed to load service records');
    } finally {
      setLoading(false);
    }
  };



  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const resetFilters = () => {
    setFilters({ search: '', status: 'all', technicianId: 'all' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (value) => {
    if (value == null) return '$0.00';
    return '$' + Number(value).toFixed(2);
  };

  const stats = {
    total: enrichedRecords.length,
    completed: enrichedRecords.filter((r) => r.status === 'Completed').length,
    pending: enrichedRecords.filter((r) => r.status === 'Pending').length,
    totalRevenue: enrichedRecords.reduce(
      (sum, r) => sum + (Number(r.cost) || 0),
      0
    ),
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDueOrOverdue = (dateStr) => {
    if (!dateStr) return false;
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);
    return due <= today;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
          <button
            onClick={loadAllData}
            className="text-primary-600 hover:text-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Records</h1>
            <p className="mt-2 text-sm text-gray-600">View all service history across every aircon unit</p>
          </div>
        </div>

        {/* stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Records */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Records</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* filter bar + table card */}
        <div className="bg-white rounded-lg shadow mb-6">

          {/* filter row */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  placeholder="Customer, technician, serial, or ID..."
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              {/* Technician */}
              <div>
                <label htmlFor="technicianId" className="block text-sm font-medium text-gray-700 mb-2">
                  Technician
                </label>
                <select
                  id="technicianId"
                  name="technicianId"
                  value={filters.technicianId}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Technicians</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id.toString()}>
                      {tech.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* reset link – only visible when a filter is active */}
            {(filters.search || filters.status !== 'all' || filters.technicianId !== 'all') && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>

          {/* table */}
          <div className="overflow-x-auto">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No service records found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aircon Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Technician
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Due
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className={`transition ${
                        isDueOrOverdue(record.next_due_date)
                          ? 'bg-red-50 hover:bg-red-100'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* ID */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.id}
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{record.customer_name}</div>
                      </td>

                      {/* Aircon Unit  –  brand · model · serial */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.unit_brand} {record.unit_model}
                        </div>
                        <div className="text-sm text-gray-500">S/N: {record.unit_serial}</div>
                      </td>

                      {/* Technician */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.technician_name}
                      </td>

                      {/* Service Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(record.service_date)}
                      </td>

                      {/* Next Due  –  red text when overdue */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm ${
                            isDueOrOverdue(record.next_due_date)
                              ? 'text-red-600 font-semibold'
                              : 'text-gray-900'
                          }`}
                        >
                          {formatDate(record.next_due_date)}
                        </span>
                        {isDueOrOverdue(record.next_due_date) && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                            Overdue
                          </span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(record.cost)}
                      </td>

                      {/* Actions – link to the customer's Aircon tab */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {record.customer_id ? (
                          <Link
                            to={`/customers/${record.customer_id}aircon`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            View Unit
                          </Link>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* footer counter */}
          {filteredRecords.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredRecords.length}</span> of{' '}
                <span className="font-medium">{enrichedRecords.length}</span> service records
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceRecords;