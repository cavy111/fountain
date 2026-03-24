import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const getPageName = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/students': return 'Students';
      case '/fees': return 'Fees';
      case '/attendance': return 'Attendance';
      case '/results': return 'Results';
      case '/notifications': return 'Notifications';
      default: return 'Pen Academy';
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Pen Academy</h1>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className="block py-2 px-4 rounded hover:bg-gray-700"
                onClick={closeSidebar}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/students"
                className="block py-2 px-4 rounded hover:bg-gray-700"
                onClick={closeSidebar}
              >
                Students
              </Link>
            </li>
            <li>
              <Link
                to="/fees"
                className="block py-2 px-4 rounded hover:bg-gray-700"
                onClick={closeSidebar}
              >
                Fees
              </Link>
            </li>
            <li>
              <Link
                to="/attendance"
                className="block py-2 px-4 rounded hover:bg-gray-700"
                onClick={closeSidebar}
              >
                Attendance
              </Link>
            </li>
            <li>
              <Link
                to="/results"
                className="block py-2 px-4 rounded hover:bg-gray-700"
                onClick={closeSidebar}
              >
                Results
              </Link>
            </li>
            <li>
              <Link
                to="/notifications"
                className="block py-2 px-4 rounded hover:bg-gray-700"
                onClick={closeSidebar}
              >
                Notifications
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top navbar */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden mr-4 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-lg lg:text-xl font-semibold">{getPageName()}</h2>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-2 lg:px-4 lg:py-2 rounded hover:bg-red-600 text-sm lg:text-base"
          >
            Logout
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;