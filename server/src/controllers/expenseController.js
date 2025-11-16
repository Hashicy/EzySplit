const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
      data: { title, amount: Number(amount), paidBy, category, date: new Date(date), participants: participants || null }
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
    // Build parameterized SQL for case-insensitive search and filters
    const params = [];
    const parts = [];
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

    // Allow only safe sort fields
    const allowedSort = ['amount', 'date', 'title', 'createdAt'];
    const sortField = allowedSort.includes(q.sort) ? q.sort : 'createdAt';
    const sortOrder = q.order && q.order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const offset = (q.page - 1) * q.limit;
    const limit = q.limit;

    // Count
    const countSql = `SELECT COUNT(*) as cnt FROM Expense ${whereSql}`;
    const countRes = await prisma.$queryRawUnsafe(countSql, ...params);
    const total = countRes && countRes[0] ? Number(countRes[0].cnt) : 0;

    // Data
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
    if (!expense) return res.status(404).json({ error: 'Not found' });
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
    const expense = await prisma.expense.update({ where: { id }, data });
    res.json({ expense });
  } catch (err) {
    next(err);
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.expense.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = exports;
