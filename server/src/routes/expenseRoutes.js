const express = require('express');
const router = express.Router();
const expenseCtrl = require('../controllers/expenseController');
const auth = require('../middleware/auth');

router.post('/', auth, expenseCtrl.createExpense);
router.get('/', auth, expenseCtrl.getExpenses);
router.get('/:id', auth, expenseCtrl.getExpense);
router.put('/:id', auth, expenseCtrl.updateExpense);
router.delete('/:id', auth, expenseCtrl.deleteExpense);

module.exports = router;
