export default function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-mist bg-white p-10 text-center">
      <div className="text-lg font-semibold">{title}</div>
      <div className="max-w-md text-base text-slate">{description}</div>
      {action}
    </div>
  );
}
