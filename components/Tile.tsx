// A reusable dashboard tile.
// Its props are typed, so the editor warns us if a value is missing or has the wrong type.
type TileProps = {
  title: string;
  value: number;
  unit: string;
};

export default function Tile({ title, value, unit }: TileProps) {
  // Only percentages have a meaningful "above 80" threshold, not ms or MB/s.
  const critical = unit === "%" && value > 80;

  return (
    <div className="rounded-2xl border-l-4 border-sky-500 bg-slate-800 p-6 shadow-lg">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h3>
      <p className={`mt-4 text-4xl font-bold ${critical ? "text-red-400" : "text-white"}`}>
        {value} <span className="text-lg font-normal text-slate-400">{unit}</span>
      </p>
    </div>
  );
}
