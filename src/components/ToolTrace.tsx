"use client";

import type { ToolCall } from "@/lib/types";

const LABELS: Record<ToolCall["name"], string> = {
  weather_lookup: "天气检索",
  route_options: "路线枚举",
  leave_time_planner: "出门时刻规划",
  replan_on_disruption: "延误改线",
};

export default function ToolTrace({
  tools,
  running,
}: {
  tools: ToolCall[];
  running?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-950 text-slate-100 shadow-inner">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {running ? (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-400" />
              </>
            ) : (
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-slate-500" />
            )}
          </span>
          <span className="text-sm font-medium tracking-wide">工具调用轨迹</span>
        </div>
        <span className="font-mono text-[11px] text-slate-400">
          {tools.length} steps {running ? "· running" : tools.length ? "· done" : ""}
        </span>
      </div>
      <div className="max-h-[420px] space-y-3 overflow-y-auto p-4">
        {tools.length === 0 && (
          <p className="text-sm text-slate-500">
            点击「生成唯一行动」或预设剧本后，这里会实时展示 Agent 的多步工具调用。
          </p>
        )}
        {tools.map((t, i) => (
          <div
            key={t.id}
            className="rounded-xl border border-slate-800 bg-slate-900/80 p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-500/20 font-mono text-xs text-teal-300">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-teal-200">
                  {LABELS[t.name]}
                </span>
                <code className="hidden text-[10px] text-slate-500 sm:inline">
                  {t.name}
                </code>
              </div>
              <StatusBadge status={t.status} />
            </div>
            {t.summary && (
              <p className="mb-2 text-sm text-slate-200">{t.summary}</p>
            )}
            <details className="text-[11px] text-slate-400">
              <summary className="cursor-pointer select-none hover:text-slate-300">
                查看 input / output
              </summary>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-black/40 p-2 text-[10px] leading-relaxed text-slate-400">
                {JSON.stringify({ input: t.input, output: t.output }, null, 2)}
              </pre>
            </details>
            {t.finishedAt && t.startedAt && (
              <div className="mt-2 font-mono text-[10px] text-slate-500">
                {t.finishedAt - t.startedAt}ms
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ToolCall["status"] }) {
  const map = {
    pending: "bg-slate-700 text-slate-300",
    running: "bg-amber-500/20 text-amber-300",
    done: "bg-emerald-500/20 text-emerald-300",
    error: "bg-rose-500/20 text-rose-300",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${map[status]}`}>
      {status}
    </span>
  );
}
