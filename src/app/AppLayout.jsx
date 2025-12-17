import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

export default function AppLayout() {
  const [viewMode, setViewMode] = useState("team"); // "team" | "my"

  return (
  <div className="container">
    <div className="shell">
      <header className="topbar">
        <div className="brand">RevOps Dashboard</div>

        <div className="viewToggle">
          <span className="label">View:</span>

          <button
            type="button"
            onClick={() => setViewMode("team")}
            className={`btn ${viewMode === "team" ? "btnActive" : ""}`}
          >
            Team
          </button>

          <button
            type="button"
            onClick={() => setViewMode("my")}
            className={`btn ${viewMode === "my" ? "btnActive" : ""}`}
          >
            My
          </button>
        </div>
      </header>

      <div className="content">
        <nav className="nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/deals">Deals</NavLink>
          <NavLink to="/reps">Reps</NavLink>
          <NavLink to="/accounts">Accounts</NavLink>
        </nav>

        <p className="muted" style={{ marginTop: 0 }}>
          Current mode: <strong>{viewMode}</strong>
        </p>

        <main>
          <Outlet context={{ viewMode }} />
        </main>
      </div>
    </div>
  </div>
);}