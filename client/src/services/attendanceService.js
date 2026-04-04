import api from './api';

const attendanceService = {
  // --------- HOLIDAYS ---------
  getHolidays: (batchId) => api.get(`/batches/${batchId}/holidays`),
  addHoliday: (batchId, data) => api.post(`/batches/${batchId}/holidays`, data),
  removeHoliday: (batchId, holidayId) => api.delete(`/batches/${batchId}/holidays/${holidayId}`),

  // --------- TRAINER ATTENDANCE ---------
  getTrainerAttendance: (batchId, date) => api.get(`/batches/${batchId}/attendance/trainers`, { params: { date } }),
  saveTrainerAttendance: (batchId, data) => api.post(`/batches/${batchId}/attendance/trainers/bulk`, data),

  // --------- STUDENT ATTENDANCE ---------
  getStudentAttendance: (batchId, date) => api.get(`/batches/${batchId}/attendance/students`, { params: { date } }),
  saveStudentAttendance: (batchId, data) => api.post(`/batches/${batchId}/attendance/students/bulk`, data),
};

export default attendanceService;
