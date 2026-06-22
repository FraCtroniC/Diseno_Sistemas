export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-[1.4rem] border border-slate-200 bg-white p-5">
      <div className="h-3 w-16 rounded-full bg-slate-200" />
      <div className="mt-3 h-5 w-3/4 rounded bg-slate-200" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-5/6 rounded bg-slate-100" />
      </div>
      <div className="mt-4 h-3 w-1/3 rounded bg-slate-100" />
    </div>
  )
}

export function SkeletonLine() {
  return (
    <div className="animate-pulse flex items-center gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3">
      <div className="h-3 w-1/4 rounded bg-slate-200" />
      <div className="h-3 w-1/3 rounded bg-slate-100" />
      <div className="ml-auto h-6 w-16 rounded-full bg-slate-200" />
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4">
      <div className="h-3 w-1/2 rounded bg-slate-200" />
      <div className="mt-3 h-8 w-12 rounded bg-slate-100" />
      <div className="mt-2 h-3 w-3/4 rounded bg-slate-100" />
    </div>
  )
}
