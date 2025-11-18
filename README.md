# EzySplit — Smart Expense Sharing Web App

EzySplit is a production-oriented full-stack web application to help groups track, manage, and split shared expenses fairly. It provides secure authentication, intuitive UI, advanced list querying (search, filter, sort, pagination), and automated settlement calculations to compute who owes whom the minimal amounts.

Table of Contents
- About
- Key Features
- Technology Stack
- Getting Started
  - Prerequisites
  - Environment Variables
  - Local Development
  - Building & Production
- API Overview
  - Authentication Endpoints
  - Expense Endpoints
  - Querying / Pagination / Sorting
- Data Models (Mongoose)
- Splitting & Settlement Logic
- Testing
- Deployment
- Contributing
- License
- Contact

About
-----
EzySplit is targeted at roommates, groups, and teams who need a simple but robust system to create expenses, share them across participants, and compute net balances and minimal settlements. The project is designed to be production-ready with sensible defaults for authentication, API design, and deployment practices.

Key Features
------------
- User registration and JWT-based authentication (HTTP-only cookies)
- Full CRUD for expenses
- Advanced list operations: search, filtering, sorting, pagination
- Per-expense share calculation and global minimal settlement (min-cash-flow)
- Responsive React frontend with protected routes
- Clean RESTful API with clear JSON responses
- Tests for backend (Jest) and frontend (Vitest + React Testing Library)

Technology Stack
----------------
Frontend
- React (Vite)
- React Router
- Axios
- TailwindCSS (or CSS Modules)
- Context API or Zustand for state

Backend
- Node.js + Express
- MongoDB Atlas + Mongoose
- JSON Web Tokens (JWT) stored in Secure HTTP-only cookies
- bcrypt for password hashing
- Validation with Joi/Zod or similar

Testing & CI
- Jest (backend)
- Vitest + React Testing Library (frontend)

Deployment
- Frontend: Vercel
- Backend: Render (or preferred Node host)
- Database: MongoDB Atlas
- Version control: Git + GitHub

Getting Started
---------------
Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- MongoDB Atlas cluster (or local MongoDB)
- A browser for the frontend
- (Optional) Render / Vercel accounts for deployment

Clone the repository
```bash
git clone https://github.com/Hashicy/EzySplit.git
cd EzySplit
```

Environment Variables
Create a .env file in the backend folder (e.g. ./server/.env). Example variables:

```
PORT=4000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/ezy_split?retryWrites=true&w=majority
JWT_SECRET=your_long_random_jwt_secret
JWT_EXPIRES_IN=7d
COOKIE_SECURE=true # set to true in production (HTTPS)
CORS_ORIGIN=https://yourfrontenddomain.com
```

Local Development
- Install dependencies for both frontend and backend.

From project root (adjust paths if your repo structure separates `client` and `server`):

```bash
# Backend
cd server
npm install
npm run dev         # runs server with nodemon / ts-node (if configured)

# Frontend
cd ../client
npm install
npm run dev         # runs Vite dev server
```

Open the frontend URL shown by Vite (usually http://localhost:5173) and the backend on its port (e.g. http://localhost:4000).

Building & Production
- Build frontend for production and deploy to Vercel (or other hosting).
- Build backend and deploy to Render (or other Node hosting service).
- Ensure environment variables are set in production and that cookies are configured as secure and sameSite where appropriate.

API Overview
------------
All endpoints return JSON. Protected routes require a valid JWT present in an HTTP-only cookie set by login.

Authentication Endpoints
- POST /api/register
  - Body: { name, email, password }
  - Response: 201 { user }
- POST /api/login
  - Body: { email, password }
  - Response: 200 { user } and sets HTTP-only cookie
- GET /api/me
  - Protected: returns current user
- POST /api/logout
  - Clears cookie and ends session

Expense Endpoints
- POST /api/
  - Create a new expense
  - Body example:
    { title, amount, paidBy, participants: [string], category, date }
- GET /api/
  - Read list of expenses (supports search/filter/sort/pagination)
  - Query params:
    - search (string, matches title/category/paidBy)
    - category (string)
    - paidBy (string)
    - from (ISO date)
    - to (ISO date)
    - sort (field, e.g. date, amount, title, createdAt)
    - order (asc|desc)
    - page (number)
    - limit (number)
  - Response example:
    {
      meta: { total: 42, page: 1, limit: 20 },
      data: [ ...expenses ]
    }
- GET /api/:id
  - Read a single expense
- PUT /api/:id
  - Update an expense (owner only)
- DELETE /api/:id
  - Delete an expense (owner only)

Querying / Pagination / Sorting
- Use ?page=1&limit=20&sort=date&order=desc&search=rent to combine operations.
- Responses include meta with total count to help UI pagination.

Data Models (Mongoose)
----------------------
User
```js
{
  name: String,
  email: { type: String, unique: true, required: true },
  password: String, // hashed with bcrypt
  createdAt: Date,
  updatedAt: Date
}
```

Expense
```js
{
  title: String,
  amount: Number,
  paidBy: String,           // user id or display name
  participants: [String],   // list of participant identifiers (user ids or emails)
  category: String,
  date: Date,
  userId: { type: ObjectId, ref: "User" }, // owner
  createdAt: Date,
  updatedAt: Date
}
```

Splitting & Settlement Logic
----------------------------
- Per-expense share: amount / participants.length (split equally by default).
- Net balances: aggregate over all expenses to compute how much each participant is owed/owes.
- Minimal settlement algorithm: standard min-cash-flow greedy algorithm that repeatedly matches the highest creditor with the highest debtor until all balances are settled. Output is a list of transactions: { from, to, amount }.

Example settlement output:
```json
[
  { "from": "alice@example.com", "to": "carol@example.com", "amount": 25.50 },
  { "from": "bob@example.com", "to": "carol@example.com", "amount": 10.00 }
]
```

Testing
-------
Backend:
- Jest is configured for unit and integration tests.
- Run:
```bash
cd server
npm test
```

Frontend:
- Vitest + React Testing Library for components and hooks.
- Run:
```bash
cd client
npm test
```

Deployment
----------
- Frontend: Deploy the built static site to Vercel. Ensure API base URL (proxy or environment var) points to the backend.
- Backend: Deploy to Render (or similar). Configure environment variables (MONGO_URI, JWT_SECRET, CORS_ORIGIN, cookie settings).
- Database: Use MongoDB Atlas with a secure user and IP access controls.

Security & Best Practices
- Store JWT in secure HTTP-only cookies; avoid localStorage for tokens.
- Hash passwords with bcrypt and use a sufficiently high salt rounds.
- Validate and sanitize input on both backend and frontend.
- Use HTTPS in production and set cookie `secure: true` and correct `sameSite`.
- Rate-limit authentication endpoints and consider account lockout protections.

Contributing
------------
Contributions are welcome. Typical workflow:
- Fork the repository
- Create a feature branch: git checkout -b feat/my-feature
- Implement tests and functionality
- Open a PR with a clear description of changes and motivation

Please follow the code style and include tests for new logic, especially for the settlement algorithm and API behavior.

License
-------
MIT

Contact
-------
Repository: https://github.com/Hashicy/EzySplit
Author: Hashicy
For questions or help setting up, open an issue in the repository or contact via GitHub.