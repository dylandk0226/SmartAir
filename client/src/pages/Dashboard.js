import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import TechnicianDashboard from './TechnicianDashboard';
import CustomerDashboard from './CustomerDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'Admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'Technician') {
    return <TechnicianDashboard />;
  }

  if (user?.role === 'Customer') {
    return <CustomerDashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Unknown User Role</h1>
        <p className="text-gray-600">Please contact support.</p>
      </div>
    </div>
  );
};

export default Dashboard;