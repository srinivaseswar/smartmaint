# SmartMaint MERN API

This is the backend foundation for the SmartMaint prototype. The original `SmartMaint-Original.html` remains unchanged in Downloads.

## Setup

1. Install MongoDB locally or create a MongoDB Atlas database.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` and `JWT_SECRET`.
3. Install packages with `npm install`.
4. Start the API with `npm run dev`.

## Endpoints

- `GET /api/health` - server health check
- `POST /api/auth/login` - authenticate a user
- `GET /api/auth/me` - current authenticated user
- `GET /api/machines` - list machines
- `POST /api/machines` - create a machine for authorized roles
- `PATCH /api/machines/:id` - update a machine for authorized roles
- `GET /api/dashboard/summary` - dashboard KPI aggregates

Protected routes require `Authorization: Bearer <token>`.

## Frontend

The Vite React frontend lives in `client/`.

```bash
cd client
npm install
npm run dev
```
