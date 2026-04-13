// Force Google DNS — fixes "querySrv ECONNREFUSED" when ISP DNS doesn't support SRV
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Account = require('./models/Account');
const Strategy = require('./models/Strategy');
const Asset = require('./models/Asset');

// Utility to generate equity curve data
const generateEquityCurve = (startEquity, days = 90) => {
  const curve = [];
  let equity = startEquity;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const change = (Math.random() - 0.42) * (equity * 0.025);
    equity = Math.max(equity + change, startEquity * 0.7);
    curve.push({
      date: date.toISOString().split('T')[0],
      equity: Math.round(equity * 100) / 100
    });
  }
  return curve;
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Account.deleteMany({});
    await Strategy.deleteMany({});
    await Asset.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Seed Users (passwords hashed automatically by User model's pre-save hook)
    const users = await User.create([
      {
        name: 'James Bradford',
        email: 'admin@jbcrownstone.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Sarah Mitchell',
        email: 'sarah@jbcrownstone.com',
        password: 'user123',
        role: 'user'
      }
    ]);
    console.log('👤 Users seeded:', users.length);

    // Seed Strategies
    const strategies = await Strategy.create([
      {
        name: 'Orion Engine',
        description: 'Advanced algorithmic strategy using multi-timeframe analysis and smart order routing',
        equity: 284750.32,
        totalTrades: 1847,
        winRate: 68.4,
        floatingPL: 3241.80,
        activePositions: 7,
        maxDrawdown: 8.2,
        monthlyReturn: 4.7,
        equityCurve: generateEquityCurve(250000),
        activeTrades: [
          { symbol: 'XAUUSD', type: 'BUY', lots: 2.5, openPrice: 2315.40, currentPrice: 2328.75, profit: 1668.75, openTime: '2024-01-15 09:32' },
          { symbol: 'EURUSD', type: 'SELL', lots: 5.0, openPrice: 1.08942, currentPrice: 1.08721, profit: 1105.00, openTime: '2024-01-15 10:15' },
          { symbol: 'BTCUSD', type: 'BUY', lots: 0.1, openPrice: 42100.00, currentPrice: 43250.00, profit: 1150.00, openTime: '2024-01-15 08:00' },
          { symbol: 'GBPUSD', type: 'BUY', lots: 3.0, openPrice: 1.27340, currentPrice: 1.27580, profit: 720.00, openTime: '2024-01-15 11:20' },
          { symbol: 'USDJPY', type: 'SELL', lots: 4.0, openPrice: 148.520, currentPrice: 148.230, profit: 782.00, openTime: '2024-01-15 07:45' },
        ]
      },
      {
        name: 'Titan Alpha',
        description: 'Momentum-based strategy targeting high-volatility breakouts with precision entry points',
        equity: 157320.88,
        totalTrades: 924,
        winRate: 72.1,
        floatingPL: -842.40,
        activePositions: 3,
        maxDrawdown: 12.5,
        monthlyReturn: 6.2,
        equityCurve: generateEquityCurve(140000),
        activeTrades: [
          { symbol: 'USOIL', type: 'BUY', lots: 10.0, openPrice: 71.42, currentPrice: 71.28, profit: -1400.00, openTime: '2024-01-15 06:30' },
          { symbol: 'BTCUSD', type: 'SELL', lots: 0.05, openPrice: 43500.00, currentPrice: 43250.00, profit: 125.00, openTime: '2024-01-15 12:00' },
          { symbol: 'XAUUSD', type: 'BUY', lots: 1.0, openPrice: 2320.00, currentPrice: 2328.75, profit: 432.50, openTime: '2024-01-15 13:10' },
        ]
      },
      {
        name: 'EURUSD Asian Break',
        description: 'Specialized strategy for capturing Asian session breakouts on the EURUSD pair',
        equity: 98441.15,
        totalTrades: 3012,
        winRate: 64.8,
        floatingPL: 1547.60,
        activePositions: 5,
        maxDrawdown: 6.1,
        monthlyReturn: 3.1,
        equityCurve: generateEquityCurve(90000),
        activeTrades: [
          { symbol: 'EURUSD', type: 'BUY', lots: 8.0, openPrice: 1.08650, currentPrice: 1.08780, profit: 1040.00, openTime: '2024-01-15 02:30' },
          { symbol: 'EURUSD', type: 'BUY', lots: 5.0, openPrice: 1.08710, currentPrice: 1.08780, profit: 350.00, openTime: '2024-01-15 03:15' },
          { symbol: 'EURGBP', type: 'BUY', lots: 3.0, openPrice: 0.85420, currentPrice: 0.85560, profit: 420.00, openTime: '2024-01-15 04:00' },
          { symbol: 'EURJPY', type: 'SELL', lots: 2.0, openPrice: 161.850, currentPrice: 161.780, profit: 93.80, openTime: '2024-01-15 04:45' },
          { symbol: 'EURCAD', type: 'BUY', lots: 2.0, openPrice: 1.47320, currentPrice: 1.47450, profit: 193.40, openTime: '2024-01-15 05:20' },
        ]
      },
      {
        name: 'Set & Forget',
        description: 'Long-term position trading strategy with wide stops and extended profit targets',
        equity: 412890.60,
        totalTrades: 287,
        winRate: 79.4,
        floatingPL: 8920.30,
        activePositions: 4,
        maxDrawdown: 15.3,
        monthlyReturn: 2.8,
        equityCurve: generateEquityCurve(380000, 120),
        activeTrades: [
          { symbol: 'XAUUSD', type: 'BUY', lots: 5.0, openPrice: 2180.00, currentPrice: 2328.75, profit: 37187.50, openTime: '2023-11-20 09:00' },
          { symbol: 'BTCUSD', type: 'BUY', lots: 0.5, openPrice: 38000.00, currentPrice: 43250.00, profit: 13125.00, openTime: '2023-12-01 10:00' },
          { symbol: 'USOIL', type: 'SELL', lots: 20.0, openPrice: 78.50, currentPrice: 71.28, profit: 14440.00, openTime: '2023-12-15 11:00' },
          { symbol: 'EURUSD', type: 'BUY', lots: 10.0, openPrice: 1.07200, currentPrice: 1.08780, profit: 15800.00, openTime: '2024-01-02 09:30' },
        ]
      }
    ]);
    console.log('📊 Strategies seeded:', strategies.length);

    // Seed Accounts
    const accounts = await Account.create([
      {
        accountId: 'ACC001',
        name: 'Primary Live Account',
        broker: 'IC Markets',
        currency: 'USD',
        balance: 287430.50,
        equity: 284750.32,
        floatingPL: -2680.18,
        winRate: 68.4,
        activePositions: 7,
        status: 'active',
        strategy: 'Orion Engine',
        equityCurve: generateEquityCurve(280000, 60)
      },
      {
        accountId: 'ACC002',
        name: 'Titan Live - Raw',
        broker: 'Pepperstone',
        currency: 'USD',
        balance: 159840.20,
        equity: 157320.88,
        floatingPL: -2519.32,
        winRate: 72.1,
        activePositions: 3,
        status: 'active',
        strategy: 'Titan Alpha',
        equityCurve: generateEquityCurve(155000, 60)
      },
      {
        accountId: 'ACC003',
        name: 'Asian Break Live',
        broker: 'XM Global',
        currency: 'USD',
        balance: 97200.00,
        equity: 98441.15,
        floatingPL: 1241.15,
        winRate: 64.8,
        activePositions: 5,
        status: 'active',
        strategy: 'EURUSD Asian Break',
        equityCurve: generateEquityCurve(95000, 60)
      },
      {
        accountId: 'ACC004',
        name: 'Set & Forget Premium',
        broker: 'FP Markets',
        currency: 'USD',
        balance: 404000.00,
        equity: 412890.60,
        floatingPL: 8890.60,
        winRate: 79.4,
        activePositions: 4,
        status: 'active',
        strategy: 'Set & Forget',
        equityCurve: generateEquityCurve(400000, 60)
      },
      {
        accountId: 'ACC005',
        name: 'Orion Engine - Demo',
        broker: 'IC Markets',
        currency: 'USD',
        balance: 100000.00,
        equity: 112430.75,
        floatingPL: 12430.75,
        winRate: 71.2,
        activePositions: 9,
        status: 'active',
        strategy: 'Orion Engine',
        equityCurve: generateEquityCurve(100000, 60)
      },
      {
        accountId: 'ACC006',
        name: 'Titan Alpha - Demo',
        broker: 'Pepperstone',
        currency: 'USD',
        balance: 50000.00,
        equity: 52140.30,
        floatingPL: 2140.30,
        winRate: 68.9,
        activePositions: 2,
        status: 'active',
        strategy: 'Titan Alpha',
        equityCurve: generateEquityCurve(50000, 60)
      },
      {
        accountId: 'ACC007',
        name: 'Conservative Fund',
        broker: 'Vantage Markets',
        currency: 'USD',
        balance: 500000.00,
        equity: 498320.45,
        floatingPL: -1679.55,
        winRate: 81.2,
        activePositions: 2,
        status: 'paused',
        strategy: 'Set & Forget',
        equityCurve: generateEquityCurve(495000, 60)
      }
    ]);
    console.log('💰 Accounts seeded:', accounts.length);

    // Seed Assets
    const assets = await Asset.create([
      {
        symbol: 'XAUUSD',
        name: 'Gold vs US Dollar',
        type: 'commodity',
        bid: 2328.45,
        ask: 2328.75,
        change: 12.35,
        changePercent: 0.53,
        profit: 5840.25,
        high: 2335.20,
        low: 2314.80,
        spread: 0.30
      },
      {
        symbol: 'BTCUSD',
        name: 'Bitcoin vs US Dollar',
        type: 'crypto',
        bid: 43245.00,
        ask: 43255.00,
        change: -820.50,
        changePercent: -1.86,
        profit: -1247.80,
        high: 44120.00,
        low: 43050.00,
        spread: 10.00
      },
      {
        symbol: 'USOIL',
        name: 'US Crude Oil',
        type: 'commodity',
        bid: 71.26,
        ask: 71.28,
        change: -0.84,
        changePercent: -1.17,
        profit: 2315.40,
        high: 72.45,
        low: 70.98,
        spread: 0.02
      },
      {
        symbol: 'EURUSD',
        name: 'Euro vs US Dollar',
        type: 'forex',
        bid: 1.08778,
        ask: 1.08780,
        change: 0.00215,
        changePercent: 0.20,
        profit: 1840.00,
        high: 1.08920,
        low: 1.08540,
        spread: 0.00002
      },
      {
        symbol: 'GBPUSD',
        name: 'British Pound vs US Dollar',
        type: 'forex',
        bid: 1.27575,
        ask: 1.27580,
        change: -0.00142,
        changePercent: -0.11,
        profit: 720.00,
        high: 1.27840,
        low: 1.27320,
        spread: 0.00005
      },
      {
        symbol: 'USDJPY',
        name: 'US Dollar vs Japanese Yen',
        type: 'forex',
        bid: 148.228,
        ask: 148.230,
        change: 0.342,
        changePercent: 0.23,
        profit: -380.50,
        high: 148.650,
        low: 147.920,
        spread: 0.002
      }
    ]);
    console.log('📈 Assets seeded:', assets.length);

    console.log('\n✅ Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Login credentials:');
    console.log('   Email:    admin@jbcrownstone.com');
    console.log('   Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seedData();
