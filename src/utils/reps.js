export function getRepNameById(reps, repId) {
  const rep = reps.find((r) => r.id === repId);
  return rep ? rep.name : "Unknown";
}
