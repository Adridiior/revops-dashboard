export function sortByValueMode(rows, mode) {
  if (mode === "none") return rows;

  const copy = [...rows];
  copy.sort((a, b) => {
    if (mode === "asc") return a.value - b.value;
    return b.value - a.value; // desc
  });
  return copy;
}
