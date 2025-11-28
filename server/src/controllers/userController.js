const User = require('../models/User');

exports.searchUsers = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      // return a small sample of users when no query is provided
      const users = await User.find({}).limit(20).select('_id name username email');
      return res.json({ users });
    }
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const users = await User.find({ $or: [{ name: re }, { username: re }, { email: re }] }).limit(20).select('_id name username email');
    res.json({ users });
  } catch (err) { next(err); }
};

exports.getUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select('_id name username email followers following');
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({ user });
  } catch (err) { next(err); }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('_id name username email followers following');
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({ user });
  } catch (err) { next(err); }
};

exports.follow = async (req, res, next) => {
  try {
    const me = await User.findById(req.userId);
    const toFollow = await User.findById(req.params.id);
    if (!toFollow) return res.status(404).json({ error: 'User not found' });
    if (me._id.equals(toFollow._id)) return res.status(400).json({ error: "Can't follow yourself" });
    // idempotent
    if (!me.following.includes(toFollow._id)) {
      me.following.push(toFollow._id);
      toFollow.followers.push(me._id);
      await me.save();
      await toFollow.save();
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
};

exports.unfollow = async (req, res, next) => {
  try {
    const me = await User.findById(req.userId);
    const toUn = await User.findById(req.params.id);
    if (!toUn) return res.status(404).json({ error: 'User not found' });
    me.following = me.following.filter(x => !x.equals(toUn._id));
    toUn.followers = toUn.followers.filter(x => !x.equals(me._id));
    await me.save();
    await toUn.save();
    res.json({ ok: true });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Not found' });
    const { name, username } = req.body;
    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) return res.status(409).json({ error: 'Username already taken' });
      user.username = username;
    }
    if (name) user.name = name;
    await user.save();
    res.json({ user: { id: user.id, email: user.email, name: user.name, username: user.username, followers: user.followers, following: user.following } });
  } catch (err) { next(err); }
};
