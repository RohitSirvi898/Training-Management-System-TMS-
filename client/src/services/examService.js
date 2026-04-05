import api from './api';

const examService = {
  // --------- EXAMS ---------
  getExams: (batchId) => api.get(`/batches/${batchId}/exams`),
  createExam: (batchId, data) => api.post(`/batches/${batchId}/exams`, data),
  deleteExam: (batchId, examId) => api.delete(`/batches/${batchId}/exams/${examId}`),

  // --------- RESULTS ---------
  getResults: (batchId, examId) => api.get(`/batches/${batchId}/results`, { params: { examId } }),
  saveResults: (batchId, examId, data) => api.post(`/batches/${batchId}/results/bulk/${examId}`, data),

  // --------- CERTIFICATES ---------
  getCertificates: (batchId) => api.get(`/batches/${batchId}/certificates`),
  assignCertificate: (batchId, data) => api.post(`/batches/${batchId}/certificates`, data),
  redeemCertificate: (batchId, certId) => api.patch(`/batches/${batchId}/certificates/${certId}/redeem`),
};

export default examService;
