Local development

Start the dev server from `client/`:

```bash
npm install
npm run dev
```

If your backend API runs on a different host or port, set `VITE_API_URL` before starting Vite, for example:

```bash
export VITE_API_URL="http://localhost:4000/api"
npm run dev
```

The frontend Axios wrapper uses `import.meta.env.VITE_API_URL` or defaults to `http://localhost:4000/api`.
