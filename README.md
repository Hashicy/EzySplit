# EzySplit
## Running locally (dev)

Start backend and frontend in separate terminals.

Backend:

```bash
cd server
npm install
npm run dev
```

Frontend:

```bash
cd client
npm install
npm run dev
```

You can set `VITE_API_URL` if your backend isn't at `http://localhost:4000/api`.

Or use the helper script `start-dev.sh` in the project root to launch both (macOS/Linux):

```bash
./start-dev.sh
```

