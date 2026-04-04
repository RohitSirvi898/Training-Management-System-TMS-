import api from './api';

const resourceService = {
  // --------- LABS ---------
  getLabs: (batchId) => api.get(`/batches/${batchId}/labs`),
  addLab: (batchId, data) => api.post(`/batches/${batchId}/labs`, data),
  removeLab: (batchId, labId) => api.delete(`/batches/${batchId}/labs/${labId}`),

  // --------- TRAINERS ---------
  getTrainers: (batchId) => api.get(`/batches/${batchId}/trainers`),
  assignTrainer: (batchId, data) => api.post(`/batches/${batchId}/trainers`, data),
  removeTrainer: (batchId, trainerId) => api.delete(`/batches/${batchId}/trainers/${trainerId}`),

  // --------- STUDENTS ---------
  getStudents: (batchId) => api.get(`/batches/${batchId}/students`),
  addStudent: (batchId, data) => api.post(`/batches/${batchId}/students`, data),
  removeStudent: (batchId, studentId) => api.delete(`/batches/${batchId}/students/${studentId}`),
};

export default resourceService;
