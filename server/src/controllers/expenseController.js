const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { minCashFlow } = require('../utils/settle');

// Helper to parse query params for filtering/sorting/pagination
const parseQuery = (query) => {
  const { page = 1, limit = 10, search, sort, order = 'desc', category, paidBy, from, to } = query;
  return { page: Number(page), limit: Number(limit), search, sort, order, category, paidBy, from, to };
};

exports.createExpense = async (req, res, next) => {
  try {
    const { title, amount, paidBy, category, date, participants } = req.body;
    if (!title || !amount || !paidBy || !date) return res.status(400).json({ error: 'Missing required fields' });
    const expense = await prisma.expense.create({
  data: { title, amount: Number(amount), paidBy, category, date: new Date(date), participants: participants || null, userId: req.userId }
    });
    res.status(201).json({ expense });
  } catch (err) {
    next(err);
  }
};

exports.getExpenses = async (req, res, next) => {
  try {
    const q = parseQuery(req.query);
  const where = {};
    const params = [];
    const parts = [];
  // always restrict to the authenticated user's expenses
  parts.push('userId = ?');
  params.push(q.userId || req.userId);
    if (q.search) {
      const s = q.search.toLowerCase();
      parts.push("(LOWER(title) LIKE CONCAT('%', ?, '%') OR LOWER(paidBy) LIKE CONCAT('%', ?, '%') OR LOWER(category) LIKE CONCAT('%', ?, '%'))");
      params.push(s, s, s);
    }
  if (q.category) { parts.push('category = ?'); params.push(q.category); }
  if (q.paidBy) { parts.push('paidBy = ?'); params.push(q.paidBy); }
    if (q.from) { parts.push('date >= ?'); params.push(q.from); }
    if (q.to) { parts.push('date <= ?'); params.push(q.to); }

    const whereSql = parts.length ? ('WHERE ' + parts.join(' AND ')) : '';

  // Allow only safe sort fields and map friendly names to actual columns
  const allowedSort = { amount: 'amount', date: 'date', title: 'title', paidBy: 'paidBy', createdAt: 'createdAt' };
  const sortField = allowedSort[q.sort] || 'date';
    const sortOrder = q.order && q.order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const offset = (q.page - 1) * q.limit;
    const limit = q.limit;

    // Count
  const countSql = `SELECT COUNT(*) as cnt FROM Expense ${whereSql}`;
    const countRes = await prisma.$queryRawUnsafe(countSql, ...params);
    const total = countRes && countRes[0] ? Number(countRes[0].cnt) : 0;

    // Data
  // Note: sortField is mapped from a whitelist above
  const dataSql = `SELECT * FROM Expense ${whereSql} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
    const dataParams = params.concat([limit, offset]);
    const expenses = await prisma.$queryRawUnsafe(dataSql, ...dataParams);

    res.json({ meta: { total, page: q.page, limit: q.limit }, data: expenses });
  } catch (err) {
    next(err);
  }
};

exports.getExpense = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense || expense.userId !== req.userId) return res.status(404).json({ error: 'Not found' });
    res.json({ expense });
  } catch (err) {
    next(err);
  }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    if (data.date) data.date = new Date(data.date);
    if (data.amount) data.amount = Number(data.amount);
  // ensure the expense belongs to the user
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.userId) return res.status(404).json({ error: 'Not found' });
  const expense = await prisma.expense.update({ where: { id }, data });
    res.json({ expense });
  } catch (err) {
    next(err);
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.userId) return res.status(404).json({ error: 'Not found' });
  await prisma.expense.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

// Calculate split details for an expense
exports.getExpenseSplit = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.userId !== req.userId) return res.status(404).json({ error: 'Not found' });

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
    const expenses = await prisma.expense.findMany({ where: { userId: req.userId } });

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
