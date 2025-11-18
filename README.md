.

📌 EzySplit — Smart Expense Sharing Web App
Project Proposal (Improved & Professional)
1. Introduction

EzySplit is a full-stack web application designed to help individuals, roommates, friends, and teams track, manage, and split shared expenses fairly. The platform provides secure authentication, intuitive UI, powerful filtering/sorting, and automated settlement calculations for groups.

The goal is to build a real-world, production-ready expense-sharing system with clean architecture, optimized APIs, and a scalable frontend.

2. Objectives

Build a responsive and user-friendly web app for shared expense management.

Implement secure user authentication with protected routes.

Provide full CRUD operations for expenses.

Support advanced list operations:

Search

Sort

Filter

Pagination

Automatically compute net balances and minimal settlements among participants.

Deploy a live, production-ready full-stack application.

3. Technology Stack
Frontend

React (Vite)

React Router

Axios

TailwindCSS / CSS Modules

Context API or Zustand for state management

Backend

Node.js + Express.js

Mongoose + MongoDB Atlas

JWT Authentication (stored via Secure HTTP-only cookies)

bcrypt for password hashing

Deployment

Frontend: Vercel

Backend: Render

Database: MongoDB Atlas

Version Control: Git + GitHub

Testing

Jest (Backend)

Vitest + React Testing Library (Frontend)

4. Core Features
🔐 Authentication Module

User Registration (email + password + name)

User Login with JWT-based session

Auto-auth user route /api/auth/me

Logout endpoint that clears cookies

Passwords stored using bcrypt hashing

JWT stored in secure HTTP-only cookies

Endpoints:

POST /api/auth/register  
POST /api/auth/login  
GET  /api/auth/me  
POST /api/auth/logout  

🧾 Expense Management (CRUD)

Each expense includes:

title (string)

amount (number)

paidBy (string)

participants (string[])

category (string)

date (ISO string)

userId (owner reference)

createdAt, updatedAt

Endpoints:

POST   /api/expenses         → Create  
GET    /api/expenses         → Read (with search/filter/sort/pagination)  
GET    /api/expenses/:id     → Read by ID  
PUT    /api/expenses/:id     → Update  
DELETE /api/expenses/:id     → Delete  

🔍 Advanced List Querying

Support for:

Search → title, category, paidBy

Filtering → category, paidBy, date range (from & to)

Sorting → date, amount, title, createdAt

Pagination → page & limit

Response example:

{
  meta: { total, page, limit },
  data: [ ...expenses ]
}

💸 Splitting & Settlement Logic

Per-expense share calculation based on participants

Net balance computation across all expenses

Minimal settlement algorithm (min-cash-flow)

Output: who owes whom and how much

🧭 UX & Routing
Public Pages

Home

Login

Signup

Protected Pages

Dashboard

Expenses List

Add/Edit Expense

Profile

Features:

Auto-redirect to login if unauthenticated

Navbar showing auth state

Clean, responsive design

5. Data Models (Mongoose)
User Model
{
  name: String,
  email: { type: String, unique: true, required: true },
  password: String, // hashed
  createdAt: Date,
  updatedAt: Date
}

Expense Model
{
  title: String,
  amount: Number,
  paidBy: String,
  category: String,
  date: Date,
  participants: [String],
  userId: { type: ObjectId, ref: "User" },
  createdAt: Date,
  updatedAt: Date
}

6. API Contract (Short Examples)
Register
POST /api/auth/register
Body: { email, password, name }
→ 201 { user }

Login
POST /api/auth/login
→ sets HTTP-only cookie + returns { user }

Get expenses
GET /api/expenses?search=&category=&page=&limit=&sort=&order=
→ { meta, data }
