const Asset = require('../models/Asset');

// @desc  Get all assets
// @route GET /assets
const getAssets = async (req, res, next) => {
  try {
    const assets = await Asset.find().select('-__v');
    res.json({ assets, count: assets.length });
  } catch (err) {
    next(err);
  }
};

// @desc  Get assets by type
// @route GET /assets/type/:type
const getAssetsByType = async (req, res, next) => {
  try {
    const assets = await Asset.find({ type: req.params.type }).select('-__v');
    res.json({ assets, count: assets.length });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAssets, getAssetsByType };
