import api from './axios';

export const getAttendance = async (params = {}) => {
  const response = await api.get('/api/attendance/attendance/', { params });
  return response.data;
};

export const createAttendance = async (data) => {
  const response = await api.post('/api/attendance/attendance/', data);
  return response.data;
};

export const deleteAttendance = async (id) => {
  await api.delete(`/api/attendance/attendance/${id}/`);
};

export const getSubjects = async () => {
  const response = await api.get('/api/attendance/subjects/');
  return response.data;
};