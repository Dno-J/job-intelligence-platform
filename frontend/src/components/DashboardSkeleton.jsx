import Skeleton from "./Skeleton";

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Hero Skeleton */}
        <section className="mb-8">
          <div className="rounded-3xl border border-gray-800 bg-gray-900/70 p-8 md:p-10">
            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">
              <div className="space-y-4 flex-1">
                <Skeleton className="h-9 w-44 rounded-full" />
                <Skeleton className="h-10 w-full max-w-xl rounded-xl" />
                <Skeleton className="h-5 w-full max-w-2xl rounded-lg" />
                <Skeleton className="h-5 w-full max-w-lg rounded-lg" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Skeleton className="h-12 w-36 rounded-xl" />
                <Skeleton className="h-12 w-24 rounded-xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Summary Cards Skeleton */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </section>

        {/* Insight Note Skeleton */}
        <section className="mb-8">
          <Skeleton className="h-20 rounded-2xl" />
        </section>

        {/* Charts Skeleton */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <Skeleton className="h-[420px] rounded-2xl" />
          <Skeleton className="h-[420px] rounded-2xl" />
        </section>

        <section className="mb-8">
          <Skeleton className="h-[420px] rounded-2xl" />
        </section>

        {/* Bottom Summary Skeleton */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </section>
      </div>
    </div>
  );
}

export default DashboardSkeleton;