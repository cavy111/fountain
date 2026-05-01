import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { theme } from '../styles/theme';

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
      default: return 'Fountain';
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/students', label: 'Students', icon: '👨‍🎓' },
    { path: '/fees', label: 'Fees', icon: '💰' },
    { path: '/attendance', label: 'Attendance', icon: '📋' },
    { path: '/results', label: 'Results', icon: '📊' },
    { path: '/notifications', label: 'Notifications', icon: '📱' },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 w-64 flex-shrink-0 h-full overflow-y-auto transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `} style={{ backgroundColor: theme.primary }}>
        <div className="p-4 md:p-6 border-b border-white border-opacity-20">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white">
            🌟 Fountain
          </h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={closeSidebar}
                  className={`block py-3 px-4 rounded-full transition-colors duration-200 flex items-center gap-3 text-sm md:text-base ${
                    location.pathname === item.path
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                  style={{
                    backgroundColor: location.pathname === item.path ? theme.accent : 'transparent'
                  }}
                >
                  <span className="text-base md:text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <div className="flex-shrink-0 bg-white shadow-sm border-b-2" style={{ borderBottomColor: theme.gray100 }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                {/* Hamburger menu button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 min-h-[40px] min-w-[40px] flex items-center justify-center text-xl"
                >
                  ☰
                </button>
                <h2
                  className="text-base md:text-lg lg:text-xl font-semibold"
                  style={{ color: theme.gray900 }}
                >
                  {getPageName()}
                </h2>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 md:px-4 rounded-lg font-medium transition-colors duration-200 hover:opacity-80 min-h-[40px] text-sm md:text-base"
                style={{ backgroundColor: theme.accent, color: theme.white }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;