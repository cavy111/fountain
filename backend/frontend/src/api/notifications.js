import api from './axios';

export const getNotifications = async () => {
  const response = await api.get('/api/notifications/');
  return response.data;
};

export const sendFeeReminders = async () => {
  const response = await api.post('/api/notifications/send_fee_reminders/');
  return response.data;
};

export const sendAbsenceAlerts = async () => {
  const response = await api.post('/api/notifications/send_absence_alerts/');
  return response.data;
};

export const sendBulkMessage = async (message) => {
  const response = await api.post('/api/notifications/send_bulk/', { message });
  return response.data;
};