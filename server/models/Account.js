const mongoose = require('mongoose');

const equityPointSchema = new mongoose.Schema({
  date: { type: String, required: true },
  equity: { type: Number, required: true }
}, { _id: false });

const accountSchema = new mongoose.Schema({
  accountId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  broker: { type: String, required: true },
  currency: { type: String, default: 'USD' },
  balance: { type: Number, required: true },
  equity: { type: Number, required: true },
  floatingPL: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  activePositions: { type: Number, default: 0 },
  strategy: { type: String, required: true },
  status: {
    type: String,
    enum: ['active', 'inactive', 'paused'],
    default: 'active'
  },
  equityCurve: [equityPointSchema]
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
