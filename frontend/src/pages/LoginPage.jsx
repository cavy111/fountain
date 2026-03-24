import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { theme } from '../styles/theme';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/auth/token/', { username, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      if (activeTab === 'guardian') {
        // Fetch guardian data
        const guardianResponse = await api.get('/api/students/guardians/me/');
        localStorage.setItem('guardian_data', JSON.stringify(guardianResponse.data));
        navigate('/guardian/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.log(err);
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Brand */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-white"
        style={{ backgroundColor: theme.primary }}
      >
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
            🌟 Morning Angels
          </h1>
          <p className="text-xl mb-8 opacity-90">Nurturing Young Minds</p>
          <div className="text-6xl mb-8">🌈📚✨</div>
          <p className="text-lg opacity-80">
            Welcome to our vibrant learning community
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8" style={{ backgroundColor: theme.white }}>
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: theme.primary }}>
              🌟 Morning Angels
            </h1>
            <p className="text-lg" style={{ color: theme.gray600 }}>
              Nurturing Young Minds
            </p>
          </div>

          {/* Tabs */}
          <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                activeTab === 'admin' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{
                backgroundColor: activeTab === 'admin' ? theme.primary : 'transparent'
              }}
            >
              Admin
            </button>
            <button
              onClick={() => setActiveTab('guardian')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                activeTab === 'guardian' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{
                backgroundColor: activeTab === 'guardian' ? theme.primary : 'transparent'
              }}
            >
              Guardian
            </button>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2" style={{ color: theme.gray900 }}>
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors duration-200"
                style={{
                  focusRingColor: theme.primary,
                  borderColor: theme.gray100
                }}
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: theme.gray900 }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors duration-200"
                style={{
                  focusRingColor: theme.primary,
                  borderColor: theme.gray100
                }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg font-medium text-white transition-colors duration-200 hover:opacity-90"
              style={{ backgroundColor: theme.accent }}
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;