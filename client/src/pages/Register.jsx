import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setError('Please enter name, email, and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post('/auth/register', form);
      setAuth(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gold/3 rounded-full blur-3xl pointer-events-none" />

      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-gold transition-colors text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to site
      </Link>

      <div className="w-full max-w-md animate-slide-up">
        <div className="card border-gold/10 shadow-gold-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gold-gradient" />

          <div className="flex justify-center mb-8 mt-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold-gradient flex items-center justify-center shadow-gold">
                <span className="text-black font-bold text-base">JB</span>
              </div>
              <div>
                <span className="font-display text-xl font-semibold">
                  <span className="text-white">JB </span>
                  <span className="text-gold">Crownstone</span>
                </span>
                <p className="text-gray-600 text-xs tracking-wider">PRIVATE CLIENT PORTAL</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-white text-2xl font-semibold mb-2">Create account</h1>
            <p className="text-gray-500 text-sm">Register to access your private dashboard</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="register-name" className="block text-gray-400 text-xs mb-2 uppercase tracking-wider">
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="James Bradford"
                className="input-dark"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="block text-gray-400 text-xs mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="register-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@jbcrownstone.com"
                className="input-dark"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="block text-gray-400 text-xs mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-dark"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full btn-gold flex items-center justify-center gap-2 py-3.5 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="text-center text-gray-600 text-xs mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-gold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-gray-700 text-xs mt-6">
          Protected by enterprise-grade encryption. Your data is safe.
        </p>
      </div>
    </div>
  );
};

export default Register;
