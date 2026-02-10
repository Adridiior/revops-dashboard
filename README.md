# RevOps Dashboard (React)

**Live Dashboard:** https://revops-dashboard.netlify.app/

A RevOps / CRM-style dashboard built with React, designed to visualize real business data coming from a live backend API.

The dashboard showcases common internal-tool patterns: KPI summaries, list views, drill-down pages, and derived metrics based on real database data.

---

## Features

- Team / My view toggle (global shared state)
- Dashboard KPIs derived from live backend data
- Deals list with filtering, sorting and detail view
- Reps view with per-rep KPIs and deal breakdown
- Accounts view with per-account KPIs and related deals
- Corporate-style UI with custom CSS

---

## Tech Stack

- React (Vite)
- React Router
- REST API integration
- PostgreSQL-backed backend (Railway)
- Netlify deployment

---

## Backend Integration

This dashboard consumes a live REST API built with Node.js, Express and Prisma.

- Data is fetched from a real PostgreSQL database
- KPIs are computed client-side based on API responses
- No mock data is used in production

The backend API is deployed on Railway and shared across environments via environment variables.

---

## Local Development

```bash
npm install
npm run dev
```

The dashboard expects a backend API URL to be configured via environment variables.

---

## Notes

This project is designed to demonstrate:

- End-to-end full-stack integration
- Frontend consumption of real production APIs
- State-driven UI and derived metrics
- Patterns commonly found in internal business tools (CRM / RevOps dashboards)

Together with the backend API, it represents a complete, production-style full-stack application.
