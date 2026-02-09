import { Link, useOutletContext, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { currentUser } from "../data/currentUser";
import { getVisibleDeals } from "../utils/deals";
import { computeSimpleKpis } from "../utils/dealsKpis";

import { fetchRepById, fetchDeals } from "../app/api/revopsApi";

export default function RepDetail() {
  const { viewMode } = useOutletContext();
  const { id } = useParams();

  const [rep, setRep] = useState(null);     // null = loading
  const [deals, setDeals] = useState(null); // null = loading
  const [apiStatus, setApiStatus] = useState("loading"); // loading | ok | error
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setApiStatus("loading");
        setApiError("");

        const [apiRep, apiDeals] = await Promise.all([
          fetchRepById(id),
          fetchDeals(),
        ]);

        if (!cancelled) {
          setRep(apiRep);
          setDeals(apiDeals);
          setApiStatus("ok");
        }
      } catch (err) {
        console.error("RepDetail API error:", err);
        if (!cancelled) {
          setRep(null);
          setDeals([]);
          setApiStatus("error");
          setApiError(err?.message || "Failed to load rep");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const isLoading = apiStatus === "loading" || rep === null || deals === null;

  if (isLoading) {
    return (
      <div>
        <div style={{ marginBottom: 12 }}>
          <Link to="/reps" style={{ textDecoration: "none" }}>
            ← Back to Reps
          </Link>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  if (apiStatus === "error") {
    return (
      <div>
        <h2>Rep Detail</h2>
        <p>API error while loading rep.</p>
        {apiError && (
          <p style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
            {apiError}
          </p>
        )}
        <Link to="/reps" style={{ textDecoration: "none" }}>
          ← Back to Reps
        </Link>
      </div>
    );
  }

  // apiStatus === "ok" qui
  const safeDeals = deals ?? [];
  const visibleDeals = getVisibleDeals(safeDeals, viewMode, currentUser.id);

  const repName = (rep.name || "").trim().toLowerCase();
  const repDeals = visibleDeals.filter(
    (d) => (d.owner || "").trim().toLowerCase() === repName
  );

  const kpis = computeSimpleKpis(repDeals);

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link to="/reps" style={{ textDecoration: "none" }}>
          ← Back to Reps
        </Link>
      </div>

      <div style={{ marginBottom: 12, fontSize: 14 }}>
        <Link to="/reps" style={{ textDecoration: "none" }}>
          Reps
        </Link>{" "}
        / <strong>{rep.name}</strong>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Rep Detail</h2>
        <span style={{ fontSize: 12, opacity: 0.7 }}>API: {apiStatus}</span>
      </div>

      <p>
        <strong>Name:</strong> {rep.name}
      </p>

      <hr style={{ margin: "16px 0" }} />

      <h3 style={{ marginBottom: 8 }}>KPI</h3>
      <ul>
        <li>
          <strong># Deals:</strong> {kpis.count}
        </li>
        <li>
          <strong>Pipeline:</strong> €{kpis.pipeline}
        </li>
        <li>
          <strong>Forecast:</strong> €{kpis.forecast}
        </li>
      </ul>

      <hr style={{ margin: "16px 0" }} />

      <h3 style={{ marginBottom: 8 }}>Deals</h3>

      {repDeals.length === 0 ? (
        <p style={{ fontSize: 14 }}>No deals for this rep in current mode.</p>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {repDeals.map((d) => (
            <li key={d.id} style={{ marginBottom: 6 }}>
              <Link to={`/deals/${d.id}`} style={{ textDecoration: "none" }}>
                {d.name}
              </Link>{" "}
              — €{d.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
