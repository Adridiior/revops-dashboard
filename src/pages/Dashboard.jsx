import { useOutletContext } from "react-router-dom";
import { deals } from "../data/demoDeals";
import { currentUser } from "../data/currentUser";
import { getVisibleDeals } from "../utils/deals";
import { getHighValueDeals } from "../utils/dealsStats";
import { computeDealsKpis } from "../utils/kpis";

export default function Dashboard() {
  const { viewMode } = useOutletContext();

  const filteredDeals = getVisibleDeals(deals, viewMode, currentUser.id);
  const highValueDeals = getHighValueDeals(filteredDeals);

  const kpis = computeDealsKpis(highValueDeals);

return (
  <div>
    <h2>Dashboard</h2>

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