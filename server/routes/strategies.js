const express = require('express');
const router = express.Router();
const { getStrategies, getStrategy } = require('../controllers/strategyController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All strategy routes protected

router.get('/', getStrategies);
router.get('/:name', getStrategy);

module.exports = router;
