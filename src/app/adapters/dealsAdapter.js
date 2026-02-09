import { reps } from "../../data/reps";

// Converte "owner" (stringa dall'API) -> ownerId (id rep dashboard)
export function ownerNameToRepId(ownerName) {
  if (!ownerName) return null;

  const normalized = ownerName.trim().toLowerCase();

  const rep = reps.find((r) => {
    const full = `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim().toLowerCase();
    return (
      full === normalized ||
      (r.name && r.name.trim().toLowerCase() === normalized)
    );
  });

  return rep?.id ?? null;
}

export function adaptDealFromApi(apiDeal) {
  return {
    id: apiDeal.id,
    name: apiDeal.name,
    value: apiDeal.value,
    stage: apiDeal.stage,
    ownerId: ownerNameToRepId(apiDeal.owner),
    createdAt: apiDeal.createdAt,
    updatedAt: apiDeal.updatedAt,
    accountId: apiDeal.accountId ?? null,
  };
}
