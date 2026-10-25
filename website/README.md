# Guardian Eye Website

The public site and guardian dashboard for [Guardian Eye](../README.md). It is part of the same
repository as the Python edge engine and has no separate backend of its own.

- **Public site** (`/`): interactive overview, decision-rule explorer, simulated dashboard preview
  and PWA install prompt.
- **Demo** (`/demo`): a read-only dashboard with simulated incidents. No Firebase account or
  credentials are required.
- **Guardian dashboard** (`/dashboard`, `/statistics`, `/profile`): Firebase Authentication plus a
  realtime Firestore listener for confirmed emergencies, statistics, CSV export and the local
  camera stream.

The interface follows the system preference for reduced motion and uses keyboard-accessible
controls, labelled dialogs and focus states.

---

## Requirements

- Node.js **20.19+** (or 22.12+) and npm
- A Firebase project with **Email/Password** authentication and **Cloud Firestore**
- Optional: a Guardian Eye edge device on the same network for the camera feed

## Quick start

```bash
cd website
npm ci
cp .env.example .env.local
# Fill in the VITE_FIREBASE_* values in .env.local
npm run dev
```

Open the URL printed by Vite. The public site and `/demo` work immediately, even without Firebase.
The account routes show a setup notice until every required `VITE_FIREBASE_*` value is present.

Production build:

```bash
npm run build
npm run preview
```

`dist/` is a static SPA. Serve it with a rewrite/fallback to `index.html` for unknown paths.
The PWA service worker updates automatically on the next visit.

---

## Firebase setup

1. Create a Firebase project and add a **Web app**.
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Create a **Cloud Firestore** database.
4. Copy the web app configuration into `website/.env.local`:

   ```dotenv
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

5. Deploy the Firestore rules from this directory. Select your project with `firebase use` or pass
   `--project` explicitly. Do not commit a `.firebaserc` containing a project ID.

   ```bash
   npx firebase-tools deploy --only firestore:rules --project YOUR_PROJECT_ID
   ```

6. Create a guardian account at `/signup`, copy the **pairing ID** from `/profile`, and put it in
   `device_config.json` on the Pi:

   ```json
   {
     "user_id": "YOUR_FIREBASE_UID",
     "gemini_api_key": ""
   }
   ```

The Python edge engine writes with the Firebase **Admin SDK**, so it is not subject to browser
Firestore rules. The rules in [`firestore.rules`](firestore.rules) govern browser access only.

### Firestore schema

The website and Python engine share exactly one schema:

```text
users/{uid}/emergencies/{emergencyId}
  reason:    string   // human-readable detection reason
  status:    "active" | "resolved"
  timestamp: Firestore timestamp
```

Browser clients can read their own events, create an active test alert, and change an event to
`resolved` when it is acknowledged. They cannot rewrite the reason or timestamp, and cannot delete
history. All other client access is denied.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_FIREBASE_API_KEY` | For dashboard | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | For dashboard | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | For dashboard | Firestore project |
| `VITE_FIREBASE_STORAGE_BUCKET` | For dashboard | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | For dashboard | Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | For dashboard | Firebase web app ID |
| `VITE_CAMERA_STREAM_TOKEN` | Optional | Default camera token, visible in the client bundle |

All Vite variables are embedded in the browser bundle. Never put server credentials, the Firebase
Admin SDK key or the Telegram bot token in this directory.

---

## Using the dashboard

- **Realtime listener** — `onSnapshot` receives new emergencies without a page refresh.
- **Emergency overlay** — a new active event opens a full-screen alert. Acknowledging it writes
  `status: "resolved"` to Firestore and clears the overlay.
- **Stale alerts** — the full-screen overlay hides after five minutes, but the event stays visible
  with an **Acknowledge** action until a guardian resolves it.
- **Test alert** — the dashboard can write a single test emergency to verify the whole path.
- **Statistics** — filter by 7/30 days or all time, filter by status, search reasons/IDs, inspect
  the daily chart and signal breakdown, and export the current filter to CSV.
- **Camera** — enter the device IP (port `5000` is added automatically), optionally add the stream
  token, then retry or open fullscreen. The address is remembered in local storage; the token is
  kept in session storage only.
- **Install** — supported browsers show an install button that adds Guardian Eye as a standalone
  PWA.

The demo at `/demo` mirrors the dashboard and statistics UI with simulated events. It is read-only:
nothing is written to Firestore and no Telegram/SMS message is sent. It also cannot access real
data.

---

## Camera stream security

The Python backend serves an MJPEG stream on port `5000` (`/video_feed`). It is designed for a
trusted local network, not the public internet.

Optional settings on the edge device:

```dotenv
# Require ?token=... on /video_feed
CAMERA_STREAM_TOKEN=choose-a-long-random-value

# Comma-separated browser origins. Unset keeps the current permissive LAN behavior.
CORS_ORIGINS=http://localhost:5173,http://192.168.1.20:5173
```

If `CAMERA_STREAM_TOKEN` is set, enter the same value in the camera dialog or set
`VITE_CAMERA_STREAM_TOKEN` locally. Because Vite variables are public, the environment variable is
only a convenience for a trusted LAN; prefer typing the token into the dialog.

Browsers block an `http://` camera stream on an `https://` dashboard (mixed content). Use the
dashboard over LAN HTTP, or put the camera behind an HTTPS reverse proxy/tunnel. Do not forward port
`5000` from your router.

---

## Project layout

```text
website/
├── public/                     Favicon, PWA icons, social preview
├── src/
│   ├── components/             Shared dashboard, landing and auth UI
│   │   └── landing/            3D hero, decision lab, dashboard preview
│   ├── contexts/               Firebase Auth provider and hook
│   ├── demo/                   Simulated incident data
│   ├── hooks/                  PWA install prompt
│   ├── pages/                  Landing, auth, demo, dashboard, statistics, profile
│   ├── utils/                  Date/format, CSV, clipboard, auth errors
│   ├── App.jsx                 Lazy routes and reduced-motion configuration
│   ├── firebase.js             Env-based Firebase initialization
│   └── main.jsx                React entry point
├── firestore.rules             Browser access rules
├── firebase.json               Firestore CLI configuration
├── .env.example                Environment template
└── vite.config.js              Vite + PWA manifest
```

---

## Verification

```bash
npm run lint
npm run build
npm audit --omit=dev
```

`npm run check` runs lint and build together. The build emits the PWA service worker and precache
manifest into `dist/`.

---

## Troubleshooting

| Symptom | Check |
| --- | --- |
| “Firebase is not configured” | Every required `VITE_FIREBASE_*` value is set in `.env.local`, then restart Vite |
| `Missing or insufficient permissions` | Deploy `firestore.rules` and confirm the signed-in UID matches the document path |
| Dashboard is empty | Confirm the Pi uses the same Firebase project and a valid `device_config.json` UID |
| Sign-in fails | Email/Password provider is enabled; check the exact Firebase Auth error shown |
| Camera shows “Mixed content blocked” | The dashboard is HTTPS and the camera is HTTP; use LAN HTTP or HTTPS for the stream |
| Camera is offline | The Pi is reachable on port `5000`, `main.py` is running, and the token matches |
| Install button is missing | The site must be served over HTTPS (or localhost) and the browser must support PWA install |

---

## License and attribution

Released under the MIT License. See the repository [LICENSE](../LICENSE) for the full text.

Copyright (c) 2026 Yedukrishna R (@yedukrishna012)

The web dashboard was originally contributed by **jubin217** and is credited in
[NOTICE](../NOTICE). The Guardian Eye name and branding are used across the merged project.
