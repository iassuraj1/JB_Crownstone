import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const COMMON_SERVERS = [
  'Pepperstone-Demo',
  'Pepperstone-Live',
  'ICMarketsSC-Demo',
  'ICMarketsSC-Live',
  'Exness-MT5Trial',
  'Exness-MT5Real',
  'MetaQuotes-Demo',
  'Custom'
];

const MT5ConnectModal = ({ onClose, onSuccess }) => {
  const { getToken } = useAuth();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [serverType, setServerType] = useState(COMMON_SERVERS[0]);
  const [customServer, setCustomServer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const finalServer = serverType === 'Custom' ? customServer : serverType;
    if (!finalServer.trim()) {
      setError('Please provide a broker server name.');
      setLoading(false);
      return;
    }

    try {
      const token = getToken();
      await axios.post('/api/credentials', {
        login,
        password,
        server: finalServer
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect MT5 Account');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-border">
          <div>
            <h3 className="text-white text-lg font-semibold">Connect MT5 Account</h3>
            <p className="text-gray-500 text-sm mt-0.5">Enter your broker credentials to stream live data.</p>
          </div>
          <button 
             type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-dark-hover transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Investor ID (Login)</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all placeholder:text-gray-600"
              placeholder="e.g. 50923053"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all placeholder:text-gray-600"
              placeholder="Your trading password"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Broker Server</label>
            <select
              value={serverType}
              onChange={(e) => setServerType(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all appearance-none"
            >
              {COMMON_SERVERS.map(s => (
                <option key={s} value={s}>{s === 'Custom' ? 'Other (Enter manually)' : s}</option>
              ))}
            </select>
          </div>

          {serverType === 'Custom' && (
            <div className="animate-fade-in">
              <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Custom Broker Server</label>
              <input
                type="text"
                value={customServer}
                onChange={(e) => setCustomServer(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all placeholder:text-gray-600"
                placeholder="e.g. ICMarketsSC-Demo"
                required={serverType === 'Custom'}
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium text-sm transition-all duration-200 shadow-gold flex justify-center items-center gap-2 ${
                loading ? 'bg-gold/50 text-black/50 cursor-not-allowed' : 'bg-gold text-black hover:brightness-110'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black/80 rounded-full animate-spin" />
                  Connecting...
                </>
              ) : 'Connect Account'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default MT5ConnectModal;
