import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { theme } from '../styles/theme';

const GuardianLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [guardianData, setGuardianData] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('guardian_data');
    if (data) {
      setGuardianData(JSON.parse(data));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('guardian_data');
    navigate('/login');
  };

  const getPageName = () => {
    switch (location.pathname) {
      case '/guardian/dashboard': return 'Dashboard';
      case '/guardian/fees': return 'Fees';
      case '/guardian/attendance': return 'Attendance';
      case '/guardian/results': return 'Results';
      default: return 'Morning Angels';
    }
  };

  const navItems = [
    { path: '/guardian/dashboard', label: 'Dashboard' },
    { path: '/guardian/fees', label: 'Fees' },
    { path: '/guardian/attendance', label: 'Attendance' },
    { path: '/guardian/results', label: 'Results' },
  ];

  if (!guardianData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen overflow-hidden" style={{ backgroundColor: theme.gray50 }}>
      {/* Top navbar */}
      <header
        className="flex-shrink-0 shadow-sm p-4 border-b-2"
        style={{ backgroundColor: theme.white, borderBottomColor: theme.gray100 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: theme.primary }}>
                🌟 Morning Angels
              </h1>
              <nav className="hidden md:flex space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      location.pathname === item.path
                        ? 'text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    style={{
                      backgroundColor: location.pathname === item.path ? theme.primary : 'transparent'
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm" style={{ color: theme.gray600 }}>
                Welcome, {guardianData.first_name} {guardianData.last_name}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                style={{ backgroundColor: theme.accent, color: theme.white }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <nav className="md:hidden mt-4 flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 ${
                location.pathname === item.path
                  ? 'text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{
                backgroundColor: location.pathname === item.path ? theme.primary : 'transparent'
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h2
              className="text-2xl font-semibold"
              style={{ color: theme.gray900 }}
            >
              {getPageName()}
            </h2>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default GuardianLayout;