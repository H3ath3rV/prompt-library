export default function TagPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-mist bg-white px-2 py-0.5 text-sm text-slate">
      {label}
    </span>
  );
}
