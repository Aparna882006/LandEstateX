const Loader = ({ count = 8 }) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <div className="h-48 animate-pulse bg-neutral-200" />
        <div className="space-y-2 p-4">
          <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-200" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-200" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200" />
        </div>
      </div>
    ))}
  </div>
);

export default Loader;