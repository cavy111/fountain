import api from './axios';

export const getStudents = async () => {
  const response = await api.get('/api/students/students/');
  return response.data;
};

export const createStudent = async (data) => {
  const response = await api.post('/api/students/students/', data);
  return response.data;
};

export const updateStudent = async (id, data) => {
  const response = await api.patch(`/api/students/students/${id}/`, data);
  return response.data;
};

export const deleteStudent = async (id) => {
  await api.delete(`/api/students/students/${id}/`);
};