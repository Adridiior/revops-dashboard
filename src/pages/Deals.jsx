import { useOutletContext } from "react-router-dom";
import { useState } from "react";

import { deals } from "../data/demoDeals";
import { currentUser } from "../data/currentUser";
import { reps } from "../data/reps";

import { getVisibleDeals } from "../utils/deals";
import { getHighValueDeals } from "../utils/dealsStats";
import { getRepNameById } from "../utils/reps";
import { sortByValueMode } from "../utils/sort";

import DealsTable from "../components/DealsTable";

export default function Deals() {
  const { viewMode } = useOutletContext();

  const [sortByValue, setSortByValue] = useState("none"); // "none" | "desc" | "asc"

  function toggleSortByValue() {
    setSortByValue((prev) => {
      if (prev === "none") return "desc";
      if (prev === "desc") return "asc";
      return "none";
    });
  }

  const filteredDeals = getVisibleDeals(deals, viewMode, currentUser.id);
  const highValueDeals = getHighValueDeals(filteredDeals);

  const rows = highValueDeals.map((deal) => ({
    id: deal.id,
    name: deal.name,
    value: deal.value,
    repName: viewMode === "team" ? getRepNameById(reps, deal.ownerId) : "Me",
    forecast: Math.round(deal.value * 0.5),
  }));

  const sortedRows = sortByValueMode(rows, sortByValue);

  return (
    <div>
      <h2>Deals</h2>

      <DealsTable
        rows={sortedRows}
        sortByValue={sortByValue}
        onToggleSort={toggleSortByValue}
      />
    </div>
  );
}
