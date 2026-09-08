# Enterprise Procurement & Approval Platform

A modern, resilient, role-based enterprise procurement application built to streamline purchase requests, approval workflows, budget validation, vendor order assignment, and idempotent payment processing.

---

## Architecture Overview

- **Frontend**: React (Vite, Tailwind CSS, Lucide Icons, React Router v6)
- **Backend**: Node.js & Express (Layered: Routes, Controllers, Services, Domain, Repositories, Middleware)
- **Database**: PostgreSQL (Prisma ORM with support for Supabase / Neon pooled connections)
- **Design Patterns**:
  - **Adapter Pattern**: Vendor catalog abstraction (`TechSourceAdapter`)
  - **Strategy Pattern**: Pluggable payment strategies with duplicate payment prevention (`BankTransferStrategy`)
  - **State Pattern / Finite State Machine**: Deterministic lifecycle enforcement
  - **Observer Pattern**: Event-driven decoupled notification dispatch and audit trails
  - **Circuit Breaker**: Preventing cascading external dependency failures (`CLOSED` $\rightarrow$ `OPEN` $\rightarrow$ `HALF-OPEN`)

---

## User Roles & Capabilities

| Role | Default Email | Password | Primary Capabilities |
|---|---|---|---|
| **EMPLOYEE** | `employee@company.com` | `password123` | Create draft requests, submit, view status, cancel eligible requests |
| **MANAGER** | `manager@company.com` | `password123` | View pending manager queue, approve or reject with comments |
| **FINANCE** | `finance@company.com` | `password123` | Validate department budget, approve or reject financial requests |
| **PROCUREMENT_ADMIN** | `procurement@company.com` | `password123` | Select vendors, initiate procurement, execute idempotent payment, complete order |

---

## Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run db:setup
npm run dev
```
The backend API server will start at `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The React application will start at `http://localhost:5173`.

---

## Running Automated Tests

```bash
# Run complete MVP lifecycle integration tests
cd backend
npm test
```

---

## Free-Tier Cloud Deployment Guide

### 1. Database (Neon / Supabase)
1. Create a free project on [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com).
2. Copy the PostgreSQL connection string.
3. Set `DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"` in your backend environment.

### 2. Backend (Render / Railway)
1. Push this repository to GitHub.
2. In Render, create a **New Web Service** linked to your GitHub repo.
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `node src/server.js`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `DATABASE_URL`: Your Supabase/Neon PostgreSQL connection URI
     - `JWT_SECRET`: A secure random string
     - `FRONTEND_URL`: Your Vercel frontend URL

### 3. Frontend (Vercel)
1. In Vercel, import your GitHub repository.
2. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_BASE_URL`: `https://<your-backend>.onrender.com/api`
3. Click **Deploy**. Vercel will handle the build and configure SPA routing using `vercel.json`.
