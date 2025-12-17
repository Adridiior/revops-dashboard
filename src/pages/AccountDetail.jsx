import { Link, useOutletContext, useParams } from "react-router-dom";
import { accounts } from "../data/accounts";
import { deals } from "../data/demoDeals";
import { currentUser } from "../data/currentUser";
import { getVisibleDeals } from "../utils/deals";
import { computeSimpleKpis } from "../utils/dealsKpis";
import { reps } from "../data/reps";
import { getRepNameById } from "../utils/reps";

export default function AccountDetail() {
  const { viewMode } = useOutletContext();
  const { id } = useParams();

  const account = accounts.find((a) => a.id === id);

  if (!account) {
    return (
      <div>
        <h2>Account Detail</h2>
        <p>Account not found.</p>
        <Link to="/accounts" style={{ textDecoration: "none" }}>
          ← Back to Accounts
        </Link>
      </div>
    );
  }

  const visibleDeals = getVisibleDeals(deals, viewMode, currentUser.id);
  const accountDeals = visibleDeals.filter((d) => d.accountId === account.id);

  const kpis = computeSimpleKpis(accountDeals);

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
        / <strong>{account.name}</strong>
      </div>

      <h2>Account Detail</h2>

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
        <p style={{ fontSize: 14 }}>No deals for this account in current mode.</p>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {accountDeals.map((d) => (
            <li key={d.id} style={{ marginBottom: 6 }}>
              <Link to={`/deals/${d.id}`} style={{ textDecoration: "none" }}>
                {d.name}
              </Link>{" "}
              — €{d.value} — {getRepNameById(reps, d.ownerId)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
