import api from './api';

const technicianService = {
  async getAllTechnicians() {
    const response = await api.get('/technicians');
    return response.data;
  },

  async getTechnicianById(id) {
    const response = await api.get(`/technicians/${id}`);
    return response.data;
  },

  async getTechnicianByUserId(userId) {
    const response = await api.get(`/technicians/user/${userId}`);
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
};

export default technicianService;