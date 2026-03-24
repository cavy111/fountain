import api from './axios';

export const getFeePayments = async () => {
  const response = await api.get('/api/students/fee-payments/');
  return response.data;
};

export const createFeePayment = async (data) => {
  const response = await api.post('/api/students/fee-payments/', data);
  return response.data;
};

export const deleteFeePayment = async (id) => {
  await api.delete(`/api/students/fee-payments/${id}/`);
};

export const getStudents = async () => {
  const response = await api.get('/api/students/students/');
  return response.data;
};