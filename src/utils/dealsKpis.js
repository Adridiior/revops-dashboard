export function computeSimpleKpis(deals) {
  const count = deals.length;

  const pipeline = deals.reduce((sum, d) => sum + d.value, 0);
  const forecast = deals.reduce((sum, d) => sum + Math.round(d.value * 0.5), 0);

  return { count, pipeline, forecast };
}
