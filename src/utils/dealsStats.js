export function getHighValueDeals(deals) {
  return deals.filter((deal) => deal.value >= 10000);
}
