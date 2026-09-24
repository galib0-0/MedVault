# MedVault AI

MedVault AI is a patient–doctor portal: patients store and manage lifelong medical
records, and doctors get verified emergency access. This repo currently contains:

- `frontend/` — React (Vite) SPA with Patient/Doctor signup, login and role dashboards
- `backend/` — Node + Express REST API (MongoDB via Atlas) with real authentication
  (bcrypt password hashing + JWT sessions) and an auto-seeded admin account

Login is now **real**: arbitrary email/password no longer works. Accounts are created
through signup and stored in MongoDB; the admin account can open **both** the Patient
and Doctor dashboards.

## Prerequisites

- Node.js 18+ (tested with v24)
- A MongoDB database. The project is wired to **MongoDB Atlas** (cloud).
  - Create a free cluster at https://www.mongodb.com/atlas
  - Atlas → Database → Connect → Drivers → copy your connection string

## Backend setup (one time)

```bash
cd backend
npm install
```

Edit `backend/.env` and set:

| Variable         | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| `MONGODB_URI`    | Your Atlas connection string                                 |
| `JWT_SECRET`     | A long random string (keep secret)                           |
| `ADMIN_EMAIL`    | The email to use to sign in as admin                         |
| `ADMIN_PASSWORD` | The admin password                                           |

> Network note: if your ISP DNS refuses `mongodb+srv://` lookups (error
> `querySrv ECONNREFUSED`), use the **direct seed-list** form of the URI instead.
> In Atlas (`Database > Connect > Drivers`) add a driver, then copy the three
> `ac-...mongodb.net` shard hostnames and build a `mongodb://` URI like the one
> already in `backend/.env`.

On first start, the backend creates the admin user from `ADMIN_EMAIL` /
`ADMIN_PASSWORD` automatically.

## Run (two terminals)

```bash
# Terminal 1 — backend
cd backend
npm start

# Terminal 2 — frontend
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

### Signing in

| Role              | Credentials                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| **Admin**         | `galibhussain200630@gmail.com` / `GXLIB@1978` (from `backend/.env`) — access to **both** dashboards |
| **Patient**       | Create an account via **Create an account → Patient**, then sign in          |
| **Doctor**        | Create an account via **Create an account → Doctor** (starts as `PENDING` verification), then sign in |

## API overview

Base URL: `http://localhost:5173/api` (Vite proxies `/api` → `http://localhost:5000`)

| Method | Endpoint                       | Auth  | Description                          |
| ------ | ------------------------------ | ----- | ------------------------------------ |
| POST   | `/api/auth/signup/patient`     | —     | Create a patient account             |
| POST   | `/api/auth/signup/doctor`      | —     | Create a doctor account (pending)    |
| POST   | `/api/auth/login`              | —     | Login → returns `{ token, user }`    |
| GET    | `/api/auth/me`                 | JWT   | Current user                         |
| GET    | `/api/auth/dashboards`         | JWT   | Dashboards the user may open         |
| GET    | `/api/health`                  | —     | Health check                         |

Authentication: send `Authorization: Bearer <token>`.

## Project layout

```
backend/
  models/User.js        # User schema + toAuthJSON()
  routes/auth.js        # signup patient/doctor, login, me, dashboards
  middleware/auth.js    # JWT signing, requireAuth, requireRole
  scripts/seedAdmin.js  # Re-run admin seeding manually
  server.js             # App entry, DB connect + admin seed on boot
frontend/src/
  lib/api.js            # Fetch wrapper for /api
  lib/auth.js           # signup/login/session helpers (now server-backed)
  components/ProtectedRoute.jsx  # Route guard; ADMIN allowed on both dashboards
  pages/LoginPage.jsx            # Real login with error toasts
  pages/PatientSignupPage.jsx    # Posts to backend
  pages/DoctorSignupPage.jsx     # Posts to backend
```

## Notes

- Doctor documents (certificates/photos) are currently stored as file metadata
  (name/type/size) — actual file upload storage is a future step.
- Keep `backend/.env` out of version control (already ignored).