# Shri Jewellers — Live Gold & Silver Rate Board

A two-page React app:

- **`/`** — public page showing today's gold rate (24K / 22K / 18K, per gram) and silver rate (per gram / per kg), with a "Last updated" timestamp. Updates live, no refresh needed.
- **`/admin`** — password-gated form to update the rates. Saving writes to Firebase, and the public page updates instantly for every visitor.

Data lives in **Firebase Realtime Database**, so you can change rates any time without redeploying the site.

---

## 1. Create the Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → give it a name (e.g. `shri-jewellers-rates`) → finish the wizard (Google Analytics is optional, you can skip it).
2. In the left sidebar, open **Build → Realtime Database** → **Create Database**.
   - Pick a location close to your users (e.g. Mumbai/`asia-southeast1`).
   - Start in **test mode** for now — you'll lock it down in step 4.
3. Once created, open the **Data** tab and add this starting structure using the **⋮ → Import JSON** option, or add it manually key by key:

   ```json
   {
     "gold": { "24k": 7350, "22k": 6735, "18k": 5510 },
     "silver": { "perGram": 92, "perKg": 92000 },
     "lastUpdated": 1735689600000
   }
   ```

4. Register a **Web app**: Project Overview (gear icon) → **Project settings** → scroll to **Your apps** → click the `</>` (Web) icon → give it a nickname → **Register app**. Firebase will show you a config object like:

   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "shri-jewellers-rates.firebaseapp.com",
     databaseURL: "https://shri-jewellers-rates-default-rtdb.asia-southeast1.firebasedatabase.app",
     projectId: "shri-jewellers-rates",
     storageBucket: "shri-jewellers-rates.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef123456"
   }
   ```

   Keep this tab open — you'll paste these values into `.env` next.

---

## 2. Configure environment variables

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` and paste in the values from the Firebase config object above (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_DATABASE_URL`, etc).
3. Set `VITE_ADMIN_PASSWORD` to whatever password you want staff to use to access `/admin`.

`.env` is already in `.gitignore`, so your keys won't get committed.

---

## 3. Run it locally

```bash
npm install
npm run dev
```

- Visit `http://localhost:5173` for the public rate board.
- Visit `http://localhost:5173/admin` to log in and update rates. Change a value and save — then check the home page in another tab; it updates without a refresh.

---

## 4. Secure the database rules (important)

By default in test mode, anyone can read **and write** your database directly (not just through your `/admin` page). Before going live, tighten the rules:

Go to **Realtime Database → Rules** and use:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

This keeps rates publicly readable (needed for the home page) but is still open for writes. Since this app only uses a shared front-end password (not real Firebase Authentication), Firebase itself can't verify that password — anyone who found your database URL could technically write to it directly.

For a small single-shop tool this is usually an acceptable trade-off, but if you want real protection, the low-effort upgrade is:

1. Enable **Firebase Authentication → Sign-in method → Email/Password**, and create one admin user.
2. Update the rules to:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": "auth != null"
     }
   }
   ```
3. Swap the password check in `src/pages/Admin.jsx` for `signInWithEmailAndPassword` from `firebase/auth`.

This README ships with the simpler shared-password version per the original brief; the steps above are there if you outgrow it.

---

## 5. Deploy to Vercel

1. Push this project to a GitHub repo.
2. In [vercel.com](https://vercel.com), click **Add New → Project**, and import the repo.
3. Vercel auto-detects Vite. Leave the default build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Before deploying, add your environment variables: **Settings → Environment Variables**, and add every key from `.env` (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_DATABASE_URL`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_ADMIN_PASSWORD`) for the **Production** (and Preview, if you want) environment.
5. Click **Deploy**. The included `vercel.json` makes sure `/admin` loads correctly instead of 404ing on refresh.
6. Once live, share the main URL with customers and keep `/admin` (plus the password) for staff only.

To update rates going forward: just open `yourdomain.com/admin` from any phone or computer — no redeploy needed.

---

## Data structure reference

```json
{
  "gold": {
    "24k": 7350,
    "22k": 6735,
    "18k": 5510
  },
  "silver": {
    "perGram": 92,
    "perKg": 92000
  },
  "lastUpdated": 1735689600000
}
```

`lastUpdated` is written automatically (Firebase server timestamp) every time the admin form is submitted — you don't need to set it by hand.

## Project structure

```
src/
  firebase.js          Firebase app + Realtime Database init
  App.jsx              Routes: "/" and "/admin"
  pages/
    Home.jsx / .css     Public rate board
    Admin.jsx / .css     Password-gated update form
  components/
    CornerOrnament.jsx  Decorative corner flourish (SVG)
    DiamondDivider.jsx  Decorative section divider (SVG)
  styles/global.css     Shared design tokens (colors, fonts)
```
