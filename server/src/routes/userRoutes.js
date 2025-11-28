const express = require('express');
const router = express.Router();
const { searchUsers, getUser, follow, unfollow, me, updateProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');

// Public search so the app can discover users without an auth cookie
router.get('/search', searchUsers);
router.get('/me', auth, me);
router.put('/me', auth, updateProfile);
router.get('/:id', auth, getUser);
router.post('/:id/follow', auth, follow);
router.post('/:id/unfollow', auth, unfollow);

module.exports = router;
