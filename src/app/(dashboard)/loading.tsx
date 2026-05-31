export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-40 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-56 rounded bg-gray-100" />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-white p-5"
          >
            <div className="h-4 w-24 rounded bg-gray-100" />
            <div className="mt-3 h-7 w-20 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      <div className="mt-8 h-64 rounded-lg border border-gray-200 bg-white" />
    </div>
  );
}
