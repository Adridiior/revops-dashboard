# RevOps Dashboard (React)

A lightweight RevOps / CRM-style dashboard built with React + React Router.
It showcases internal-tool patterns: list views, drill-down detail pages, KPI summaries, and local persistence.

## Features
- Team/My view mode (global state shared across routes)
- Deals list: high-value filter, sorting by value, and deal detail page
- Deal detail: activity timeline, add activity, reset demo data, localStorage persistence
- Reps: KPI per rep + rep detail with deals list
- Accounts: KPI per account + account detail with deals list
- Corporate UI styling (custom CSS)

## Tech Stack
- React (Vite)
- React Router
- Local demo data (no backend)
- localStorage for persisted activities

## Getting Started
```bash
npm install
npm run dev


## Notes: This project is intentionally frontend-focused to demonstrate React fundamentals: routing, derived data (KPIs), component composition, and state-driven UI.
