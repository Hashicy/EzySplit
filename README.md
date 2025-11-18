EzySplit — Smart Expense Sharing Web App

Effortlessly track, manage, and split shared expenses with friends, roommates, and teams.

🚀 Overview

EzySplit is a full-stack expense sharing platform built with React + Node.js + MongoDB.
It allows users to securely manage shared expenses, split amounts among participants, and compute minimal settlements.

The app includes:

✔ Secure authentication
✔ Full expense CRUD
✔ Search, filter, sort & pagination
✔ Settlement algorithm
✔ Clean UI with protected routes
✔ Production-ready deployment setup

🧰 Tech Stack
Frontend

React (Vite)

React Router

Axios

TailwindCSS / CSS Modules

Context API / Zustand

Backend

Node.js

Express.js

MongoDB + Mongoose

JWT (HTTP-only cookies)

bcrypt (password hashing)

DevOps

Vercel (Frontend)

Render (Backend)

MongoDB Atlas (Database)

Git + GitHub

✨ Features
🔐 Authentication

Register, Login, Logout

Password hashing with bcrypt

JWT stored in secure HTTP-only cookies

Protected APIs and protected frontend routes

🧾 Expense Management

Add, edit, delete expenses

Each expense stores:

title

amount

paidBy

category

date

participants[]

owner (userId)

Auto timestamps (createdAt, updatedAt)

🔍 Advanced Querying

Search – title, category, paidBy

Filter – category, paidBy, date range

Sort – amount, date, title, createdAt

Pagination – page & limit

💸 Settlement Calculator

Computes net balances for all participants

Minimal-settlement algorithm (min cash flow)

📱 UI/UX

Responsive, clean interface

Public routes: Home, Login, Signup

Protected routes: Dashboard, Expenses, Profile

Logout + session persistence

📦 Project Structure
Backend (/server)
server/
 ├─ src/
 │   ├─ models/
 │   │   ├─ User.js
 │   │   └─ Expense.js
 │   ├─ routes/
 │   │   ├─ auth.routes.js
 │   │   └─ expense.routes.js
 │   ├─ middleware/
 │   │   └─ authMiddleware.js
 │   ├─ utils/
 │   │   └─ settlement.js
 │   ├─ controllers/
 │   ├─ config/
 │   └─ server.js
 ├─ package.json
 └─ .env

Frontend (/client)
client/
 ├─ src/
 │   ├─ components/
 │   ├─ pages/
 │   ├─ context/
 │   ├─ hooks/
 │   ├─ utils/
 │   └─ App.jsx
 ├─ package.json
 └─ .env

🗄️ API Endpoints
Auth
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Login + issue JWT cookie
GET	/api/auth/me	Get authenticated user
POST	/api/auth/logout	Clear JWT cookie
Expenses
Method	Endpoint	Description
POST	/api/expenses	Create expense
GET	/api/expenses	List with search/filter/sort/pagination
GET	/api/expenses/:id	Get expense by ID
PUT	/api/expenses/:id	Update expense
DELETE	/api/expenses/:id	Delete expense

Query params supported:

?search=
&category=
&paidBy=
&sort=
&order=
&page=
&limit=
&from=
&to=

🧮 Settlement Logic

Algorithm steps:

Calculate each participant’s total paid amount.

Compute each participant’s fair share.

Determine who owes whom.

Apply minimal cash-flow algorithm to reduce transfers.

Result example:

[
  { "from": "A", "to": "B", "amount": 500 },
  { "from": "C", "to": "A", "amount": 200 }
]

🧪 Testing

Backend: Jest + Supertest

Frontend: Vitest + React Testing Library

Sample test command:

npm test

🚀 Deployment
Frontend (Vercel)
npm run build
vercel deploy

Backend (Render)

Add environment variables

Add MongoDB URI

Set build/run command

Enable CORS with credentials

Shared .env Variables

Backend

MONGO_URI=
JWT_SECRET=
COOKIE_SECRET=
CLIENT_URL=


Frontend

VITE_API_URL=

🗂️ Future Enhancements

Group-based expense rooms

Invite via email + notifications

Charts & analytics (monthly trends, categories)

Dark mode

Mobile app (React Native)

Receipt upload + OCR

📚 Setup Instructions
1. Clone the repo
git clone https://github.com/your-username/EzySplit.git
cd EzySplit

2. Install dependencies
cd server && npm install
cd ../client && npm install

3. Start development servers

Backend:

npm run dev


Frontend:

npm run dev

4. Open in browser
http://localhost:5173
