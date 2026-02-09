import { useOutletContext } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { deals as demoDeals } from "../data/demoDeals";
import { currentUser } from "../data/currentUser";
import { reps } from "../data/reps";

import { getVisibleDeals } from "../utils/deals";
import { getRepNameById } from "../utils/reps";
import { sortByValueMode } from "../utils/sort";

import DealsTable from "../components/DealsTable";
import { fetchDeals } from "../app/api/revopsApi";

// Converte "owner" (stringa dall'API) -> ownerId (id rep dashboard)
function ownerNameToRepId(ownerName) {
  if (!ownerName) return null;

  const normalized = ownerName.trim().toLowerCase();

  const rep = reps.find((r) => {
    const full = `${r.firstName ?? ""} ${r.lastName ?? ""}`
      .trim()
      .toLowerCase();
    return (
      full === normalized || (r.name && r.name.trim().toLowerCase() === normalized)
    );
  });

  return rep?.id ?? null;
}

function adaptDealFromApi(apiDeal) {
  return {
    id: apiDeal.id,
    name: apiDeal.name,
    value: apiDeal.value,
    stage: apiDeal.stage,
    owner: apiDeal.owner, // utile come fallback label
    ownerId: ownerNameToRepId(apiDeal.owner),
    createdAt: apiDeal.createdAt,
    updatedAt: apiDeal.updatedAt,
    accountId: apiDeal.accountId ?? null,
  };
}

export default function Deals() {
  const { viewMode } = useOutletContext();

  const [sortByValue, setSortByValue] = useState("none"); // "none" | "desc" | "asc"
  const [deals, setDeals] = useState(null); // null = loading
  const [apiStatus, setApiStatus] = useState("loading"); // loading | ok | error
  const [apiError, setApiError] = useState("");

  function toggleSortByValue() {
    setSortByValue((prev) => {
      if (prev === "none") return "desc";
      if (prev === "desc") return "asc";
      return "none";
    });
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setApiStatus("loading");
        setApiError("");

        const data = await fetchDeals();
        const adapted = data.map(adaptDealFromApi);

        if (!cancelled) {
          setDeals(adapted);
          setApiStatus("ok");
        }
      } catch (err) {
        console.error("Deals API error, using demo data:", err);
        if (!cancelled) {
          setApiStatus("error");
          setApiError(err?.message || "Failed to load deals");
          setDeals(demoDeals); // fallback: niente pagina vuota
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ se deals è null, non calcolare nulla: eviti crash
  const filteredDeals = useMemo(() => {
    if (!Array.isArray(deals)) return [];
    return getVisibleDeals(deals, viewMode, currentUser.id);
  }, [deals, viewMode]);

  // Per ora NON applichiamo filtro ≥10k qui: vogliamo lista completa nella pagina Deals
  const rows = useMemo(() => {
    return filteredDeals.map((deal) => ({
      id: deal.id,
      name: deal.name,
      value: deal.value,
      repName:
        viewMode === "team"
          ? deal.ownerId
            ? getRepNameById(reps, deal.ownerId)
            : deal.owner || "Unknown"
          : "Me",
      forecast: Math.round(deal.value * 0.5),
    }));
  }, [filteredDeals, viewMode]);

  const sortedRows = sortByValueMode(rows, sortByValue);

  // ✅ schermata "loading" pulita (niente flash di dati vecchi)
  if (deals === null) {
    return (
      <div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Deals</h2>
          <span style={{ fontSize: 12, opacity: 0.7 }}>API: loading...</span>
        </div>
        <p style={{ marginTop: 12, fontSize: 14, opacity: 0.8 }}>
          Loading deals...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Deals</h2>
        <span style={{ fontSize: 12, opacity: 0.7 }}>
          API: {apiStatus}
          {apiStatus === "error" && apiError ? ` — ${apiError}` : ""}
        </span>
      </div>

      <DealsTable
        rows={sortedRows}
        sortByValue={sortByValue}
        onToggleSort={toggleSortByValue}
      />
    </div>
  );
}
