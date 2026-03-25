import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { theme } from '../styles/theme';

const GuardianLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [guardianData, setGuardianData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.gray50 }}>
      {/* Top navbar */}
      <header
        className="flex-shrink-0 shadow-sm p-4 border-b-2"
        style={{ backgroundColor: theme.white, borderBottomColor: theme.gray100 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2" style={{ color: theme.primary }}>
                🌟 Morning Angels
              </h1>
              <nav className="hidden md:flex space-x-4 md:space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 md:px-4 rounded-lg font-medium transition-colors duration-200 text-sm md:text-base min-h-[40px] flex items-center ${
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
            <div className="flex items-center gap-2 md:gap-4">
              <span className="hidden sm:block text-xs md:text-sm" style={{ color: theme.gray600 }}>
                Welcome, {guardianData.first_name} {guardianData.last_name}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 md:px-4 rounded-lg font-medium transition-colors duration-200 hover:opacity-80 min-h-[40px] text-sm md:text-base"
                style={{ backgroundColor: theme.accent, color: theme.white }}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile navigation */}
          <div className="md:hidden mt-4">
            {/* Hamburger menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 min-h-[40px] text-sm font-medium"
            >
              <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
              {mobileMenuOpen ? 'Close Menu' : 'Menu'}
            </button>
            
            {/* Mobile dropdown menu */}
            {mobileMenuOpen && (
              <nav className="mt-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg font-medium transition-colors duration-200 text-sm min-h-[40px] ${
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
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="mb-4 md:mb-6">
            <h2
              className="text-xl md:text-2xl font-semibold"
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