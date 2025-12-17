export function computeDealsKpis(deals) {
  const count = deals.length;

  const pipelineValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  const forecastValue = deals.reduce(
    (sum, deal) => sum + Math.round(deal.value * 0.5),
    0
  );

  return { count, pipelineValue, forecastValue };
}
