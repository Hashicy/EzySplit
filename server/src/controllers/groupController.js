const Group = require('../models/Group');
const Expense = require('../models/Expense');
const User = require('../models/User');

exports.createGroup = async (req, res, next) => {
  try {
    const { name, members } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) return res.status(400).json({ error: 'Name required' });
    const membersArr = Array.isArray(members) ? members : [];
    // basic validation: members should be strings (ids), limit size
    if (membersArr.length > 500) return res.status(400).json({ error: 'Too many members' });
    for (const m of membersArr) {
      if (typeof m !== 'string' || !m.trim()) return res.status(400).json({ error: 'Invalid member id' });
    }
    try {
      const group = await Group.create({ name: name.trim(), owner: req.userId, members: membersArr.map(m => m.toString()) });
      return res.status(201).json({ group });
    } catch (e) {
      // surface mongoose validation errors clearly
      console.error('Group.create error', e);
      return res.status(500).json({ error: e.message || 'Failed to create group' });
    }
  } catch (err) { next(err); }
}

exports.getGroup = async (req, res, next) => {
  try {
  const group = await Group.findById(req.params.id).lean();
    if (!group) return res.status(404).json({ error: 'Not found' });
    // only allow access to owner or members
    const requester = String(req.userId);
    if (String(group.owner) !== requester && !(group.members || []).includes(req.userId?.toString ? req.userId.toString() : req.userId)) {
      // allow owner access; otherwise return limited info
      return res.status(403).json({ error: 'Forbidden' });
    }
    // populate id-like members with user objects for display
    const membersRaw = (group.members || []).map(m => String(m));
    const idLike = membersRaw.filter(m => /^[0-9a-fA-F]{24}$/.test(m));
    const users = idLike.length ? await User.find({ _id: { $in: idLike } }).select('_id name username email').lean() : [];
    const usersById = {};
    users.forEach(u => { usersById[String(u._id)] = u; });
    const membersList = membersRaw.map(m => (usersById[m] || m));
    const ownerObj = await User.findById(group.owner).select('_id name username email').lean() || group.owner;
    res.json({ group: { ...group, owner: ownerObj, members: membersList } });
  } catch (err) { next(err); }
};

// list groups for current user
exports.listMyGroups = async (req, res, next) => {
  try {
    const uid = String(req.userId);
    const groups = await Group.find({ $or: [ { owner: uid }, { members: uid } ] }).lean();
    const out = [];
    for (const g of groups) {
      const membersRaw = (g.members || []).map(m => String(m));
      const idLike = membersRaw.filter(m => /^[0-9a-fA-F]{24}$/.test(m));
      const users = idLike.length ? await User.find({ _id: { $in: idLike } }).select('_id name username email').lean() : [];
      const usersById = {};
      users.forEach(u => { usersById[String(u._id)] = u; });
      const membersList = membersRaw.map(m => (usersById[m] || m));
      const ownerObj = await User.findById(g.owner).select('_id name username email').lean() || g.owner;
      out.push({ ...g, owner: ownerObj, members: membersList });
    }
    res.json({ groups: out });
  } catch (err) { next(err); }
};

exports.getGroupExpenses = async (req, res, next) => {
  try {
    const gid = req.params.id;
    const group = await Group.findById(gid).lean();
    if (!group) return res.status(404).json({ error: 'Not found' });
    // ensure requester is owner or member
    const requester = String(req.userId);
    if (String(group.owner) !== requester && !(group.members || []).includes(requester)) return res.status(403).json({ error: 'Forbidden' });
    const expenses = await Expense.find({ groupId: gid }).sort({ date: -1 }).lean();
    res.json({ data: expenses, meta: { total: expenses.length } });
  } catch (err) { next(err); }
};

// Add or remove members. Body: { add: ['name'], remove: ['name'] }
exports.updateMembers = async (req, res, next) => {
  try {
    const gid = req.params.id;
    const group = await Group.findById(gid);
    if (!group) return res.status(404).json({ error: 'Not found' });
    // only owner can change members
    if (String(group.owner) !== String(req.userId)) return res.status(403).json({ error: 'Forbidden' });
    const { add = [], remove = [] } = req.body;
    const members = new Set(group.members || []);
    (Array.isArray(add) ? add : []).forEach(m => { if (m && m.toString) members.add(m.toString()); });
    (Array.isArray(remove) ? remove : []).forEach(m => { if (m && m.toString) members.delete(m.toString()); });
    group.members = Array.from(members);
    await group.save();
  // return owner populated and members as user objects when possible (match getGroup shape)
  const raw = group.toObject();
  const membersRaw = (raw.members || []).map(m => String(m));
  const idLike = membersRaw.filter(m => /^[0-9a-fA-F]{24}$/.test(m));
  const users = idLike.length ? await User.find({ _id: { $in: idLike } }).select('_id name username email').lean() : [];
  const usersById = {};
  users.forEach(u => { usersById[String(u._id)] = u; });
  const membersList = membersRaw.map(m => (/^[0-9a-fA-F]{24}$/.test(m) ? (usersById[m] || { _id: m }) : { name: m }));
  const ownerObj = await User.findById(raw.owner).select('_id name username email').lean() || raw.owner;
  const resp = { ...raw, owner: ownerObj, members: membersList };
  res.json({ group: resp });
  } catch (err) { next(err); }
};

// Delete group and associated expenses
exports.deleteGroup = async (req, res, next) => {
  try {
    const gid = req.params.id;
    const group = await Group.findById(gid);
    if (!group) return res.status(404).json({ error: 'Not found' });
    // only owner can delete
    if (String(group.owner) !== String(req.userId)) return res.status(403).json({ error: 'Forbidden' });
    // delete expenses that belong to this group
    await Expense.deleteMany({ groupId: gid });
    await Group.deleteOne({ _id: gid });
    res.json({ message: 'Group and associated expenses deleted' });
  } catch (err) { next(err); }
};
