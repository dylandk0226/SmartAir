import api from './api';

const adminService = {
  async getAllCustomers() {
    const response = await api.get('/customers');
    return response.data;
  },

  async getCustomerById(id) {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  async createCustomer(data) {
    const response = await api.post('/customers', data);
    return response.data;
  },

  async updateCustomer(id, data) {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  async deleteCustomer(id) {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  async getAllAirconUnits() {
    const response = await api.get('/airconunits');
    return response.data;
  },

  async getAirconUnitById(id) {
    const response = await api.get(`/airconunits/${id}`);
    return response.data;
  },

  async createAirconUnit(data) {
    const response = await api.post('/airconunits', data);
    return response.data;
  },

  async updateAirconUnit(id, data) {
    const response = await api.put(`/airconunits/${id}`, data);
    return response.data;
  },

  async deleteAirconUnit(id) {
    const response = await api.delete(`/airconunits/${id}`);
    return response.data;
  },

  async getAllBookings() {
    const response = await api.get('/bookings');
    return response.data;
  },

  async getBookingById(id) {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  async createBooking(data) {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  async updateBooking(id, data) {
    const response = await api.put(`/bookings/${id}`, data);
    return response.data;
  },

  async deleteBooking(id) {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },

  async updateBookingStatus(id, status) {
    const response = await api.put(`/bookings/${id}/status`, { status });
    return response.data;
  },

  async getAllServiceRecords() {
    const response = await api.get('/servicerecords');
    return response.data;
  },

  async getServiceRecordById(id) {
    const response = await api.get(`/servicerecords/${id}`);
    return response.data;
  },

  async createServiceRecord(data) {
    const response = await api.post('/servicerecords', data);
    return response.data;
  },

  async updateServiceRecord(id, data) {
    const response = await api.put(`/servicerecords/${id}`, data);
    return response.data;
  },

  async deleteServiceRecord(id) {
    const response = await api.delete(`/servicerecords/${id}`);
    return response.data;
  },

  async getAllTechnicians() {
    const response = await api.get('/technicians');
    return response.data;
  },

  async getTechnicianById(id) {
    const response = await api.get(`/technicians/${id}`);
    return response.data;
  },

  async createTechnician(data) {
    const response = await api.post('/technicians', data);
    return response.data;
  },

  async updateTechnician(id, data) {
    const response = await api.put(`/technicians/${id}`, data);
    return response.data;
  },

  async deleteTechnician(id) {
    const response = await api.delete(`/technicians/${id}`);
    return response.data;
  },

  async getAllUsers() {
    const response = await api.get('/users');
    return response.data;
  },

  async getUserById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async createUser(data) {
    const response = await api.post('/register', data);
    return response.data;
  },

  async updateUser(id, data) {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  async resetUserPassword(id, data) {
    const response = await api.post(`/users/${id}/resetpassword`, data);
    return response.data;
  },
  async getDashboardStats() {
    try {
      const [customers, bookings, serviceRecords, technicians] = await Promise.all([
        this.getAllCustomers(),
        this.getAllBookings(),
        this.getAllServiceRecords(),
        this.getAllTechnicians(),
      ]);

      return {
        totalCustomers: customers.length,
        totalBookings: bookings.length,
        totalServiceRecords: serviceRecords.length,
        totalTechnicians: technicians.length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
        recentBookings: bookings.slice(0, 10),
        recentServiceRecords: serviceRecords.slice(0, 5),
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },
};

export default adminService;