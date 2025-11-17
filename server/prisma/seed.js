const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function randomChoice(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function randomAmount() { return Number((Math.random()*200 + 5).toFixed(2)); }
function randomDateWithin(days=90){ const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random()*days)); return d; }

const TITLES = ['Lunch', 'Groceries', 'Taxi', 'Movie night', 'Coffee', 'Dinner', 'Utilities', 'Electricity', 'Rent share', 'Birthday gift', 'Uber', 'Snack run', 'Office supplies', 'Project meetup', 'Concert tickets', 'Subscription', 'Gym fee', 'Parking', 'Road trip', 'Pizza'];
const CATS = ['Food','Transport','Bills','Entertainment','Other'];
const PEOPLE = ['Isha','Aarav','Harshita','Bhavika','Neha','Rohit','Sana','Vikram'];

async function seed() {
  console.log('Seeding 20 random expenses...');
  // create or find a test user
  const testEmail = 'seed.user@example.com';
  let user = await prisma.user.findUnique({ where: { email: testEmail } });
  if (!user) {
    user = await prisma.user.create({ data: { email: testEmail, password: 'password', name: 'Seed User' } });
  }
  const created = [];
  for (let i=0;i<20;i++){
    const title = randomChoice(TITLES) + (Math.random()>0.6? ' - ' + Math.floor(Math.random()*1000): '');
    const amount = randomAmount();
    const category = randomChoice(CATS);
    const paidBy = randomChoice(PEOPLE);
    const participants = [paidBy, ...Array.from({length: Math.floor(Math.random()*3)}, ()=> randomChoice(PEOPLE))].filter((v,i,a)=>a.indexOf(v)===i);
    const date = randomDateWithin(120);

    const exp = await prisma.expense.create({ data: {
      title, amount, category, paidBy, participants, date, userId: user.id
    }});
    created.push(exp);
  }
  console.log('Created', created.length, 'expenses');
}

seed()
  .catch(e=>{ console.error(e); process.exit(1); })
  .finally(()=> prisma.$disconnect());
