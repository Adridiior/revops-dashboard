import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { currentUser } from "../data/currentUser";
import { reps } from "../data/reps";

import { getVisibleDeals } from "../utils/deals";
import { getHighValueDeals } from "../utils/dealsStats";
import { computeDealsKpis } from "../utils/kpis";

import { fetchDeals } from "../app/api/revopsApi";

// Converte "owner" (stringa dall'API) -> ownerId (id rep dashboard)
function ownerNameToRepId(ownerName) {
  if (!ownerName) return null;

  const normalized = ownerName.trim().toLowerCase();

  const rep = reps.find((r) => {
    const full = `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim().toLowerCase();
    return full === normalized || (r.name && r.name.trim().toLowerCase() === normalized);
  });

  return rep?.id ?? null;
}

// Adatta un deal dell'API alla forma attesa dalla dashboard
function adaptDealFromApi(apiDeal) {
  return {
    id: apiDeal.id,
    name: apiDeal.name,
    value: apiDeal.value,
    stage: apiDeal.stage,
    ownerId: ownerNameToRepId(apiDeal.owner),
    createdAt: apiDeal.createdAt,
    updatedAt: apiDeal.updatedAt,
    accountId: apiDeal.accountId ?? null,
  };
}

export default function Dashboard() {
  const { viewMode } = useOutletContext();

  // null = loading, array = loaded
  const [deals, setDeals] = useState(null);
  const [apiStatus, setApiStatus] = useState("loading"); // loading | ok | error
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchDeals(); // GET /deals
        const adapted = data.map(adaptDealFromApi);

        if (!cancelled) {
          setDeals(adapted);
          setApiStatus("ok");
          setApiError("");
        }
      } catch (err) {
        console.error("Dashboard API error:", err);
        if (!cancelled) {
          setDeals([]); // niente demo fallback
          setApiStatus("error");
          setApiError(err?.message || "API error");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ Hooks SEMPRE chiamati (anche in loading/error)
  const safeDeals = deals ?? [];

  const filteredDeals = useMemo(() => {
    return getVisibleDeals(safeDeals, viewMode, currentUser.id);
  }, [safeDeals, viewMode]);

  const highValueDeals = useMemo(() => {
    return getHighValueDeals(filteredDeals);
  }, [filteredDeals]);

  const kpis = useMemo(() => {
    return computeDealsKpis(highValueDeals);
  }, [highValueDeals]);

  // ✅ Ora possiamo fare i return condizionali (senza rompere l'ordine degli hooks)
  if (deals === null) {
    return (
      <div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Dashboard</h2>
          <span style={{ fontSize: 12, opacity: 0.7 }}>API: loading...</span>
        </div>

        <p style={{ marginTop: 16, opacity: 0.7 }}>Loading data…</p>
      </div>
    );
  }

  if (apiStatus === "error") {
    return (
      <div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Dashboard</h2>
          <span style={{ fontSize: 12, opacity: 0.7 }}>API: error</span>
        </div>

        <div style={{ marginTop: 16 }}>
          <p style={{ margin: 0 }}>
            <strong>API error:</strong> {apiError}
          </p>
          <p style={{ marginTop: 8, opacity: 0.8 }}>
            Make sure <code>revops-api</code> is running on{" "}
            <code>{import.meta.env.VITE_API_BASE_URL}</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <span style={{ fontSize: 12, opacity: 0.7 }}>API: ok</span>
      </div>

      <div className="kpiRow">
        <div className="kpiCard">
          <div className="label">Deals (≥ 10k)</div>
          <div className="value">{kpis.count}</div>
        </div>

        <div className="kpiCard">
          <div className="label">Pipeline Value</div>
          <div className="value">€{kpis.pipelineValue}</div>
        </div>

        <div className="kpiCard">
          <div className="label">Forecast</div>
          <div className="value">€{kpis.forecastValue}</div>
        </div>
      </div>
    </div>
  );
}
