import { Link, useOutletContext, useParams } from "react-router-dom";
import { reps } from "../data/reps";
import { deals } from "../data/demoDeals";
import { currentUser } from "../data/currentUser";
import { getVisibleDeals } from "../utils/deals";
import { computeSimpleKpis } from "../utils/dealsKpis";

export default function RepDetail() {
  const { viewMode } = useOutletContext();
  const { id } = useParams();

  const rep = reps.find((r) => r.id === id);

  if (!rep) {
    return (
      <div>
        <h2>Rep Detail</h2>
        <p>Rep not found.</p>
        <Link to="/reps" style={{ textDecoration: "none" }}>
          ← Back to Reps
        </Link>
      </div>
    );
  }

  const visibleDeals = getVisibleDeals(deals, viewMode, currentUser.id);
  const repDeals = visibleDeals.filter((d) => d.ownerId === rep.id);

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

      <h2>Rep Detail</h2>

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
