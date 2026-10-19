import type { PlanRequest, ReplanRequest, ToolCall, WeatherResult, RouteOption, LeavePlan, Recommendation } from "../types";
import {
  getWeather,
  buildRouteOptions,
  subtractMinutes,
  addMinutes,
} from "../mocks/beijing";

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function weatherLookup(
  location: string,
  scenario?: string
): Promise<{ tool: ToolCall; result: WeatherResult }> {
  const tool: ToolCall = {
    id: uid("weather"),
    name: "weather_lookup",
    status: "running",
    input: { location, scenario: scenario || "auto" },
    startedAt: Date.now(),
  };
  await sleep(280 + Math.random() * 120);
  const result = getWeather(location, scenario);
  tool.status = "done";
  tool.finishedAt = Date.now();
  tool.output = { ...result };
  tool.summary = `${result.condition} ${result.tempC}°C · 降水概率 ${result.precipProb}%`;
  return { tool, result };
}

export async function routeOptions(
  origin: string,
  destination: string,
  modes: PlanRequest["modes"],
  scenario?: string
): Promise<{ tool: ToolCall; result: RouteOption[] }> {
  const tool: ToolCall = {
    id: uid("route"),
    name: "route_options",
    status: "running",
    input: { origin, destination, modes },
    startedAt: Date.now(),
  };
  await sleep(360 + Math.random() * 160);
  const result = buildRouteOptions(origin, destination, modes, scenario);
  tool.status = "done";
  tool.finishedAt = Date.now();
  tool.output = {
    count: result.length,
    top: result.slice(0, 3).map((r) => ({
      id: r.id,
      label: r.label,
      durationMin: r.durationMin,
      reliability: r.reliability,
    })),
  };
  tool.summary = `生成 ${result.length} 条可行路线，最优约 ${result[0]?.durationMin ?? "?"} 分钟`;
  return { tool, result };
}

export async function leaveTimePlanner(
  arriveBy: string,
  primary: RouteOption,
  weather: WeatherResult,
  scenario?: string
): Promise<{ tool: ToolCall; result: LeavePlan }> {
  const tool: ToolCall = {
    id: uid("leave"),
    name: "leave_time_planner",
    status: "running",
    input: {
      arriveBy,
      routeId: primary.id,
      durationMin: primary.durationMin,
      weather: weather.condition,
    },
    startedAt: Date.now(),
  };
  await sleep(240 + Math.random() * 100);

  // Buffer: base 8 + weather + reliability + disruption
  let buffer = 8;
  if (weather.precipProb > 20) buffer += 5;
  if (primary.reliability < 0.8) buffer += 7;
  if (scenario === "disruption") buffer += 10;
  if (primary.modes.includes("打车")) buffer += 3;

  const leaveBy = subtractMinutes(arriveBy, primary.durationMin + buffer);
  const arriveEst = addMinutes(leaveBy, primary.durationMin);

  const result: LeavePlan = {
    leaveBy,
    bufferMin: buffer,
    arriveEst,
    reason: `行程 ${primary.durationMin} 分钟 + 缓冲 ${buffer} 分钟（天气/可靠度/时段）`,
  };

  tool.status = "done";
  tool.finishedAt = Date.now();
  tool.output = { ...result };
  tool.summary = `建议 ${leaveBy} 出门，预计 ${arriveEst} 抵达`;
  return { tool, result };
}

export async function replanOnDisruption(
  req: ReplanRequest,
  weather: WeatherResult,
  routes: RouteOption[]
): Promise<{ tool: ToolCall; result: { chosen: RouteOption; leaveBy: string; note: string } }> {
  const tool: ToolCall = {
    id: uid("replan"),
    name: "replan_on_disruption",
    status: "running",
    input: {
      delayMin: req.delayMin,
      previousRouteId: req.previousRouteId,
      arriveBy: req.arriveBy,
    },
    startedAt: Date.now(),
  };
  await sleep(320 + Math.random() * 140);

  // Prefer higher reliability / hybrid / taxi when delayed
  const scored = [...routes].map((r) => {
    let score = r.reliability * 50 - r.durationMin;
    if (r.modes.includes("打车")) score += 12;
    if (r.id.includes("hybrid")) score += 18;
    if (req.previousRouteId && r.id === req.previousRouteId) score -= 25;
    return { r, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const chosen = scored[0].r;

  const buffer = 6 + Math.ceil(req.delayMin / 3);
  // Effective: we already lost delayMin from original plan; need to leave ASAP conceptually
  // For demo: compute leave-by from now-simulated = arriveBy - duration - buffer, then note urgency
  const leaveBy = subtractMinutes(req.arriveBy, chosen.durationMin + buffer);
  const note =
    req.delayMin >= 15
      ? `原方案延误约 ${req.delayMin} 分钟。已切换至「${chosen.label}」，用更高可靠度/末端加速抢回时间。`
      : `检测到轻微扰动，已微调出发策略。`;

  tool.status = "done";
  tool.finishedAt = Date.now();
  tool.output = {
    chosenId: chosen.id,
    leaveBy,
    delayMin: req.delayMin,
    weatherHint: weather.advice,
  };
  tool.summary = `改线 → ${chosen.label}，新出发 ${leaveBy}`;
  return { tool, result: { chosen, leaveBy, note } };
}

export function buildRecommendation(
  weather: WeatherResult,
  routes: RouteOption[],
  leave: LeavePlan,
  primary: RouteOption,
  disruptionNote?: string
): Recommendation {
  const backup =
    routes.find((r) => r.id !== primary.id) ||
    ({
      ...primary,
      id: "backup-same",
      label: "同方案延后一班",
    } as RouteOption);

  return {
    leaveBy: leave.leaveBy,
    arriveEst: leave.arriveEst,
    modeChain: primary.modes.join(" → "),
    primaryRoute: primary,
    why: [
      leave.reason,
      `天气：${weather.condition}，${weather.advice}`,
      `可靠度 ${(primary.reliability * 100).toFixed(0)}% · 换乘 ${primary.transfers} 次 · 步行 ${primary.walkMin} 分钟`,
      `费用约 ¥${primary.costYuan}`,
    ],
    backup: {
      leaveBy: subtractMinutes(leave.leaveBy, -12),
      modeChain: backup.modes.join(" → "),
      note: `备选「${backup.label}」，约 ${backup.durationMin} 分钟，可靠度 ${(backup.reliability * 100).toFixed(0)}%`,
    },
    weather,
    disruptionNote,
  };
}
