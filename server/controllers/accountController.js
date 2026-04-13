const Account = require('../models/Account');

// @desc  Get all accounts
// @route GET /accounts
const getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find().select('-__v');
    res.json({ accounts, count: accounts.length });
  } catch (err) {
    next(err);
  }
};

// @desc  Get single account
// @route GET /accounts/:id
const getAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ accountId: req.params.id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found.' });
    }
    res.json({ account });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAccounts, getAccount };
