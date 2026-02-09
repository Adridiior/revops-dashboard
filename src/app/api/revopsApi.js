import { apiGet } from "../../utils/api";

export async function fetchDeals(filters = {}) {
  const params = new URLSearchParams();

  if (filters.stage) params.set("stage", filters.stage);
  if (filters.owner) params.set("owner", filters.owner);
  if (filters.accountId) params.set("accountId", filters.accountId);

  const qs = params.toString();
  return apiGet(`/deals${qs ? `?${qs}` : ""}`);
}

export async function fetchDealById(id) {
  return apiGet(`/deals/${id}`);
}

export async function fetchAccounts() {
  return apiGet(`/accounts`);
}

export async function fetchAccountById(id) {
  return apiGet(`/accounts/${id}`);
}

export async function fetchReps() {
  return apiGet(`/reps`);
}

export async function fetchRepById(id) {
  return apiGet(`/reps/${id}`);
}
