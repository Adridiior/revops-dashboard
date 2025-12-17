import { Link, useOutletContext } from "react-router-dom";
import { reps } from "../data/reps";
import { deals } from "../data/demoDeals";
import { currentUser } from "../data/currentUser";
import { getVisibleDeals } from "../utils/deals";
import { computeSimpleKpis } from "../utils/dealsKpis";

export default function Reps() {
  const { viewMode } = useOutletContext();

  const visibleDeals = getVisibleDeals(deals, viewMode, currentUser.id);

  const visibleReps = viewMode === "my"
    ? reps.filter((r) => r.id === currentUser.id)
    : reps;


  const rows = visibleReps.map((rep) => {
    const repDeals = visibleDeals.filter((d) => d.ownerId === rep.id);
    const kpis = computeSimpleKpis(repDeals);

    return {
      id: rep.id,
      name: rep.name,
      dealsCount: kpis.count,
      pipeline: kpis.pipeline,
      forecast: kpis.forecast,
    };
  });

  return (
    <div>
      <h2>Reps</h2>

      <table className="table">
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Rep</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}># Deals</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Pipeline</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Forecast</th>
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
    </div>
  );
}
