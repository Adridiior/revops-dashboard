import { Link, useOutletContext } from "react-router-dom";
import { accounts } from "../data/accounts";
import { deals } from "../data/demoDeals";
import { currentUser } from "../data/currentUser";
import { getVisibleDeals } from "../utils/deals";
import { computeSimpleKpis } from "../utils/dealsKpis";

export default function Accounts() {
  const { viewMode } = useOutletContext();

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
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Account</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}># Deals</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Pipeline</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Forecast</th>
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
