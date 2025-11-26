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

UI improvements
--------------

I updated global and component styles to give the app a cleaner, more professional look:

- New design tokens in `src/index.css` (colors, radius, shadows, spacing).
- Improved typography using Inter-like system stack and smoother font rendering.
- Updated buttons, inputs, cards, navbar, search bar, and expense card styles for consistent spacing and subtle shadows.

To tweak the look: edit the color variables at the top of `src/index.css` (for example `--primary`, `--accent`, `--border`).
