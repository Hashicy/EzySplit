const Expense = require('../models/Expense');
const Group = require('../models/Group');
const { minCashFlow } = require('../utils/settle');

// Helper to parse query params for filtering/sorting/pagination
const parseQuery = (query) => {
  const { page = 1, limit = 10, search, sort, order = 'desc', category, paidBy, from, to } = query;
  return { page: Number(page), limit: Number(limit), search, sort, order, category, paidBy, from, to };
};

exports.createExpense = async (req, res, next) => {
  try {
    const { title, amount, paidBy, category, date, participants, groupId } = req.body;
    if (!title || !amount || !paidBy || !date) return res.status(400).json({ error: 'Missing required fields' });

    let finalParticipants = Array.isArray(participants) ? participants.map(p => String(p)) : [];

    // if groupId provided, validate group and membership and (if participants not provided)
    if (groupId) {
      const group = await Group.findById(groupId).lean();
      if (!group) return res.status(400).json({ error: 'Invalid groupId' });
      const requester = String(req.userId);
      if (String(group.owner) !== requester && !(group.members || []).includes(requester)) {
        return res.status(403).json({ error: 'Not a member of group' });
      }

      // If caller didn't pass participants, derive them from group members.
      if (!finalParticipants.length) {
        const membersRaw = (group.members || []).map(m => String(m));
        const idLike = membersRaw.filter(m => /^[0-9a-fA-F]{24}$/.test(m));
        const users = idLike.length ? await User.find({ _id: { $in: idLike } }).select('name username email').lean() : [];
        const usersById = {};
        users.forEach(u => { usersById[String(u._id)] = u; });
        finalParticipants = membersRaw.map(m => {
          if (/^[0-9a-fA-F]{24}$/.test(m)) {
            const u = usersById[m];
            return u ? (u.name || u.username || u.email) : m;
          }
          return m;
        });
      }
    }

    // ensure payer is included in participants
    if (!finalParticipants.includes(paidBy)) finalParticipants.push(paidBy);

    const expense = await Expense.create({
      title,
      amount: Number(amount),
      paidBy,
      category,
      date: new Date(date),
      participants: finalParticipants,
      userId: req.userId,
      groupId: groupId || undefined
    });
    res.status(201).json({ expense });
  } catch (err) {
    next(err);
  }
};

exports.getExpenses = async (req, res, next) => {
  try {
    const q = parseQuery(req.query);
    const filter = { userId: req.userId };
    if (q.search) {
      const s = q.search;
      filter.$or = [
        { title: { $regex: s, $options: 'i' } },
        { paidBy: { $regex: s, $options: 'i' } },
        { category: { $regex: s, $options: 'i' } },
        { participants: { $regex: s, $options: 'i' } }
      ];
    }
    // allow partial, case-insensitive matching for category and paidBy (trim inputs)
    if (q.category) {
      const cat = String(q.category).trim();
      if (cat.length) filter.category = { $regex: cat, $options: 'i' };
    }
    if (q.paidBy) {
      const pb = String(q.paidBy).trim();
      if (pb.length) filter.paidBy = { $regex: pb, $options: 'i' };
    }
    if (q.from || q.to) {
      filter.date = {};
      if (q.from) filter.date.$gte = new Date(q.from);
      if (q.to) {
        // make 'to' inclusive by setting end of day
        const toDate = new Date(q.to);
        toDate.setHours(23, 59, 59, 999);
        filter.date.$lte = toDate;
      }
    }

    const allowedSort = { amount: 'amount', date: 'date', title: 'title', paidBy: 'paidBy', createdAt: 'createdAt' };
    const sortField = allowedSort[q.sort] || 'date';
    const sortOrder = q.order && q.order.toLowerCase() === 'asc' ? 1 : -1;

    const offset = (q.page - 1) * q.limit;
    const limit = q.limit;

  const total = await Expense.countDocuments(filter);
  // Apply case-insensitive collation so string sorts are alphabetical ignoring case
  const query = Expense.find(filter).sort({ [sortField]: sortOrder }).skip(offset).limit(limit).lean();
  // add collation for case-insensitive string sorting
  query.collation({ locale: 'en', strength: 2 });
  const expenses = await query.exec();

    res.json({ meta: { total, page: q.page, limit: q.limit }, data: expenses });
  } catch (err) {
    next(err);
  }
};

exports.getExpense = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
  const expense = await Expense.findById(req.params.id).lean();
  if (!expense || String(expense.userId) !== String(req.userId)) return res.status(404).json({ error: 'Not found' });
    res.json({ expense });
  } catch (err) {
    next(err);
  }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = req.body;
    if (data.date) data.date = new Date(data.date);
    if (data.amount) data.amount = Number(data.amount);
  // ensure the expense belongs to the user
  const existing = await Expense.findById(id);
  if (!existing || String(existing.userId) !== String(req.userId)) return res.status(404).json({ error: 'Not found' });
  Object.assign(existing, data);
  const expense = await existing.save();
    res.json({ expense });
  } catch (err) {
    next(err);
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const id = req.params.id;
  const existing = await Expense.findById(id);
  if (!existing || String(existing.userId) !== String(req.userId)) return res.status(404).json({ error: 'Not found' });
  await Expense.deleteOne({ _id: id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

// Calculate split details for an expense
exports.getExpenseSplit = async (req, res, next) => {
  try {
  const id = req.params.id;
  const expense = await Expense.findById(id).lean();
  if (!expense || String(expense.userId) !== String(req.userId)) return res.status(404).json({ error: 'Not found' });

    // participants stored as JSON array; include payer if not present
    const participants = Array.isArray(expense.participants) && expense.participants.length ? expense.participants : [expense.paidBy];
    if (!participants.includes(expense.paidBy)) participants.push(expense.paidBy);

    const total = Number(expense.amount || 0);
    const share = Number((total / participants.length).toFixed(2));

    // compute balances relative to payer: positive means others owe this person
    const balances = {};
    participants.forEach(p => { balances[p] = 0; });
    // payer paid the whole amount
    balances[expense.paidBy] = Number((total - share).toFixed(2));
    participants.forEach(p => {
      if (p !== expense.paidBy) balances[p] = Number((-share).toFixed(2));
    });

  // compute minimal settlements using min-cash-flow algorithm
  const settlements = minCashFlow(balances);

  res.json({ total, share, participants, balances, settlements });
  } catch (err) {
    next(err);
  }
};

// Calculate overall split for all user's expenses (net balances and minimal settlements)
exports.getSummarySplit = async (req, res, next) => {
  try {
  const expenses = await Expense.find({ userId: req.userId }).lean();

    const totals = { count: expenses.length, amount: 0 };
    const balances = {}; // map person -> net balance (positive = owed to them)

    expenses.forEach(exp => {
      const participants = Array.isArray(exp.participants) && exp.participants.length ? [...exp.participants] : [];
      if (!participants.includes(exp.paidBy)) participants.push(exp.paidBy);
      const total = Number(exp.amount || 0);
      totals.amount += total;
      const share = Number((total / participants.length).toFixed(2));

      // ensure keys
      participants.forEach(p => { if (balances[p] === undefined) balances[p] = 0; });

      // payer gets total - share
      balances[exp.paidBy] = Number((balances[exp.paidBy] + (total - share)).toFixed(2));
      participants.forEach(p => {
        if (p !== exp.paidBy) balances[p] = Number((balances[p] - share).toFixed(2));
      });
    });

    // remove tiny rounding residues
    Object.keys(balances).forEach(k => {
      if (Math.abs(balances[k]) < 0.005) balances[k] = 0;
      else balances[k] = Number(balances[k].toFixed(2));
    });

  // compute settlements using min-cash-flow algorithm
  const settlements = minCashFlow(balances);

  res.json({ totals, balances, settlements });
  } catch (err) {
    next(err);
  }
};

module.exports = exports;
