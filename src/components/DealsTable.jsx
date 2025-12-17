import { Link } from "react-router-dom";

export default function DealsTable({ rows, sortByValue, onToggleSort }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
            Deal
          </th>

          <th
            onClick={onToggleSort}
            style={{
              textAlign: "left",
              borderBottom: "1px solid #ddd",
              padding: 8,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            Value {sortByValue === "asc" ? "↑" : sortByValue === "desc" ? "↓" : ""}
          </th>

          <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
            Rep
          </th>

          <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
            Forecast
          </th>
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                <Link to={`/deals/${row.id}`} style={{ textDecoration: "none" }}>
                    {row.name}
                </Link>
            </td>
            <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>€{row.value}</td>
            <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{row.repName}</td>
            <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>€{row.forecast}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
