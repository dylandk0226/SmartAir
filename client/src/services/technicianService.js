import api from './api';

const technicianService = {
  async getMyProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await api.get(`/technicians/user/${user.id}`);
    return response.data;
  },

  async getMyAssignments() {
    try {
      const profile = await this.getMyProfile();
      const response = await api.get(`/booking-assignments/technician/${profile.id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  },

  async getAssignmentsByStatus(status) {
    try {
      const profile = await this.getMyProfile();
      const assignments = await this.getMyAssignments();
      return assignments.filter(a => a.status === status);
    } catch (error) {
      console.error('Error fetching assignments by status:', error);
      throw error;
    }
  },

  async updateAssignmentStatus(assignmentId, status) {
    const response = await api.put(`/booking-assignments/${assignmentId}/status`, { status });
    return response.data;
  },

  async getAssignmentById(id) {
    const response = await api.get(`/booking-assignments/${id}`);
    return response.data;
  },
};

export default technicianService;