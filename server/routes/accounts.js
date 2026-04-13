const express = require('express');
const router = express.Router();
const { getAccounts, getAccount } = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All account routes protected

router.get('/', getAccounts);
router.get('/:id', getAccount);

module.exports = router;
