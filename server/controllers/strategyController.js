const Strategy = require('../models/Strategy');

// @desc  Get all strategies
// @route GET /strategies
const getStrategies = async (req, res, next) => {
  try {
    const strategies = await Strategy.find().select('-__v');
    res.json({ strategies, count: strategies.length });
  } catch (err) {
    next(err);
  }
};

// @desc  Get single strategy
// @route GET /strategies/:name
const getStrategy = async (req, res, next) => {
  try {
    const strategy = await Strategy.findOne({
      name: { $regex: new RegExp(req.params.name, 'i') }
    });
    if (!strategy) {
      return res.status(404).json({ message: 'Strategy not found.' });
    }
    res.json({ strategy });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStrategies, getStrategy };
