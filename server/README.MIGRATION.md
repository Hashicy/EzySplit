Migration to MongoDB (Mongoose)

What changed
- Replaced Prisma client usage with Mongoose models (`src/models/User.js`, `src/models/Expense.js`).
- Controllers updated to use Mongoose queries.
- `server.js` now connects to MongoDB using `process.env.DATABASE_URL`.
- `prisma/seed.js` rewritten to seed MongoDB.

Required manual steps
1. Update `server/.env` DATABASE_URL to a MongoDB connection string, for example:

   mongodb://username:password@host:port/database

   or for MongoDB Atlas:

   mongodb+srv://<user>:<pass>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority

2. From `server/` run:

   npm install

3. Seed (optional):

   npm run seed

4. Start dev server:

   npm run dev

Notes
- The original Prisma files remain for reference. If you want, I can remove `server/prisma/schema.prisma` and other Prisma artifacts.
- Tests that relied on Prisma will need to be updated to use Mongoose models.
