import { Link, useOutletContext } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { currentUser } from "../data/currentUser";

import { getVisibleDeals } from "../utils/deals";
import { computeSimpleKpis } from "../utils/dealsKpis";

import { fetchAccounts, fetchDeals } from "../app/api/revopsApi";

export default function Accounts() {
  const { viewMode } = useOutletContext();

  const [accounts, setAccounts] = useState(null); // null = loading
  const [deals, setDeals] = useState(null); // null = loading
  const [apiStatus, setApiStatus] = useState("loading"); // loading | ok | error
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [accData, dealData] = await Promise.all([
          fetchAccounts(), // GET /accounts
          fetchDeals(),    // GET /deals
        ]);

        if (!cancelled) {
          setAccounts(accData);
          setDeals(dealData);
          setApiStatus("ok");
        }
      } catch (err) {
        console.error("Accounts API error:", err);
        if (!cancelled) {
          setApiStatus("error");
          setApiError(err?.message || "Failed to load accounts");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // loading
  if (apiStatus === "loading" || !accounts || !deals) {
    return (
      <div>
        <h2>Accounts</h2>
        <p>Loading accounts...</p>
      </div>
    );
  }

  // error
  if (apiStatus === "error") {
    return (
      <div>
        <h2>Accounts</h2>
        <p>API error.</p>
        {apiError && (
          <pre style={{ fontSize: 12, opacity: 0.8, whiteSpace: "pre-wrap" }}>
            {apiError}
          </pre>
        )}
      </div>
    );
  }

  // KPI per account usando deals (filtrati per viewMode)
  const visibleDeals = getVisibleDeals(deals, viewMode, currentUser.id);

  const rows = accounts
    .map((acc) => {
      const accDeals = visibleDeals.filter((d) => d.accountId === acc.id);
      const kpis = computeSimpleKpis(accDeals);

      return {
        id: acc.id,
        name: acc.name,
        dealsCount: kpis.count,
        pipeline: kpis.pipeline,
        forecast: kpis.forecast,
      };
    })
    .filter((row) => (viewMode === "my" ? row.dealsCount > 0 : true));

  return (
    <div>
      <h2>Accounts</h2>

      <table className="table">
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
              Account
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
                <Link to={`/accounts/${row.id}`} style={{ textDecoration: "none" }}>
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

      {rows.length === 0 && (
        <p style={{ marginTop: 12, fontSize: 14 }}>No accounts in current mode.</p>
      )}
    </div>
  );
}
