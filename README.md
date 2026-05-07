# DairySphere 2.0

<div align="center">
	<svg width="520" height="140" viewBox="0 0 520 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="DairySphere animated ribbon">
		<defs>
			<linearGradient id="ds-grad" x1="0" x2="1">
				<stop offset="0%" stop-color="#00d4ff" />
				<stop offset="50%" stop-color="#6d5ce7" />
				<stop offset="100%" stop-color="#4ea1ff" />
			</linearGradient>
			<filter id="ds-glow" x="-20%" y="-20%" width="140%" height="140%">
				<feGaussianBlur stdDeviation="6" result="blur" />
				<feColorMatrix type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.6  0 0 0 0 1  0 0 0 0.55 0" />
				<feBlend in="SourceGraphic" in2="blur" mode="screen" />
			</filter>
		</defs>

		<rect x="20" y="20" width="480" height="100" rx="18" fill="#0b1220" opacity="0.7" />
		<path d="M40 90 C120 30, 200 120, 280 70 S420 40, 480 85" stroke="url(#ds-grad)" stroke-width="4" fill="none" filter="url(#ds-glow)">
			<animate attributeName="stroke-dasharray" values="0,400;240,400;0,400" dur="6s" repeatCount="indefinite" />
			<animate attributeName="stroke-dashoffset" values="0;-80;0" dur="6s" repeatCount="indefinite" />
		</path>
		<circle cx="260" cy="70" r="8" fill="#eaf6ff">
			<animate attributeName="r" values="7;10;7" dur="3s" repeatCount="indefinite" />
		</circle>
		<text x="50%" y="58%" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="20" fill="#eaf6ff" opacity="0.92">DairySphere 2.0</text>
		<text x="50%" y="76%" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="12" fill="#9fb2d4" opacity="0.9">Modern dairy operations suite</text>
	</svg>
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

If you'd like, I can refine the visual style or add an accessibility toggle to reduce motion.
