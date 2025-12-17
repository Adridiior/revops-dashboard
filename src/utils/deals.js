export function getVisibleDeals(allDeals, viewMode, currentUserId) {
  if (viewMode === "my") {
    return allDeals.filter((deal) => deal.ownerId === currentUserId);
  }
  return allDeals;
}
