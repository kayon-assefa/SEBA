// Feature #2 - skeleton loaders instead of a spinner
export default function SkeletonLoader() {
  return (
    <div className="divide-y">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 p-4">
          <div className="h-12 w-12 rounded-lg bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-gray-200" />
            <div className="h-3 w-1/5 rounded bg-gray-100" />
          </div>
          <div className="h-3 w-16 rounded bg-gray-200" />
          <div className="h-3 w-10 rounded bg-gray-200" />
          <div className="h-6 w-16 rounded-full bg-gray-200" />
        </div>
      ))}
    </div>
  );
}
