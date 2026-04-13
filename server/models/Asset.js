const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['forex', 'crypto', 'commodity'],
    required: true
  },
  bid: { type: Number, required: true },
  ask: { type: Number, required: true },
  change: { type: Number, default: 0 },
  changePercent: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  high: { type: Number },
  low: { type: Number },
  spread: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
