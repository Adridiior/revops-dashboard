import { Link, useOutletContext, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { currentUser } from "../data/currentUser";
import { reps } from "../data/reps";

import { getVisibleDeals } from "../utils/deals";
import { computeSimpleKpis } from "../utils/dealsKpis";
import { getRepNameById } from "../utils/reps";

import { fetchAccountById, fetchDeals } from "../app/api/revopsApi";

// Converte "owner" (stringa API) -> ownerId (id rep dashboard)
function ownerNameToRepId(ownerName) {
  if (!ownerName) return null;
  const normalized = ownerName.trim().toLowerCase();

  const rep = reps.find((r) => {
    const full = `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim().toLowerCase();
    return full === normalized || (r.name && r.name.trim().toLowerCase() === normalized);
  });

  return rep?.id ?? null;
}

function adaptDealFromApi(apiDeal) {
  return {
    id: apiDeal.id,
    name: apiDeal.name,
    value: apiDeal.value,
    stage: apiDeal.stage,
    owner: apiDeal.owner,
    ownerId: ownerNameToRepId(apiDeal.owner),
    createdAt: apiDeal.createdAt,
    updatedAt: apiDeal.updatedAt,
    accountId: apiDeal.accountId ?? null,
  };
}

export default function AccountDetail() {
  const { viewMode } = useOutletContext();
  const { id } = useParams(); // accountId (UUID)

  const [account, setAccount] = useState(null); // null = loading
  const [deals, setDeals] = useState(null); // null = loading
  const [status, setStatus] = useState("loading"); // loading | ok | error | notfound
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setStatus("loading");
        setApiError("");

        const [acc, apiDeals] = await Promise.all([
          fetchAccountById(id),           // GET /accounts/:id
          fetchDeals({ accountId: id }),  // GET /deals?accountId=...
        ]);

        const adaptedDeals = apiDeals.map(adaptDealFromApi);

        if (!cancelled) {
          setAccount(acc);
          setDeals(adaptedDeals);
          setStatus("ok");
        }
      } catch (err) {
        console.error("AccountDetail API error:", err);

        const message = err?.message || "Failed to load account";
        const isNotFound = typeof message === "string" && message.includes("404");

        if (!cancelled) {
          setStatus(isNotFound ? "notfound" : "error");
          setApiError(message);
          setAccount(null);
          setDeals([]);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // ✅ Hook sempre chiamati: se deals è null (loading), usiamo [] per evitare crash
  const safeDeals = deals ?? [];

  const visibleDeals = useMemo(
    () => getVisibleDeals(safeDeals, viewMode, currentUser.id),
    [safeDeals, viewMode]
  );

  // Qui i deals arrivano già filtrati per accountId dalla API,
  // ma teniamo un filtro di sicurezza (non costa nulla)
  const accountDeals = useMemo(
    () => visibleDeals.filter((d) => d.accountId === id),
    [visibleDeals, id]
  );

  const kpis = useMemo(() => computeSimpleKpis(accountDeals), [accountDeals]);

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link to="/accounts" style={{ textDecoration: "none" }}>
          ← Back to Accounts
        </Link>
      </div>

      <div style={{ marginBottom: 12, fontSize: 14 }}>
        <Link to="/accounts" style={{ textDecoration: "none" }}>
          Accounts
        </Link>{" "}
        / <strong>{account?.name ?? "Account"}</strong>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Account Detail</h2>
        <span style={{ fontSize: 12, opacity: 0.7 }}>
          API: {status === "loading" ? "loading..." : status}
        </span>
      </div>

      {status === "loading" && <p style={{ marginTop: 12 }}>Loading...</p>}

      {status === "notfound" && (
        <div style={{ marginTop: 12 }}>
          <p>Account not found.</p>
          {apiError && (
            <pre style={{ fontSize: 12, opacity: 0.8, whiteSpace: "pre-wrap" }}>
              {apiError}
            </pre>
          )}
        </div>
      )}

      {status === "error" && (
        <div style={{ marginTop: 12 }}>
          <p>API error while loading account.</p>
          {apiError && (
            <pre style={{ fontSize: 12, opacity: 0.8, whiteSpace: "pre-wrap" }}>
              {apiError}
            </pre>
          )}
        </div>
      )}

      {status === "ok" && account && (
        <>
          <p>
            <strong>Name:</strong> {account.name}
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

          {accountDeals.length === 0 ? (
            <p style={{ fontSize: 14 }}>
              No deals for this account in current mode.
            </p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {accountDeals.map((d) => (
                <li key={d.id} style={{ marginBottom: 6 }}>
                  <Link to={`/deals/${d.id}`} style={{ textDecoration: "none" }}>
                    {d.name}
                  </Link>{" "}
                  — €{d.value} —{" "}
                  {d.ownerId ? getRepNameById(reps, d.ownerId) : d.owner || "Unknown"}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
