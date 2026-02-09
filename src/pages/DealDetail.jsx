import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { reps } from "../data/reps";
import { getRepNameById } from "../utils/reps";
import { activities as demoActivities } from "../data/activities";

import { fetchDealById } from "../app/api/revopsApi";

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

// Adatta un deal dell'API alla forma attesa dalla dashboard
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

    // ✅ NEW: includiamo l'account (se presente)
    account: apiDeal.account ?? null,
  };
}

export default function DealDetail() {
  const { id } = useParams(); // UUID string
  const dealId = id;

  const [deal, setDeal] = useState(null); // null = loading
  const [apiStatus, setApiStatus] = useState("loading"); // loading | ok | error
  const [apiError, setApiError] = useState("");

  // activities restano locali (demo), legate al dealId
  const storageKey = `revops_activities_${dealId}`;

  const [localActivities, setLocalActivities] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    return demoActivities;
  });

  const [newType, setNewType] = useState("call");
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchDealById(dealId); // GET /deals/:id
        const adapted = adaptDealFromApi(data);

        if (!cancelled) {
          setDeal(adapted);
          setApiStatus("ok");
        }
      } catch (err) {
        console.error("DealDetail API error:", err);
        if (!cancelled) {
          setApiStatus("error");
          setApiError(err?.message || "Failed to load deal");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dealId]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(localActivities));
  }, [storageKey, localActivities]);

  const isAddDisabled = newNote.trim().length === 0;

  function resetActivities() {
    setLocalActivities(demoActivities);
    setNewNote("");
    setNewType("call");
    localStorage.removeItem(storageKey);
  }

  function addActivity(e) {
    e.preventDefault();

    const note = newNote.trim();
    if (!note) return;

    const today = new Date().toISOString().slice(0, 10);

    const newActivity = {
      id: `local_${Date.now()}`,
      dealId: dealId, // string UUID
      type: newType,
      note: note,
      date: today,
    };

    setLocalActivities((prev) => [newActivity, ...prev]);
    setNewNote("");
  }

  const dealActivities = useMemo(() => {
    return localActivities
      .filter((a) => String(a.dealId) === String(dealId))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [localActivities, dealId]);

  // Loading
  if (apiStatus === "loading") {
    return (
      <div>
        <div style={{ marginBottom: 12 }}>
          <Link to="/deals" style={{ textDecoration: "none" }}>
            ← Back to Deals
          </Link>
        </div>
        <p>Loading deal...</p>
      </div>
    );
  }

  // Error
  if (apiStatus === "error" || !deal) {
    return (
      <div>
        <h2>Deal Detail</h2>
        <p>Deal not found or API error.</p>
        {apiError && (
          <pre style={{ fontSize: 12, opacity: 0.8, whiteSpace: "pre-wrap" }}>
            {apiError}
          </pre>
        )}
        <Link to="/deals" style={{ textDecoration: "none" }}>
          ← Back to Deals
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link to="/deals" style={{ textDecoration: "none" }}>
          ← Back to Deals
        </Link>
      </div>

      <div style={{ marginBottom: 12, fontSize: 14 }}>
        <Link to="/deals" style={{ textDecoration: "none" }}>
          Deals
        </Link>{" "}
        / <strong>{deal.name}</strong>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Deal Detail</h2>
        <span style={{ fontSize: 12, opacity: 0.7 }}>API: {apiStatus}</span>
      </div>

      <p>
        <strong>Name:</strong> {deal.name}
      </p>
      <p>
        <strong>Value:</strong> €{deal.value}
      </p>
      <p>
        <strong>Stage:</strong> {deal.stage}
      </p>
      <p>
        <strong>Owner:</strong>{" "}
        {deal.ownerId
          ? getRepNameById(reps, deal.ownerId)
          : deal.owner || "Unknown"}
      </p>

      {/* ✅ NEW: Account link */}
      <p>
        <strong>Account:</strong>{" "}
        {deal.account ? (
          <Link to={`/accounts/${deal.account.id}`} style={{ textDecoration: "none" }}>
            {deal.account.name}
          </Link>
        ) : (
          <span style={{ opacity: 0.7 }}>—</span>
        )}
      </p>

      <p>
        <strong>Forecast:</strong> €{Math.round(deal.value * 0.5)}
      </p>

      <hr style={{ margin: "16px 0" }} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <h3 style={{ margin: 0 }}>Activities</h3>
        <button type="button" onClick={resetActivities}>
          Reset demo activities
        </button>
      </div>

      <form onSubmit={addActivity} style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select value={newType} onChange={(e) => setNewType(e.target.value)}>
            <option value="call">call</option>
            <option value="email">email</option>
            <option value="meeting">meeting</option>
            <option value="task">task</option>
          </select>

          <input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            style={{ minWidth: 240, padding: 6 }}
          />

          <button
            type="submit"
            disabled={isAddDisabled}
            style={{
              opacity: isAddDisabled ? 0.5 : 1,
              cursor: isAddDisabled ? "not-allowed" : "pointer",
            }}
          >
            Add
          </button>
        </div>
      </form>

      {dealActivities.length === 0 ? (
        <p style={{ fontSize: 14 }}>No activities for this deal yet.</p>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {dealActivities.map((a) => (
            <li key={a.id} style={{ marginBottom: 6 }}>
              <strong>{a.date}</strong> — {a.type}: {a.note}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
