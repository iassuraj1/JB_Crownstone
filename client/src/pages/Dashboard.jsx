import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import MT5ConnectModal from '../components/MT5ConnectModal';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="glass border border-dark-border rounded-lg px-4 py-3 shadow-card">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-gold font-semibold text-sm">
          ${value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { getToken, getUser, clearAuth } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [account, setAccount] = useState(null);
  const [history, setHistory] = useState({ 
    win_rate: 0, 
    total_profit: 0, 
    trades_closed: 0, 
    deals_history: [] 
  });
  const [positions, setPositions] = useState([]);
  const [market, setMarket] = useState([]);
  const [closingTickets, setClosingTickets] = useState([]);
  
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [closingAll, setClosingAll] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState(null);


  const user = getUser();

  const fetchData = useCallback(async () => {
    const token = getToken();
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [accRes, histRes, posRes, marketRes] = await Promise.allSettled([
        axios.get('/api/mt5/account', { headers }),
        axios.get('/api/mt5/history', { headers }),
        axios.get('/api/mt5/positions', { headers }),
        axios.post('/api/mt5/market', { symbols: ['EURUSD', 'GBPUSD', 'XAUUSD', 'BTCUSD', 'NAS100', 'GBPJPY'] }, { headers }),
      ]);

      if (accRes.status === 'rejected' && accRes.reason?.response?.data?.error === 'MT5_CREDENTIALS_MISSING') {
        setShowSetupModal(true);
        setLoading(false);
        return;
      } else {
        setShowSetupModal(false);
      }

      if (accRes.status === 'fulfilled') setAccount(accRes.value.data);
      if (histRes.status === 'fulfilled') setHistory(histRes.value.data);
      if (posRes.status === 'fulfilled') setPositions(posRes.value.data);
      if (marketRes.status === 'fulfilled') setMarket(marketRes.value.data);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [getToken]);


  useEffect(() => {
    fetchData();
    
    const pollInterval = setInterval(fetchData, 1000); // 1 second polling
    return () => clearInterval(pollInterval);
  }, [fetchData]);



  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleCloseTrade = async (ticket) => {
    if (closingTickets.includes(ticket)) return;
    setClosingTickets(prev => [...prev, ticket]);
    
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post('/api/mt5/close', { ticket }, { headers });
      
      if (res.data.status === 'success') {
        setPositions(prev => prev.filter(p => p.ticket !== ticket));
      } else {
        alert(res.data.message || 'Failed to close trade');
      }
    } catch (e) {
      console.error(e);
      alert('Error connecting to trade server');
    } finally {
      setClosingTickets(prev => prev.filter(id => id !== ticket));
    }
  };

  const handleCloseAllTrades = async () => {
    const tickets = filteredPositions.map(p => p.ticket);
    if (tickets.length === 0) return;
    if (!window.confirm(`Are you sure you want to close ALL ${tickets.length} visible trades?`)) return;

    setClosingAll(true);
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post('/api/mt5/close_all', { tickets }, { headers });

      if (res.data.status === 'success') {
        await fetchData(); // refresh everything
      } else {
        alert(res.data.message || 'Failed to close some trades');
      }
    } catch (e) {
      console.error(e);
      alert('Error closing all trades. Please try again.');
    } finally {
      setClosingAll(false);
    }
  };

  const formatMoney = (n) => {
    if (!n && n !== 0) return '$0.00';
    return `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  // Strategy symbol maps
  const strategyMaps = {
    'Titan': ['XAUUSD', 'NAS100', 'BTCUSD'],
    'Orion': ['EURUSD', 'GBPUSD'],
    'Alpha': ['EURUSD'],
    'Scraber': ['GBPJPY']
  };

  const currentStrategySymbols = selectedStrategy ? strategyMaps[selectedStrategy] : null;

  // Filter positions
  const filteredPositions = currentStrategySymbols 
    ? positions.filter(p => currentStrategySymbols.includes(p.symbol))
    : positions;

  // Filter market
  const filteredMarket = currentStrategySymbols
    ? market.filter(m => currentStrategySymbols.includes(m.symbol))
    : market;
    
  // Filter history for analytics and equity curve
  const filteredDeals = currentStrategySymbols
    ? (history.deals_history || []).filter(d => currentStrategySymbols.includes(d.symbol))
    : (history.deals_history || []);

  // Convert history timeline based on equity
  let currentEquity = account?.equity || 0;
  
  // Calculate total profit for the filtered set to determine starting point
  const filteredTotalProfit = filteredDeals.reduce((acc, deal) => acc + (deal.profit || 0), 0);
  let runningBal = currentEquity - filteredTotalProfit;
  
  // Create equity data points
  const equityData = [];
  
  // Always add a starting point at the beginning of the period
  equityData.push({
    date: 'Start',
    equity: runningBal
  });

  filteredDeals.forEach(deal => {
    runningBal += deal.profit || 0;
    const d = new Date(deal.time);
    equityData.push({
      date: `${d.getDate()}/${d.getMonth()+1}`,
      equity: runningBal
    });
  });

  // Always add the current equity as the final point
  // For strategy view, we show the current balance + current floating profit of that strategy
  const strategyFloatingProfit = filteredPositions.reduce((sum, p) => sum + (p.profit || 0), 0);
  const strategyCurrentEquity = runningBal + strategyFloatingProfit;

  if (equityData[equityData.length-1].date !== 'Current') {
    equityData.push({
      date: 'Now',
      equity: strategyCurrentEquity
    });
  }

  // Calculate advanced Analytics based on history array
  let winCount = 0;
  let lossCount = 0;
  let buyProfit = 0;
  let sellProfit = 0;
  const symbolProfits = {};

  let bestTrade = null;
  let worstTrade = null;
  let grossProfit = 0;
  let grossLoss = 0;

  filteredDeals.forEach(deal => {
    const profit = deal.profit || 0;
    if (profit > 0) {
      winCount++;
      grossProfit += profit;
    }
    else if (profit < 0) {
      lossCount++;
      grossLoss += Math.abs(profit);
    }
    
    if (!bestTrade || profit > bestTrade) bestTrade = profit;
    if (!worstTrade || profit < worstTrade) worstTrade = profit;

    const type = deal.type || '';
    if (type.includes('BUY')) buyProfit += profit;
    else if (type.includes('SELL')) sellProfit += profit;

    const sym = deal.symbol || 'Balance';
    if (sym !== 'Balance') {
      if (!symbolProfits[sym]) symbolProfits[sym] = 0;
      symbolProfits[sym] += deal.profit;
    }
  });

  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? 'Max' : '0.00');

  const sortedSymbols = Object.entries(symbolProfits)
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value);

  // Win Rate pie data
  const pieData = [
    { name: 'Wins', value: winCount, fill: '#10B981' },
    { name: 'Losses', value: lossCount, fill: '#EF4444' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200 font-sans flex flex-col md:flex-row">
      
      {/* ─── LEFT SIDEBAR ───────────────────────────────────────────── */}
      <aside className="w-full md:w-64 bg-[#111111] border-r border-[#1E1E1E] flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-[#1E1E1E]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gold-gradient flex items-center justify-center shadow-gold">
              <span className="text-black font-bold text-sm">JB</span>
            </div>
            <span className="font-semibold text-base text-white tracking-wide">
              Crownstone
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-1 px-3">
            {['Dashboard', 'Open Trades', 'Trade History', 'Analytics', 'Settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'Dashboard') setSelectedStrategy(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                  activeTab === tab 
                    ? 'bg-gold/10 text-gold font-medium' 
                    : 'text-gray-400 hover:bg-[#1A1A1A] hover:text-white'
                }`}
              >
                {tab === 'Dashboard' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
                {tab === 'Open Trades' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                {tab === 'Trade History' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                {tab === 'Analytics' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                {tab === 'Settings' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* ─── TOP NAVBAR ─── */}
        <header className="h-16 bg-[#111111]/80 backdrop-blur border-b border-[#1E1E1E] flex items-center justify-between px-6 z-10">
          <div className="text-xl font-medium tracking-tight text-white">{activeTab}</div>
          
          
        </header>

        {/* ─── SCROLLABLE DASHBOARD ─── */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'Dashboard' ? (
            <>
              {/* Account Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: "Balance", value: formatMoney(account?.balance), color: "text-white" },
                  { label: "Equity", value: formatMoney(account?.equity), color: "text-gold" },
                  { label: "Profit", value: `${(account?.profit || 0) >= 0 ? '+' : ''}${formatMoney(account?.profit)}`, color: (account?.profit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400' },
                  { label: "Margin", value: formatMoney(account?.margin), color: "text-blue-400" },
                  { label: "Free Margin", value: formatMoney(account?.margin_free), color: "text-purple-400" },
                ].map(card => (
                  <div key={card.label} className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-5 hover:border-gold/30 transition-all shadow-sm">
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-2">{card.label}</p>
                    <p className={`text-xl font-bold tracking-tight ${card.color}`}>{card.value}</p>
                  </div>
                ))}
              </div>

              {/* Strategy Switcher Tabs */}
              <div className="flex flex-wrap gap-3">
                {['Titan', 'Orion', 'Alpha', 'Scraber'].map((strat) => (
                  <button
                    key={strat}
                    onClick={() => setSelectedStrategy(selectedStrategy === strat ? null : strat)}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
                      selectedStrategy === strat
                        ? 'bg-gold text-black border-gold shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                        : 'bg-[#111111] text-gray-500 border-[#1E1E1E] hover:border-gray-700 hover:text-gray-300'
                    }`}
                  >
                    {strat}
                  </button>
                ))}
                {selectedStrategy && (
                  <button 
                    onClick={() => setSelectedStrategy(null)}
                    className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {/* Middle Row (Chart & Analytics) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Equity Curve */}
                <div className="lg:col-span-2 bg-[#111111] border border-[#1E1E1E] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Equity Curve</h3>
                  </div>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={equityData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorEq" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 10 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: '#666', fontSize: 10 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} width={60} tickFormatter={v => `$${v}`} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#333', strokeWidth: 1 }} />
                        <Area type="monotone" dataKey="equity" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorEq)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Trading Analytics */}
                <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-6 flex flex-col justify-between">
                  <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-6">Trading Analytics</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-400">Win Rate</span>
                        <span className="text-blue-400 font-semibold">{((winCount / (winCount + lossCount || 1)) * 100).toFixed(2)}%</span>
                      </div>
                      <div className="w-full bg-[#1A1A1A] rounded-full h-1.5">
                        <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${(winCount / (winCount + lossCount || 1)) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-400">Total Profit</span>
                        <span className="text-emerald-400 font-semibold">+{formatMoney(grossProfit - grossLoss)}</span>
                      </div>
                      <div className="w-full bg-[#1A1A1A] rounded-full h-1.5">
                        <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-400">Trades Closed</span>
                        <span className="text-white font-semibold">{winCount + lossCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row (Open Trades & Market Watch) */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Open Trades Table */}
                <div className="lg:col-span-3 bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
                  <div className="p-5 border-b border-[#1E1E1E] flex items-center justify-between gap-4">
                    <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Open Trades ({filteredPositions.length})</h3>
                    {filteredPositions.length > 0 && (
                      <button
                        onClick={handleCloseAllTrades}
                        disabled={closingAll}
                        className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all border border-red-500/20 ${closingAll ? 'bg-red-500/20 text-red-200 cursor-not-allowed' : 'bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white'}`}
                      >
                        {closingAll ? (
                          <span className="flex items-center gap-2 justify-center">
                            <span className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin" />
                            Closing All...
                          </span>
                        ) : 'Close All Trades'}
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#161616] text-[#888] text-xs uppercase font-medium">
                        <tr>
                          <th className="px-5 py-3">Symbol</th>
                          <th className="px-5 py-3">Type</th>
                          <th className="px-5 py-3">Volume</th>
                          <th className="px-5 py-3 text-right">Profit</th>
                          <th className="px-5 py-3 text-center">Close</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1A1A1A]">
                        {filteredPositions.map(pos => (
                          <tr key={pos.ticket} className="hover:bg-[#161616] transition-colors">
                            <td className="px-5 py-3 text-white font-medium">{pos.symbol}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${pos.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {pos.type}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-gray-400">{pos.volume}</td>
                            <td className={`px-5 py-3 text-right font-semibold ${pos.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {pos.profit >= 0 ? '+' : ''}{pos.profit?.toFixed(2)}
                            </td>
                            <td className="px-5 py-3 text-center">
                              <button 
                                onClick={() => handleCloseTrade(pos.ticket)}
                                disabled={closingTickets.includes(pos.ticket)}
                                className={`w-6 h-6 rounded flex items-center justify-center transition-colors mx-auto ${closingTickets.includes(pos.ticket) ? 'text-gray-600' : 'text-red-500 hover:bg-red-500/10'}`}
                              >
                                {closingTickets.includes(pos.ticket) ? (
                                  <div className="w-3 h-3 border border-t-transparent border-gray-400 rounded-full animate-spin" />
                                ) : '✕'}
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredPositions.length === 0 && (
                          <tr>
                            <td colSpan="6" className="px-5 py-8 text-center text-gray-500">No open trades right now</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent History Table (New) */}
                <div className="lg:col-span-3 bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
                  <div className="p-5 border-b border-[#1E1E1E] flex justify-between items-center">
                    <h3 className="text-white text-sm font-semibold uppercase tracking-wider">
                      {selectedStrategy ? `${selectedStrategy} History` : 'Recent History'}
                    </h3>
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Last 10 trades</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#161616] text-[#888] text-xs uppercase font-medium">
                        <tr>
                          <th className="px-5 py-3">Symbol</th>
                          <th className="px-5 py-3">Type</th>
                          <th className="px-5 py-3">Time</th>
                          <th className="px-5 py-3 text-right">Profit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1A1A1A]">
                        {filteredDeals.slice().reverse().slice(0, 10).map((deal, idx) => (
                          <tr key={deal.ticket || idx} className="hover:bg-[#161616] transition-colors">
                            <td className="px-5 py-3 text-white font-medium">{deal.symbol || 'Balance'}</td>
                            <td className="px-5 py-3">
                              {deal.type ? (
                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${deal.type.includes('BUY') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                  {deal.type}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="px-5 py-3 text-gray-500 text-xs">
                              {new Date(deal.time).toLocaleDateString()} {new Date(deal.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className={`px-5 py-3 text-right font-semibold ${deal.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {deal.profit >= 0 ? '+' : ''}{deal.profit?.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        {filteredDeals.length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-5 py-8 text-center text-gray-500">No history found for this strategy</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Market Watch (Existing - wrapped into a vertical column with history if needed, but for now I'll keep it as is) */}
                <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden h-fit">
                  <div className="p-5 border-b border-[#1E1E1E]">
                    <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Market Watch</h3>
                  </div>
                  <div className="divide-y divide-[#1A1A1A]">
                    {filteredMarket.map(tick => (
                      <div key={tick.symbol} className="p-4 hover:bg-[#161616] transition-colors flex justify-between items-center text-sm">
                        <span className="font-semibold text-white">{tick.symbol}</span>
                        <div className="text-right">
                          <div className="text-emerald-400 font-medium">{tick.bid?.toFixed(5)}</div>
                          <div className="text-red-400 text-xs">{tick.ask?.toFixed(5)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </>
          ) : activeTab === 'Open Trades' ? (
            <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
              <div className="p-5 border-b border-[#1E1E1E] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h2 className="text-white text-lg font-semibold tracking-tight">Active Positions</h2>
                  <div className="bg-[#1A1A1A] px-3 py-1.5 rounded-lg text-sm text-gray-400">
                    Total: {positions.length}
                  </div>
                </div>
                {positions.length > 0 && (
                  <button 
                    onClick={handleCloseAllTrades}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all"
                  >
                    Close All Positions
                  </button>
                )}
              </div>
              <div className="overflow-x-auto min-h-[500px]">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#161616] text-[#888] text-xs uppercase font-medium">
                    <tr>
                      <th className="px-6 py-4">Ticket</th>
                      <th className="px-6 py-4">Symbol</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Volume</th>
                      <th className="px-6 py-4">Open Time</th>
                      <th className="px-6 py-4">Open Price</th>
                      <th className="px-6 py-4">S / L</th>
                      <th className="px-6 py-4">T / P</th>
                      <th className="px-6 py-4">Current Price</th>
                      <th className="px-6 py-4 text-right">Profit</th>
                      <th className="px-6 py-4 text-center">Close</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A]">
                    {positions.map(pos => (
                      <tr key={pos.ticket} className="hover:bg-[#161616] transition-colors">
                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{pos.ticket}</td>
                        <td className="px-6 py-4 text-white font-medium">{pos.symbol}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${pos.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {pos.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">{pos.volume}</td>
                        <td className="px-6 py-4 text-gray-400 text-xs">{new Date(pos.time * 1000).toLocaleString()}</td>
                        <td className="px-6 py-4 text-gray-400">{pos.price_open?.toFixed(5)}</td>
                        <td className="px-6 py-4 text-gray-500">{pos.sl > 0 ? pos.sl?.toFixed(5) : '-'}</td>
                        <td className="px-6 py-4 text-gray-500">{pos.tp > 0 ? pos.tp?.toFixed(5) : '-'}</td>
                        <td className="px-6 py-4 text-white">{pos.price_current?.toFixed(5)}</td>
                        <td className={`px-6 py-4 text-right font-semibold ${pos.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pos.profit >= 0 ? '+' : ''}{pos.profit?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleCloseTrade(pos.ticket)}
                            disabled={closingTickets.includes(pos.ticket)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${closingTickets.includes(pos.ticket) ? 'bg-gray-800 text-gray-600' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'}`}
                          >
                             {closingTickets.includes(pos.ticket) ? (
                               <div className="w-4 h-4 border-2 border-t-transparent border-gray-400 rounded-full animate-spin" />
                             ) : '✕'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {positions.length === 0 && (
                      <tr>
                        <td colSpan="10" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <svg className="w-12 h-12 mb-3 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-gray-500">No active trades right now</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'Trade History' ? (
            <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
              <div className="p-5 border-b border-[#1E1E1E] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-white text-lg font-semibold tracking-tight">Trade History</h2>
                  <p className="text-gray-500 text-xs mt-1">Last 30 days of closed deals</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-[#1A1A1A] px-3 py-1.5 rounded-lg text-sm flex gap-2 items-center">
                    <span className="text-gray-400">Total Deals:</span>
                    <span className="text-white font-semibold">{history.deals_history?.length || 0}</span>
                  </div>
                  <div className="bg-[#1A1A1A] px-3 py-1.5 rounded-lg text-sm flex gap-2 items-center">
                    <span className="text-gray-400">Total Profit:</span>
                    <span className={`font-semibold ${history.total_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {history.total_profit >= 0 ? '+' : ''}{formatMoney(history.total_profit)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto min-h-[500px]">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#161616] text-[#888] text-xs uppercase font-medium">
                    <tr>
                      <th className="px-6 py-4">Ticket</th>
                      <th className="px-6 py-4">Symbol</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Volume</th>
                      <th className="px-6 py-4">Close Time</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Commission</th>
                      <th className="px-6 py-4">Swap</th>
                      <th className="px-6 py-4 text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A]">
                    {history.deals_history && [...history.deals_history].reverse().map(deal => (
                      <tr key={deal.ticket || Math.random().toString()} className="hover:bg-[#161616] transition-colors">
                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{deal.ticket || '-'}</td>
                        <td className="px-6 py-4 text-white font-medium">{deal.symbol || 'Balance'}</td>
                        <td className="px-6 py-4">
                          {deal.type ? (
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${deal.type.includes('BUY') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                              {deal.type}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-400">{deal.volume || '-'}</td>
                        <td className="px-6 py-4 text-gray-400 text-xs">{new Date(deal.time).toLocaleString()}</td>
                        <td className="px-6 py-4 text-gray-400">{deal.price ? deal.price.toFixed(5) : '-'}</td>
                        <td className="px-6 py-4 text-gray-500">{deal.commission ? deal.commission.toFixed(2) : '0.00'}</td>
                        <td className="px-6 py-4 text-gray-500">{deal.swap ? deal.swap.toFixed(2) : '0.00'}</td>
                        <td className={`px-6 py-4 text-right font-semibold ${deal.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {deal.profit >= 0 ? '+' : ''}{deal.profit?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {(!history.deals_history || history.deals_history.length === 0) && (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center text-gray-500 flex flex-col items-center">
                          <svg className="w-12 h-12 mb-3 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          No trade history in the past 30 days
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'Analytics' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Win / Loss Pie Chart */}
                <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-6 flex flex-col items-center">
                  <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-2 self-start">Win / Loss Ratio</h3>
                  <div className="w-full h-48 flex justify-center mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(0,0,0,0)" />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} cursor={{stroke: 'transparent'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex gap-6 mt-4 w-full justify-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-gray-300">Wins ({winCount})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-gray-300">Losses ({lossCount})</span>
                    </div>
                  </div>
                </div>

                {/* Longs vs Shorts */}
                <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-6">
                  <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-6">Longs vs Shorts Profit</h3>
                  <div className="flex flex-col gap-6 justify-center h-[200px]">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Longs (BUY)</span>
                        <span className={`font-semibold ${buyProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {buyProfit >=0 ? '+' : ''}{formatMoney(buyProfit)}
                        </span>
                      </div>
                      <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.abs(buyProfit) / (Math.abs(buyProfit) + Math.abs(sellProfit) || 1) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Shorts (SELL)</span>
                        <span className={`font-semibold ${sellProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {sellProfit >=0 ? '+' : ''}{formatMoney(sellProfit)}
                        </span>
                      </div>
                      <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${Math.abs(sellProfit) / (Math.abs(buyProfit) + Math.abs(sellProfit) || 1) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-6">
                  <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-6">Key Statistics</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center pb-3 border-b border-[#1E1E1E]">
                      <span className="text-gray-400 text-sm">Profit Factor</span>
                      <span className="text-white font-medium">{profitFactor}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-[#1E1E1E]">
                      <span className="text-gray-400 text-sm">Best Trade</span>
                      <span className="text-emerald-400 font-medium">{bestTrade ? `+$${bestTrade.toFixed(2)}` : '-'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-[#1E1E1E]">
                      <span className="text-gray-400 text-sm">Worst Trade</span>
                      <span className="text-red-400 font-medium">{worstTrade ? `-$${Math.abs(worstTrade).toFixed(2)}` : '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Total Deals</span>
                      <span className="text-white font-medium">{history.deals_history?.length || 0}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Profit By Symbol Bar Chart */}
              <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-6">
                 <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-6">Profit By Symbol</h3>
                 <div className="w-full h-72">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={sortedSymbols} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                       <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                       <YAxis tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                       <Tooltip content={<CustomTooltip />} cursor={{fill: '#1A1A1A'}} />
                       <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                         {sortedSymbols.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10B981' : '#EF4444'} />
                         ))}
                       </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
              </div>

            </div>
          ) : activeTab === 'Settings' ? (
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Profile & Connection */}
              <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
                <div className="p-6 border-b border-[#1E1E1E]">
                  <h3 className="text-white text-lg font-semibold tracking-tight">Account Settings</h3>
                  <p className="text-gray-500 text-sm mt-1">Manage your terminal connection and user profile.</p>
                </div>
                <div className="p-6 space-y-6">
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="text-white font-medium mb-1">MT5 Broker Connection</h4>
                      <p className="text-gray-500 text-sm">Currently tracking account: <span className="font-mono text-gray-400 bg-[#1A1A1A] px-2 py-0.5 rounded">{account?.login || 'Disconnected'}</span></p>
                      <p className="text-gray-500 text-sm">Server: <span className="text-emerald-500">{account?.server || 'N/A'}</span></p>
                    </div>
                    <button 
                      onClick={() => setShowSetupModal(true)}
                      className="px-4 py-2 bg-[#1A1A1A] hover:bg-gold/10 border border-[#333] hover:border-gold/30 text-gray-300 hover:text-gold rounded-lg text-sm transition-all focus:outline-none"
                    >
                      Update Connection
                    </button>
                  </div>

                  <div className="border-t border-[#1E1E1E] pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <div>
                      <h4 className="text-white font-medium mb-1">Profile Name</h4>
                      <p className="text-gray-500 text-sm">Update your public display name</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <input 
                        type="text" 
                        defaultValue={user?.name || ''}
                        disabled
                        className="bg-[#161616] border border-[#222] rounded-lg px-4 py-2 text-gray-500 text-sm w-full md:w-64 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
                <div className="p-6 border-b border-[#1E1E1E]">
                  <h3 className="text-white text-lg font-semibold tracking-tight">Preferences</h3>
                  <p className="text-gray-500 text-sm mt-1">Customize your dashboard experience.</p>
                </div>
                <div className="p-6 space-y-6">
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-white font-medium mb-1">Theme</h4>
                      <p className="text-gray-500 text-sm">Select your interface color scheme.</p>
                    </div>
                    <select disabled className="bg-[#161616] border border-[#222] rounded-lg px-4 py-2 text-gray-500 text-sm cursor-not-allowed">
                      <option>Dark Mode (Default)</option>
                      <option>Light Mode</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center border-t border-[#1E1E1E] pt-6">
                    <div>
                      <h4 className="text-white font-medium mb-1">Data Polling Interval</h4>
                      <p className="text-gray-500 text-sm">How often to refresh live MT5 data.</p>
                    </div>
                    <select disabled className="bg-[#161616] border border-[#222] rounded-lg px-4 py-2 text-gray-500 text-sm cursor-not-allowed">
                      <option>Real-time (3 seconds)</option>
                      <option>Standard (10 seconds)</option>
                      <option>Relaxed (30 seconds)</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-[#111111] border border-red-500/20 rounded-xl overflow-hidden mt-8">
                <div className="p-6">
                  <h3 className="text-red-500 text-lg font-semibold tracking-tight">Danger Zone</h3>
                  <p className="text-red-500/60 text-sm mt-1 mb-4">Irreversible actions regarding your account.</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Clear Trading History</span>
                    <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm transition-all focus:outline-none">
                      Wipe Data
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-[#1E1E1E] rounded-xl">
              <p className="text-gray-500">The {activeTab} view is currently under construction.</p>
            </div>
          )}
        </main>
      </div>

      {showSetupModal && (
        <MT5ConnectModal 
          onClose={() => setShowSetupModal(false)} 
          onSuccess={() => {
            setShowSetupModal(false);
            fetchData();
          }} 
        />
      )}
    </div>
  );
};

export default Dashboard;
