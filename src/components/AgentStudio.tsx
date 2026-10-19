"use client";

import { useCallback, useState } from "react";
import type { PlanResponse, TravelMode, ToolCall } from "@/lib/types";
import { PRESETS, PLACES } from "@/lib/mocks/beijing";
import {
  runPlan as executePlan,
  runReplan as executeReplan,
} from "@/lib/agent/planner";
import ToolTrace from "./ToolTrace";
import ResultCard from "./ResultCard";

const ALL_MODES: TravelMode[] = ["地铁", "公交", "骑行", "打车"];

export default function AgentStudio() {
  const [origin, setOrigin] = useState<string>(PLACES.homeHaidian);
  const [destination, setDestination] = useState<string>(PLACES.zhongguancun);
  const [arriveBy, setArriveBy] = useState<string>("09:30");
  const [modes, setModes] = useState<TravelMode[]>(["地铁", "公交", "骑行"]);
  const [loading, setLoading] = useState(false);
  const [replanLoading, setReplanLoading] = useState(false);
  const [tools, setTools] = useState<ToolCall[]>([]);
  const [result, setResult] = useState<PlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleMode = (m: TravelMode) => {
    setModes((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const runPlan = useCallback(
    async (override?: {
      origin?: string;
      destination?: string;
      arriveBy?: string;
      modes?: TravelMode[];
      scenario?: "sunny" | "disruption" | "change_dest";
    }) => {
      setLoading(true);
      setError(null);
      setTools([]);
      setResult(null);

      const payload = {
        origin: override?.origin ?? origin,
        destination: override?.destination ?? destination,
        arriveBy: override?.arriveBy ?? arriveBy,
        modes: override?.modes ?? modes,
        scenario: override?.scenario,
      };

      if (override?.origin) setOrigin(override.origin);
      if (override?.destination) setDestination(override.destination);
      if (override?.arriveBy) setArriveBy(override.arriveBy);
      if (override?.modes) setModes(override.modes);

      try {
        if (!payload.origin.trim() || !payload.destination.trim()) {
          throw new Error("请填写起点与终点");
        }
        if (payload.modes.length === 0) {
          throw new Error("请至少选择一种出行方式");
        }
        const data = await executePlan(payload);
        if (!data.ok) {
          throw new Error("规划失败");
        }
        setTools(data.tools);
        setResult(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "请求失败");
      } finally {
        setLoading(false);
      }
    },
    [origin, destination, arriveBy, modes]
  );

  const runReplan = useCallback(async () => {
    setReplanLoading(true);
    setError(null);
    try {
      if (!origin.trim() || !destination.trim()) {
        throw new Error("缺少起点或终点");
      }
      const data = await executeReplan({
        origin,
        destination,
        arriveBy,
        modes: modes.includes("打车") ? modes : [...modes, "打车"],
        delayMin: 15,
        previousLeaveBy: result?.recommendation.leaveBy,
        previousRouteId: result?.recommendation.primaryRoute.id,
      });
      if (!data.ok) {
        throw new Error("改线失败");
      }
      setTools(data.tools);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "改线失败");
    } finally {
      setReplanLoading(false);
    }
  }, [origin, destination, arriveBy, modes, result]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={loading}
            onClick={() =>
              runPlan({
                origin: p.origin,
                destination: p.destination,
                arriveBy: p.arriveBy,
                modes: [...p.modes],
                scenario: p.scenario,
              })
            }
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-900 disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">出行约束</h2>
            <p className="mt-1 text-xs text-slate-500">
              出门前 30 秒输入，Agent 输出唯一行动 + 备选
            </p>

            <label className="mt-4 block text-xs font-medium text-slate-600">
              起点
              <input
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none ring-teal-500/30 focus:bg-white focus:ring-2"
              />
            </label>
            <label className="mt-3 block text-xs font-medium text-slate-600">
              终点
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none ring-teal-500/30 focus:bg-white focus:ring-2"
              />
            </label>
            <label className="mt-3 block text-xs font-medium text-slate-600">
              最晚到达
              <input
                type="time"
                value={arriveBy}
                onChange={(e) => setArriveBy(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none ring-teal-500/30 focus:bg-white focus:ring-2"
              />
            </label>

            <div className="mt-4">
              <p className="text-xs font-medium text-slate-600">出行方式偏好</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ALL_MODES.map((m) => {
                  const on = modes.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMode(m)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        on
                          ? "bg-teal-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              disabled={loading || modes.length === 0}
              onClick={() => runPlan()}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-600/25 transition hover:from-teal-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Agent 规划中…" : "生成唯一推荐行动"}
            </button>

            {error && (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            )}
          </div>

          <ToolTrace tools={tools} running={loading || replanLoading} />
        </div>

        <div className="lg:col-span-3">
          {result ? (
            <ResultCard
              recommendation={result.recommendation}
              narrative={result.narrative}
              engine={result.engine}
              onReplan={runReplan}
              replanLoading={replanLoading}
            />
          ) : (
            <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-2xl">
                ⏱
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                等待你的第一句约束
              </h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                推荐先点「晴天通勤」预设。评委 60 秒内可看到：工具轨迹 → 唯一行动 →
                突发延误改线。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
