import api from './axios';

export const getResults = async (params = {}) => {
  const response = await api.get('/api/results/results/', { params });
  return response.data;
};

export const createResult = async (data) => {
  const response = await api.post('/api/results/results/', data);
  return response.data;
};

export const updateResult = async (id, data) => {
  const response = await api.patch(`/api/results/results/${id}/`, data);
  return response.data;
};

export const deleteResult = async (id) => {
  await api.delete(`/api/results/results/${id}/`);
};