import React, { useState, useEffect } from 'react';
import { getNotifications, sendFeeReminders, sendAbsenceAlerts, sendBulkMessage } from '../api/notifications';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFeeReminders = async () => {
    if (!confirm('Are you sure you want to send fee reminders to all students with outstanding fees?')) {
      return;
    }

    setActionLoading(true);
    try {
      const result = await sendFeeReminders();
      alert(result.message);
      loadNotifications();
    } catch (error) {
      console.error('Error sending fee reminders:', error);
      alert('Failed to send fee reminders. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendAbsenceAlerts = async () => {
    if (!confirm('Are you sure you want to send absence alerts to guardians of absent students?')) {
      return;
    }

    setActionLoading(true);
    try {
      const result = await sendAbsenceAlerts();
      alert(result.message);
      loadNotifications();
    } catch (error) {
      console.error('Error sending absence alerts:', error);
      alert('Failed to send absence alerts. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendBulkMessage = async () => {
    if (!bulkMessage.trim()) {
      alert('Please enter a message to send.');
      return;
    }

    if (!confirm('Are you sure you want to send this message to all guardians?')) {
      return;
    }

    setActionLoading(true);
    try {
      const result = await sendBulkMessage(bulkMessage);
      alert(result.message);
      setShowBulkModal(false);
      setBulkMessage('');
      loadNotifications();
    } catch (error) {
      console.error('Error sending bulk message:', error);
      alert('Failed to send bulk message. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || notification.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeLabel = (type) => {
    const labels = {
      fee_reminder: 'Fee Reminder',
      absence_alert: 'Absence Alert',
      announcement: 'Announcement'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status) => {
    return status === 'sent' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Notifications</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={handleSendFeeReminders}
            disabled={actionLoading}
            className="px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm lg:text-base"
          >
            {actionLoading ? 'Sending...' : 'Send Fee Reminders'}
          </button>
          <button
            onClick={handleSendAbsenceAlerts}
            disabled={actionLoading}
            className="px-3 lg:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm lg:text-base"
          >
            {actionLoading ? 'Sending...' : 'Send Absence Alerts'}
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            disabled={actionLoading}
            className="px-3 lg:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm lg:text-base"
          >
            Send Bulk Message
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search notifications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Types</option>
          <option value="fee_reminder">Fee Reminders</option>
          <option value="absence_alert">Absence Alerts</option>
          <option value="announcement">Announcements</option>
        </select>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading notifications...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredNotifications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No notifications found
                    </td>
                  </tr>
                ) : (
                  filteredNotifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {notification.student?.first_name} {notification.student?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {notification.student?.guardian_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getTypeLabel(notification.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {notification.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {notification.phone_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          notification.status === 'sent'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {notification.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {notification.sent_at ? new Date(notification.sent_at).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk Message Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-lg">
            <h2 className="text-lg lg:text-xl font-bold mb-4">Send Bulk Message</h2>
            <textarea
              value={bulkMessage}
              onChange={(e) => setBulkMessage(e.target.value)}
              placeholder="Enter your message here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm lg:text-base"
              rows="4"
            />
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSendBulkMessage}
                disabled={actionLoading || !bulkMessage.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 order-1 sm:order-2"
              >
                {actionLoading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;