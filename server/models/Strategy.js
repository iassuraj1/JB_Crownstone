const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  lots: { type: Number, required: true },
  openPrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  profit: { type: Number, required: true },
  openTime: { type: String, required: true }
}, { _id: false });

const equityPointSchema = new mongoose.Schema({
  date: { type: String, required: true },
  equity: { type: Number, required: true }
}, { _id: false });

const strategySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  equity: { type: Number, required: true },
  totalTrades: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  floatingPL: { type: Number, default: 0 },
  activePositions: { type: Number, default: 0 },
  maxDrawdown: { type: Number, default: 0 },
  monthlyReturn: { type: Number, default: 0 },
  equityCurve: [equityPointSchema],
  activeTrades: [tradeSchema]
}, { timestamps: true });

module.exports = mongoose.model('Strategy', strategySchema);
