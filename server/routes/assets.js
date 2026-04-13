const express = require('express');
const router = express.Router();
const { getAssets, getAssetsByType } = require('../controllers/assetController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All asset routes protected

router.get('/', getAssets);
router.get('/type/:type', getAssetsByType);

module.exports = router;
