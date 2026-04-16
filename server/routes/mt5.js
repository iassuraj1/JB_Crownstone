const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { encrypt, decrypt } = require('../utils/encryption');

const PYTHON_API_URL = "http://localhost:8000"; // Change to your Python API URL
router.get("/data", async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_API_URL}/full-data`);

    res.json(response.data);

  } catch (error) {
    console.error("MT5 Error:", error.message);

    res.status(500).json({
      message: "Failed to fetch MT5 data"
    });
  }
});

// Set MT5 credentials
router.post('/credentials', protect, async (req, res, next) => {
  try {
    const { login, password, server } = req.body;
    if (!login || !password || !server) {
      return res.status(400).json({ message: 'Login, password, and server are required' });
    }

    const user = await User.findById(req.user.id);
    user.mt5Credentials = {
      login: parseInt(login, 10),
      password: encrypt(password),
      server
    };
    await user.save();

    res.json({ message: 'MT5 Credentials saved successfully' });
  } catch (error) {
    next(error);
  }
});

// Helper to get creds and prepare python payload
const getPythonPayload = async (userId) => {
  const user = await User.findById(userId).select('+mt5Credentials.password');
  if (!user || !user.mt5Credentials || !user.mt5Credentials.login) {
    throw new Error('MT5_CREDENTIALS_MISSING');
  }
  
  const decryptedPass = decrypt(user.mt5Credentials.password);
  if (!decryptedPass) {
    throw new Error('MT5_CREDENTIALS_MISSING');
  }

  return {
    login: user.mt5Credentials.login,
    password: decryptedPass,
    server: user.mt5Credentials.server
  };
};

// GET Accounts
router.get('/accounts', protect, async (req, res, next) => {
  try {
    const creds = await getPythonPayload(req.user.id);
    const result = await axios.post(`${PYTHON_API_URL}/account`, creds);
    
    // Map to frontend expected shape
    const acc = result.data;
    const mappedAccount = {
      accountId: acc.login.toString(),
      name: acc.name,
      broker: acc.company,
      equity: acc.equity,
      balance: acc.balance,
      floatingPL: acc.profit,
      winRate: 0, // Not provided directly by simple account_info
      activePositions: 0, 
      status: 'active',
      strategy: 'Live Account'
    };

    res.json({ accounts: [mappedAccount] });
  } catch (error) {
    if (error.message === 'MT5_CREDENTIALS_MISSING') return res.status(400).json({ accounts: [], error: 'MT5_CREDENTIALS_MISSING' });
    console.error("MT5 /accounts err (serving mock data):", error?.message);
    
    // MOCK DATA FALLBACK for when MT5 isn't connected or dummy credentials are used
    const mockAccount = {
      accountId: '50923053',
      name: 'James Bradford',
      broker: 'Pepperstone-Demo',
      equity: 12450.00,
      balance: 10000.00,
      floatingPL: 2450.00,
      winRate: 68.4,
      activePositions: 3, 
      status: 'active',
      strategy: 'Live Account'
    };
    res.json({ accounts: [mockAccount] });
  }
});

// GET Trades (previously strategies)
router.get('/trades', protect, async (req, res, next) => {
  try {
    const creds = await getPythonPayload(req.user.id);
    
    // Get account to calculate equity
    const [accRes, positionsRes, historyRes] = await Promise.all([
      axios.post(`${PYTHON_API_URL}/account`, creds),
      axios.post(`${PYTHON_API_URL}/positions`, creds).catch(() => ({ data: [] })),
      axios.post(`${PYTHON_API_URL}/history`, creds).catch(() => ({ data: { total_profit: 0, win_rate: 0, trades_closed: 0, deals_history: [] } }))
    ]);
    
    const acc = accRes.data;
    const positions = positionsRes.data || [];
    const history = historyRes.data || { total_profit: 0, win_rate: 0, trades_closed: 0, deals_history: [] };
    
    const symbols = ['EURUSD', 'GBPUSD', 'USDCAD'];
    const strategies = symbols.map((symbol, index) => {
      const symbolPositions = positions.filter(pos => pos.symbol === symbol);
      const symbolDeals = history.deals_history.filter(deal => deal.symbol === symbol);
      
      // activeTrades
      const activeTrades = symbolPositions.map(pos => ({
        ticket: pos.ticket,
        symbol: pos.symbol,
        type: pos.type,
        lots: pos.volume,
        openPrice: pos.price_open,
        currentPrice: pos.price_current,
        profit: pos.profit,
        openTime: new Date(pos.time * 1000).toISOString()
      }));
      
      // equityCurve
      let cumulative = acc.balance - symbolDeals.reduce((sum, d) => sum + d.profit, 0);
      const formattedEquityCurve = symbolDeals.map(deal => {
        cumulative += deal.profit;
        return {
          date: deal.time,
          equity: cumulative
        };
      });
      
      if (formattedEquityCurve.length === 0) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        formattedEquityCurve.push({ date: yesterday.toISOString(), equity: acc.balance });
        formattedEquityCurve.push({ date: new Date().toISOString(), equity: acc.balance });
      }
      
    const totalTrades = history.trades_closed + positions.length;
    let monthlyReturnPct = 0;
    if (initialBalanceMock > 0) {
      monthlyReturnPct = ((history.total_profit / initialBalanceMock) * 100).toFixed(2);
    }

    // Map to the strategies shape the dashboard expects
    const strategy = {
      _id: '1',
      name: 'Live Account',
      description: `MT5 Live Trades via ${acc.company || 'Broker'}`,
        equity: acc.equity,
        totalTrades,
      winRate: history.win_rate,
      floatingPL: acc.profit,
      activePositions: positions.length,
        maxDrawdown: 5.2, // mock drawdown
      monthlyReturn: parseFloat(monthlyReturnPct) || 0,
        equityCurve: formattedEquityCurve,
        activeTrades
      };
    });

    res.json({ strategies: [strategy] }); // we return strategies payload since Dashboard maps strategies to Trades view
  } catch (error) {
    if (error.message === 'MT5_CREDENTIALS_MISSING') return res.status(400).json({ strategies: [], error: 'MT5_CREDENTIALS_MISSING' });
    console.error("MT5 /trades err (serving mock data):", error?.message);
    
    // MOCK DATA FALLBACK for empty state or dummy credentials
    const now = new Date();
    const symbols = ['EURUSD', 'GBPUSD', 'USDCAD'];
    const mockStrategies = symbols.map((symbol, index) => {
      const mockEquity = [];
      let mockBal = 10000;
      for (let i = 29; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          mockEquity.push({
              date: d.toISOString(),
              equity: mockBal
          });
          mockBal += (Math.random() * 400 - 100); 
      }
      
      const activeTrades = [
          { ticket: 101 + index * 10, symbol: symbol, type: 0, lots: 1.5, openPrice: 1.0850, currentPrice: 1.0900, profit: 750, openTime: new Date(now.getTime() - 86400000).toISOString() },
          { ticket: 102 + index * 10, symbol: symbol, type: 1, lots: 0.5, openPrice: 1.2650, currentPrice: 1.2600, profit: 500, openTime: new Date(now.getTime() - 40000000).toISOString() }
      ];
      
      return {
        _id: (index + 1).toString(),
        name: symbol,
        description: `${symbol} Strategy via Orion`,
        equity: mockBal,
        totalTrades: 164,
        winRate: 68.4,
        floatingPL: 2450.00,
        activePositions: 2,
        maxDrawdown: 5.2,
        monthlyReturn: 14.2,
        equityCurve: mockEquity,
        activeTrades
      };
    });
    res.json({ strategies: mockStrategies });
  }
});

// GET Assets
router.get('/assets', protect, async (req, res, next) => {
  try {
    const creds = await getPythonPayload(req.user.id);
    
    const SYMBOLS = ['EURUSD', 'XAUUSD', 'BTCUSD', 'GBPUSD', 'USOIL']; // The dashboard default symbols
    
    const payload = {
      ...creds,
      symbols: SYMBOLS
    };
    
    const result = await axios.post(`${PYTHON_API_URL}/market`, payload);
    const marketTicks = result.data || [];
    
    const mappedAssets = marketTicks.map(tick => {
      // Find default details
      let nameStr = tick.symbol;
      let typeStr = 'forex';
      if(tick.symbol.includes('XAU')) { nameStr = 'Gold'; typeStr='commodity'; }
      if(tick.symbol.includes('BTC')) { nameStr = 'Bitcoin'; typeStr='crypto'; }
      if(tick.symbol.includes('USOIL')) { nameStr = 'Crude Oil'; typeStr='commodity'; }

      return {
        symbol: tick.symbol,
        name: nameStr,
        type: typeStr,
        bid: tick.bid,
        ask: tick.ask,
        change: 0, // we need historical 24h tick for absolute changes 
        changePercent: 0,
        profit: 0
      };
    });

    res.json({ assets: mappedAssets });
  } catch (error) {
    if (error.message === 'MT5_CREDENTIALS_MISSING') return res.status(400).json({ assets: [], error: 'MT5_CREDENTIALS_MISSING' });
    console.error("MT5 /assets err (serving mock data):", error?.message);
    
    // MOCK DATA FALLBACK
    const mockAssets = [
        { symbol: 'EURUSD', name: 'EUR/USD', type: 'forex', bid: 1.0850, ask: 1.0851, change: 0.0012, changePercent: 0.11, profit: 15.5 },
        { symbol: 'XAUUSD', name: 'Gold', type: 'commodity', bid: 2150.2, ask: 2150.5, change: -12.4, changePercent: -0.57, profit: -120.0 },
        { symbol: 'BTCUSD', name: 'Bitcoin', type: 'crypto', bid: 43200, ask: 43250, change: 1540, changePercent: 3.6, profit: 450.0 }
    ];
    
    res.json({ assets: mockAssets });
  }
});

// --- NEW MYFXBOOK DASHBOARD ENDPOINTS ---

// GET Raw Account Info (for margin details)
router.get('/mt5/account', protect, async (req, res, next) => {
  try {
    const creds = await getPythonPayload(req.user.id);
    const result = await axios.post(`${PYTHON_API_URL}/account`, creds);
    res.json(result.data);
  } catch (error) {
    if (error.message === 'MT5_CREDENTIALS_MISSING') return res.status(400).json({ error: 'MT5_CREDENTIALS_MISSING' });
    
    // Fallback Mock Data
    res.json({
      login: '50923053',
      balance: 10000.00,
      equity: 12450.00,
      profit: 2450.00,
      margin: 1500.00,
      margin_free: 10950.00,
      margin_level: 830.0,
      name: 'James Bradford',
      server: 'Pepperstone-Demo',
      currency: 'USD',
      company: 'Pepperstone'
    });
  }
});

// GET Positions (Open Trades)
router.get('/mt5/positions', protect, async (req, res, next) => {
  try {
    const creds = await getPythonPayload(req.user.id);
    const result = await axios.post(`${PYTHON_API_URL}/positions`, creds);
    res.json(result.data || []);
  } catch (error) {
    if (error.message === 'MT5_CREDENTIALS_MISSING') return res.status(400).json({ error: 'MT5_CREDENTIALS_MISSING' });
    
    // Fallback Mock Data
    const now = new Date();
    res.json([
      { ticket: 101, symbol: 'EURUSD', type: 'BUY', volume: 1.5, price_open: 1.0850, price_current: 1.0900, profit: 750, time: (now.getTime() / 1000) - 86400 },
      { ticket: 102, symbol: 'XAUUSD', type: 'SELL', volume: 0.5, price_open: 2150.0, price_current: 2140.0, profit: 500, time: (now.getTime() / 1000) - 40000 },
      { ticket: 103, symbol: 'BTCUSD', type: 'BUY', volume: 0.1, price_open: 65000, price_current: 66200, profit: 1200, time: (now.getTime() / 1000) - 20000 }
    ]);
  }
});

// GET History (Equity Curve & Analytics)
router.get('/mt5/history', protect, async (req, res, next) => {
  try {
    const creds = await getPythonPayload(req.user.id);
    const result = await axios.post(`${PYTHON_API_URL}/history`, creds);
    res.json(result.data);
  } catch (error) {
    if (error.message === 'MT5_CREDENTIALS_MISSING') return res.status(400).json({ error: 'MT5_CREDENTIALS_MISSING' });
    
    // Fallback Mock Data
    const now = new Date();
    const mockEquity = [];
    let mockBal = 10000;
    const symbols = ['EURUSD', 'GBPUSD', 'XAUUSD', 'BTCUSD', 'US30'];
    let ticketBase = 500200;
    for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const profit = (Math.random() * 400 - 100);
        mockEquity.push({
            ticket: ticketBase++,
            symbol: symbols[Math.floor(Math.random() * symbols.length)],
            type: Math.random() > 0.5 ? 'BUY' : 'SELL',
            volume: (Math.floor(Math.random() * 15) + 1) / 10,
            price: 1.0 + (Math.random() * 50),
            commission: -2.5,
            swap: 0.1,
            time: d.toISOString(),
            profit: profit
        });
        mockBal += mockEquity[mockEquity.length - 1].profit; 
    }
    res.json({
        win_rate: 68.4,
        total_profit: 2450.0,
        trades_closed: 164,
        deals_history: mockEquity
    });
  }
});

// POST Market Watch
router.post('/mt5/market', protect, async (req, res, next) => {
  try {
    const creds = await getPythonPayload(req.user.id);
    // Use requested symbols or defaults
    const symbols = req.body.symbols || ['EURUSD', 'GBPUSD', 'XAUUSD', 'BTCUSD'];
    const payload = { ...creds, symbols };
    const result = await axios.post(`${PYTHON_API_URL}/market`, payload);
    const marketTicks = result.data || [];
    
    // Return direct array
    res.json(marketTicks);
  } catch (error) {
    if (error.message === 'MT5_CREDENTIALS_MISSING') return res.status(400).json({ error: 'MT5_CREDENTIALS_MISSING' });
    
    // Fallback Mock Data
    const symbols = req.body.symbols || ['EURUSD', 'GBPUSD', 'XAUUSD', 'BTCUSD'];
    const now = new Date().getTime() / 1000;
    const mockData = symbols.map(sym => {
       let bid = 1.0;
       if (sym === 'EURUSD') bid = 1.0850;
       if (sym === 'GBPUSD') bid = 1.2650;
       if (sym === 'XAUUSD') bid = 2150.2;
       if (sym === 'BTCUSD') bid = 65000.0;
       const spread = bid * 0.0001; // small fake spread
       return {
           symbol: sym,
           bid,
           ask: bid + spread,
           time: now
       }
    });
    res.json(mockData);
  }
});

// Close a single position
router.post('/mt5/close', protect, async (req, res, next) => {
  try {
    const { ticket } = req.body;
    const result = await axios.post(`${PYTHON_API_URL}/close_position`, { ticket });
    res.json(result.data);
  } catch (error) {
    next(error);
  }
});

// Close all positions
router.post('/mt5/close_all', protect, async (req, res, next) => {
  try {
    const { tickets } = req.body || {};
    const payload = {};
    if (Array.isArray(tickets) && tickets.length > 0) {
      payload.tickets = tickets;
    }

    const result = await axios.post(`${PYTHON_API_URL}/close_all`, payload);
    res.json(result.data);
  } catch (error) {
    next(error);
  }
});

// GET Algo Status
// router.get('/algo-status', protect, async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user.id);
//     res.json({ isAlgoEnabled: user.isAlgoEnabled || false });
//   } catch (error) {
//     next(error);
//   }
// });

// POST Algo Toggle
// router.post('/algo-toggle', protect, async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user.id);
//     user.isAlgoEnabled = !user.isAlgoEnabled;
//     await user.save();
//     res.json({ isAlgoEnabled: user.isAlgoEnabled });
//   } catch (error) {
//     next(error);
//   }
// });

module.exports = router;
