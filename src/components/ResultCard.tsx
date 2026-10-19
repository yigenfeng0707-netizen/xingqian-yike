"use client";

import type { Recommendation } from "@/lib/types";

export default function ResultCard({
  recommendation,
  narrative,
  engine,
  onReplan,
  replanLoading,
}: {
  recommendation: Recommendation;
  narrative: string;
  engine: "mock" | "llm";
  onReplan: () => void;
  replanLoading?: boolean;
}) {
  const r = recommendation;
  return (
    <div className="overflow-hidden rounded-2xl border border-teal-200/80 bg-gradient-to-br from-white via-teal-50/40 to-cyan-50 shadow-lg shadow-teal-500/5">
      <div className="border-b border-teal-100/80 bg-white/60 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-teal-700">
              唯一推荐行动
            </p>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {r.leaveBy} 出门
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              预计 {r.arriveEst} 抵达 · {r.modeChain}
            </p>
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-white">
            engine · {engine}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">{narrative}</p>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <div className="rounded-xl bg-white/80 p-4 ring-1 ring-slate-200/80">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            主方案
          </h4>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {r.primaryRoute.label}
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
            <li>时长约 {r.primaryRoute.durationMin} 分钟</li>
            <li>换乘 {r.primaryRoute.transfers} · 步行 {r.primaryRoute.walkMin} 分钟</li>
            <li>费用约 ¥{r.primaryRoute.costYuan}</li>
            <li>可靠度 {(r.primaryRoute.reliability * 100).toFixed(0)}%</li>
          </ul>
          <ol className="mt-3 list-decimal space-y-1 pl-4 text-xs text-slate-500">
            {r.primaryRoute.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-white/80 p-4 ring-1 ring-slate-200/80">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              为什么是这一条
            </h4>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {r.why.map((w) => (
                <li key={w} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-amber-50/80 p-4 ring-1 ring-amber-200/80">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-800">
              备选
            </h4>
            <p className="mt-1 text-sm text-amber-950">
              {r.backup.leaveBy} · {r.backup.modeChain}
            </p>
            <p className="mt-1 text-xs text-amber-800/80">{r.backup.note}</p>
          </div>
        </div>
      </div>

      {r.disruptionNote && (
        <div className="mx-5 mb-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          <span className="font-semibold">改线说明：</span>
          {r.disruptionNote}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-teal-100/80 bg-white/50 px-5 py-4">
        <button
          type="button"
          onClick={onReplan}
          disabled={replanLoading}
          className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {replanLoading ? "改线中…" : "突发延误 +15 分钟"}
        </button>
        <p className="text-xs text-slate-500">
          模拟路上突发延误，触发 <code className="rounded bg-slate-100 px-1">replan_on_disruption</code>
        </p>
      </div>
    </div>
  );
}
