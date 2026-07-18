export function RouteSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="mx-auto w-full max-w-[1180px] animate-pulse px-5 py-14 sm:px-8 lg:px-0">
      <div className="h-4 w-28 rounded-full bg-[#e8e8e8]" />
      <div className="mt-5 h-12 w-72 max-w-full rounded-xl bg-[#e4e4e4]" />
      <div className="mt-4 h-6 w-[32rem] max-w-full rounded-lg bg-[#ececec]" />
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-[#ececec] bg-white">
            <div className="aspect-[16/10] bg-[#ececec]" />
            <div className="space-y-3 p-5">
              <div className="h-5 w-3/4 rounded bg-[#e8e8e8]" />
              <div className="h-4 w-full rounded bg-[#efefef]" />
              <div className="h-10 w-full rounded-xl bg-[#e8e8e8]" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">화면을 불러오는 중입니다.</span>
    </div>
  );
}
