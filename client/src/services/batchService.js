import api from './api';

const batchService = {
  createBatch: (data) => api.post('/batches', data),

  getBatches: (status = '') => api.get(`/batches${status ? `?status=${status}` : ''}`),

  getBatchById: (id) => api.get(`/batches/${id}`),

  updateBatch: (id, data) => api.put(`/batches/${id}`, data),

  updateBatchStatus: (id, status) => api.patch(`/batches/${id}/status`, { status }),
};

export default batchService;
