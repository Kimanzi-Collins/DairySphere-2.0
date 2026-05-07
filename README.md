# DairySphere 2.0

<div align="center">
  <img src="docs/dairysphere-banner.svg" alt="DairySphere animated ribbon" width="520" height="140" />
</div>

Full-stack dairy management platform with a modern React + Node.js stack.

## Overview

- Backend: Node.js/Express API (controllers, routes, middleware) serving authentication, farmers, agents, factories, deliveries, purchases, sales, loans, milk quality, and reports.
- Frontend: Vite + React + TypeScript single-page app with a polished UI, dashboards, forms, and printable reports.

## Key Features

- Secure authentication with role-aware access
- Farmers, Agents, Factories, Inputs management (CRUD)
- Deliveries, Purchases, Sales, Loans, Loan Repayments tracking
- Milk quality capture and inspection history
- Interactive dashboards with charts (bar, pie, area)
- Detailed reports: farmers list, agents commission, deliveries, purchases, loans, statements
- Export reports and profiles to PDF and Excel
- Data formatting utilities (currency, dates, litres)
- File uploads for entity assets
- Reusable UI components: cards, modals, forms, status badges, export buttons
- Motion-enhanced UI with GSAP transitions

## Frontend Structure

- `frontend/src/components` — shared components and forms
- `frontend/src/pages` — top-level pages (Dashboard, Farmers, Agents, Reports, etc.)
- `frontend/src/api` — API client

## Backend Structure

- `backend/controllers` — request handlers
- `backend/routes` — route definitions
- `backend/middleware` — auth, role checks, uploads
- `backend/config` — DB and environment configuration

## Quick Start

1. Backend

```bash
cd backend
npm install
node server.js
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Adjust environment variables or `config/db.js` as needed to point to your database.
