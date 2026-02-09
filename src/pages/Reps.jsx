import { Link, useOutletContext } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { currentUser } from "../data/currentUser";
import { getVisibleDeals } from "../utils/deals";
import { computeSimpleKpis } from "../utils/dealsKpis";

import { fetchDeals, fetchReps } from "../app/api/revopsApi";

export default function Reps() {
  const { viewMode } = useOutletContext();

  const [reps, setReps] = useState(null);   // null = loading
  const [deals, setDeals] = useState(null); // null = loading
  const [apiStatus, setApiStatus] = useState("loading"); // loading | ok | error
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setApiStatus("loading");
        setApiError("");

        const [apiReps, apiDeals] = await Promise.all([fetchReps(), fetchDeals()]);

        if (!cancelled) {
          setReps(apiReps);
          setDeals(apiDeals);
          setApiStatus("ok");
        }
      } catch (err) {
        console.error("Reps API error:", err);
        if (!cancelled) {
          setReps([]);   // strict: niente demo
          setDeals([]);  // strict: niente demo
          setApiStatus("error");
          setApiError(err?.message || "Failed to load reps");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const isLoading = apiStatus === "loading" || reps === null || deals === null;

  const safeReps = reps ?? [];
  const safeDeals = deals ?? [];

  const visibleDeals = useMemo(
    () => getVisibleDeals(safeDeals, viewMode, currentUser.id),
    [safeDeals, viewMode]
  );

  const visibleReps = useMemo(() => {
    if (viewMode === "my") {
      // Nota: ids non allineati (rep_adriano vs rep_001) → filtro per name
      const meName = (currentUser?.name || "").trim().toLowerCase();
      return safeReps.filter((r) => (r.name || "").trim().toLowerCase() === meName);
    }
    return safeReps;
  }, [safeReps, viewMode]);

  const rows = useMemo(() => {
    return visibleReps.map((rep) => {
      const repName = (rep.name || "").trim().toLowerCase();

      const repDeals = visibleDeals.filter(
        (d) => (d.owner || "").trim().toLowerCase() === repName
      );

      const kpis = computeSimpleKpis(repDeals);

      return {
        id: rep.id,
        name: rep.name,
        dealsCount: kpis.count,
        pipeline: kpis.pipeline,
        forecast: kpis.forecast,
      };
    });
  }, [visibleReps, visibleDeals]);

  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Reps</h2>
        <span style={{ fontSize: 12, opacity: 0.7 }}>
          API: {isLoading ? "loading..." : apiStatus}
        </span>
      </div>

      {isLoading && <p style={{ marginTop: 12 }}>Loading...</p>}

      {!isLoading && apiStatus === "error" && (
        <p style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
          {apiError || "API error"}
        </p>
      )}

      {!isLoading && apiStatus === "ok" && (
        <table className="table">
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                Rep
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                # Deals
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                Pipeline
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                Forecast
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  <Link to={`/reps/${row.id}`} style={{ textDecoration: "none" }}>
                    {row.name}
                  </Link>
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{row.dealsCount}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>€{row.pipeline}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>€{row.forecast}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
