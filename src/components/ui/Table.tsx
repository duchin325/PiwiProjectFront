export function Table({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto card">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            {headers.map(h => <th key={h} className="px-4 py-3 font-medium text-gray-600">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i} className="border-t">
              {cells.map((c, j) => <td key={j} className="px-4 py-3">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
