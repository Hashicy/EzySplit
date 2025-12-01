const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const gc = require('../controllers/groupController');

router.post('/', auth, gc.createGroup);
router.get('/:id', auth, gc.getGroup);
router.get('/:id/expenses', auth, gc.getGroupExpenses);
router.put('/:id/members', auth, gc.updateMembers);
router.delete('/:id', auth, gc.deleteGroup);

module.exports = router;
