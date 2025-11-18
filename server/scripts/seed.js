require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Expense = require('../src/models/Expense');

function randomChoice(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function randomAmount() { return Number((Math.random()*200 + 5).toFixed(2)); }
function randomDateWithin(days=90){ const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random()*days)); return d; }

const TITLES = ['Lunch', 'Groceries', 'Taxi', 'Movie night', 'Coffee', 'Dinner', 'Utilities', 'Electricity', 'Rent share', 'Birthday gift', 'Uber', 'Snack run', 'Office supplies', 'Project meetup', 'Concert tickets', 'Subscription', 'Gym fee', 'Parking', 'Road trip', 'Pizza'];
const CATS = ['Food','Transport','Bills','Entertainment','Other'];
const PEOPLE = ['Isha','Aarav','Harshita','Bhavika','Neha','Rohit','Sana','Vikram'];

async function seed() {
  const mongoUrl = process.env.DATABASE_URL;
  if (!mongoUrl) {
    console.error('Missing DATABASE_URL in .env');
    process.exit(1);
  }
  await mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

  // create or find admin user
  const email = 'admin@gmail.com';
  let user = await User.findOne({ email });
  if (!user) {
    const hashed = await bcrypt.hash('password', 10);
    user = await User.create({ email, password: hashed, name: 'Admin' });
    console.log('Created user', email);
  } else {
    console.log('Found existing user', email);
  }

  // create 20 expenses
  const created = [];
  for (let i=0;i<20;i++){
    const title = randomChoice(TITLES) + (Math.random()>0.6? ' - ' + Math.floor(Math.random()*1000): '');
    const amount = randomAmount();
    const category = randomChoice(CATS);
    const paidBy = randomChoice(PEOPLE);
    const participants = [paidBy, ...Array.from({length: Math.floor(Math.random()*3)}, ()=> randomChoice(PEOPLE))].filter((v,i,a)=>a.indexOf(v)===i);
    const date = randomDateWithin(120);

    const exp = await Expense.create({ title, amount, category, paidBy, participants, date, userId: user._id });
    created.push(exp);
  }
  console.log('Created', created.length, 'expenses for', email);
  await mongoose.disconnect();
}

seed().catch(e=>{ console.error(e); process.exit(1); });
