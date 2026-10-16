# FoodShare — Zero-Waste Food Sharing Platform

A starter full-stack web app for helping people share surplus food with nearby community members.

## Included
- React + Vite frontend
- Express backend API
- Supabase-ready database schema and optional integration
- Demo mode that works without Supabase credentials
- Food listings, filters, listing form, and claim action
- `.env.example` files and setup instructions

## Requirements
- Node.js 18+ (20+ recommended)
- npm
- Optional: a Supabase project for persistent data

## Run locally

### 1. Start the backend
```bash
cd server
npm install
cp .env.example .env
npm run dev
```
The API runs at `http://localhost:5000`.

On Windows PowerShell, if `cp` does not work:
```powershell
Copy-Item .env.example .env
```

### 2. Start the frontend
Open a second terminal:
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
Open the local URL printed by Vite (usually `http://localhost:5173`).

## Supabase setup (optional)
1. Create a project at https://supabase.com.
2. In Supabase, open **SQL Editor** and run `supabase/schema.sql`.
3. Copy your project URL and **service role key** into `server/.env`.
   - Keep the service role key on the backend only. Never put it in frontend environment variables.
4. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
5. Restart the backend.

If Supabase variables are not configured, the backend uses in-memory demo data. Demo changes reset when the server restarts.

## Environment variables

`server/.env`
```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

`client/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

## API routes
- `GET /api/health` — API status
- `GET /api/foods` — list available food posts; supports `?q=` and `?category=`
- `POST /api/foods` — create a food listing
- `POST /api/foods/:id/claim` — claim a listing

## Important notes
- This is a learning/demo starter, not a production-ready food safety or identity-verification system.
- Add authentication, row-level security policies, moderation, and validation before public deployment.
- Do not publish secrets or commit `.env` files.
