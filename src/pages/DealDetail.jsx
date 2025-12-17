import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { deals } from "../data/demoDeals";
import { reps } from "../data/reps";
import { getRepNameById } from "../utils/reps";
import { activities } from "../data/activities";

export default function DealDetail() {
  const { id } = useParams();
  const dealId = Number(id);
  const deal = deals.find((d) => d.id === dealId);

  const storageKey = `revops_activities_${dealId}`;

  const [localActivities, setLocalActivities] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    return activities;
  });

  const [newType, setNewType] = useState("call");
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(localActivities));
  }, [storageKey, localActivities]);

  const isAddDisabled = newNote.trim().length === 0;

  function resetActivities() {
  // rimette le activities “base” (quelle del file)
  setLocalActivities(activities);
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
      dealId: dealId,
      type: newType,
      note: note,
      date: today,
    };

    setLocalActivities((prev) => [newActivity, ...prev]);
    setNewNote("");
  }

  if (!deal) {
    return (
      <div>
        <h2>Deal Detail</h2>
        <p>Deal non trovato.</p>
        <Link to="/deals" style={{ textDecoration: "none" }}>
          ← Back to Deals
        </Link>
      </div>
    );
  }

  const dealActivities = localActivities
    .filter((a) => a.dealId === dealId)
    .sort((a, b) => b.date.localeCompare(a.date));

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

      <h2>Deal Detail</h2>

      <p>
        <strong>Name:</strong> {deal.name}
      </p>
      <p>
        <strong>Value:</strong> €{deal.value}
      </p>
      <p>
        <strong>Owner:</strong> {getRepNameById(reps, deal.ownerId)} ({deal.ownerId})
      </p>
      <p>
        <strong>Forecast:</strong> €{Math.round(deal.value * 0.5)}
      </p>

      <hr style={{ margin: "16px 0" }} />

      <div
        style={{
          display:"flex",
          alignItems:"center",
          justifyContent:"space-between",
          marginBottom:8,
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
