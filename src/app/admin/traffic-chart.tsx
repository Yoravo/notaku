interface DailyTrafficPoint {
  dateKey: string;
  label: string;
  views: number;
  uniques: number;
}

export function TrafficBarChart({ data }: { data: DailyTrafficPoint[] }) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.views, d.uniques)), 1);

  return (
    <div className="space-y-4">
      {/* Legend & Stats */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
            <span className="text-slate-600 font-medium">Pageviews</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
            <span className="text-slate-600 font-medium">Pengunjung Unik</span>
          </div>
        </div>
        <span className="text-slate-400">14 Hari Terakhir</span>
      </div>

      {/* Chart Canvas */}
      <div className="h-44 flex items-end gap-1 sm:gap-2 pt-6 pb-2 px-1 border-b border-slate-200">
        {data.map((item) => {
          const viewsHeightPercent = Math.max((item.views / maxVal) * 100, item.views > 0 ? 6 : 0);
          const uniquesHeightPercent = Math.max((item.uniques / maxVal) * 100, item.uniques > 0 ? 6 : 0);

          return (
            <div
              key={item.dateKey}
              className="flex-1 flex flex-col items-center justify-end h-full group relative"
            >
              {/* Tooltip Hover */}
              <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap pointer-events-none">
                <span className="font-bold">{item.label}</span>
                <span>
                  {item.views} views · {item.uniques} unik
                </span>
                <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mb-1 mt-0.5" />
              </div>

              {/* Bars side-by-side */}
              <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-full">
                {/* Views Bar */}
                <div
                  style={{ height: `${viewsHeightPercent}%` }}
                  className="w-full max-w-[12px] bg-blue-500/80 hover:bg-blue-600 rounded-t transition-all"
                />
                {/* Uniques Bar */}
                <div
                  style={{ height: `${uniquesHeightPercent}%` }}
                  className="w-full max-w-[12px] bg-emerald-500/80 hover:bg-emerald-600 rounded-t transition-all"
                />
              </div>

              {/* X-axis Label */}
              <span className="text-[10px] text-slate-400 mt-2 font-mono truncate max-w-[28px] text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
