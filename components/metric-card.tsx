import { Card } from "./ui";

export function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-wine-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-wine-900">{value}</p>
      {hint ? <p className="mt-1 text-sm text-wine-700">{hint}</p> : null}
    </Card>
  );
}
