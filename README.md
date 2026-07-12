# Ooty Trip Manager

A group-trip budget tracker + itinerary/guide for the Mysore → Ooty trip
(Jul 17–20, 2026). Built with React + Vite.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

## Build

```bash
npm run build      # outputs to ./dist
npm run preview    # preview the production build
```

## Deploy to Netlify

You have three options — pick whichever is easiest for you.

### Option A — Drag & drop (no account setup, fastest)
1. Run `npm install && npm run build` on your machine.
2. Go to https://app.netlify.com/drop
3. Drag the generated **`dist`** folder onto the page.
4. Netlify gives you a live URL immediately.

(If you want a nicer URL later, claim the site and rename it in Site settings.)

### Option B — Netlify CLI
```bash
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod --dir=dist
```

### Option C — Connect a Git repo (auto-deploy on every push)
1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Netlify: **Add new site → Import an existing project** → pick the repo.
3. Netlify reads `netlify.toml` automatically:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy. Every future `git push` redeploys.

> This repo's project files live at the **repo root** (not a subfolder), so no
> "Base directory" setting is needed in Netlify — the default works out of the box.

## IMPORTANT: data storage

This deployed version stores data in the browser's **localStorage**, via a shim
in `src/main.jsx`. That means:

- Data persists across page reloads on the **same browser/device**.
- Data is **NOT shared** between different people or devices. Each visitor gets
  their own separate copy. (The original Claude artifact used a shared store;
  a plain static site has no built-in server to share data.)

If you need the whole group to see the **same** expenses and balances, configure Firebase Realtime Database and Storage:

1. Create a Firebase project at console.firebase.google.com.
2. Enable Realtime Database (Test Mode) and Cloud Storage.
3. Configure the environment variables in your `.env` file (see `.env.example` for details).

Once configured, the app will automatically synchronize all databases and photos in real time across different devices and browsers!
