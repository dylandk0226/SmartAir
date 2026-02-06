import api from './api';

const customerService = {
  async getMyProfile() {
    const response = await api.get('/customer/profile');
    return response.data;
  },

  async updateMyProfile(profileData) {
    const response = await api.put('/customer/profile', profileData);
    return response.data;
  },

  async getMyBookings() {
    const response = await api.get('/customer/bookings');
    return response.data;
  },

  async createBooking(bookingData) {
    const response = await api.post('/customer/bookings', bookingData);
    return response.data;
  },

  async getBookingById(id) {
    const response = await api.get(`/customer/bookings/${id}`);
    return response.data;
  },

  async updateBooking(id, bookingData) {
    const response = await api.put(`/customer/bookings/${id}`, bookingData);
    return response.data;
  },

  async cancelBooking(id) {
    const response = await api.put(`/customer/bookings/${id}/cancel`);
    return response.data;
  },
};

export default customerService;