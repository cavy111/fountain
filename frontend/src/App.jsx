import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import GuardianRoute from './components/GuardianRoute';
import Layout from './components/Layout';
import GuardianLayout from './components/GuardianLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import FeesPage from './pages/FeesPage';
import AttendancePage from './pages/AttendancePage';
import ResultsPage from './pages/ResultsPage';
import NotificationsPage from './pages/NotificationsPage';
import GuardianDashboardPage from './pages/guardian/GuardianDashboardPage';
import GuardianFeesPage from './pages/guardian/GuardianFeesPage';
import GuardianAttendancePage from './pages/guardian/GuardianAttendancePage';
import GuardianResultsPage from './pages/guardian/GuardianResultsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <Layout>
                <StudentsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/fees"
          element={
            <ProtectedRoute>
              <Layout>
                <FeesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <Layout>
                <AttendancePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <Layout>
                <ResultsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout>
                <NotificationsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/guardian/dashboard"
          element={
            <GuardianRoute>
              <GuardianLayout>
                <GuardianDashboardPage />
              </GuardianLayout>
            </GuardianRoute>
          }
        />
        <Route
          path="/guardian/fees"
          element={
            <GuardianRoute>
              <GuardianLayout>
                <GuardianFeesPage />
              </GuardianLayout>
            </GuardianRoute>
          }
        />
        <Route
          path="/guardian/attendance"
          element={
            <GuardianRoute>
              <GuardianLayout>
                <GuardianAttendancePage />
              </GuardianLayout>
            </GuardianRoute>
          }
        />
        <Route
          path="/guardian/results"
          element={
            <GuardianRoute>
              <GuardianLayout>
                <GuardianResultsPage />
              </GuardianLayout>
            </GuardianRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
