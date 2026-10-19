import type { PlanRequest, PlanResponse, ReplanRequest, Recommendation } from "../types";
import {
  weatherLookup,
  routeOptions,
  leaveTimePlanner,
  replanOnDisruption,
  buildRecommendation,
} from "../tools";
import { addMinutes, subtractMinutes } from "../mocks/beijing";

async function maybeLlmNarrative(
  req: PlanRequest,
  rec: Recommendation
): Promise<{ engine: "mock" | "llm"; narrative: string }> {
  const key = process.env.OPENAI_API_KEY;
  const base = `已为你锁定唯一行动：${rec.leaveBy} 出门，走「${rec.primaryRoute.label}」（${rec.modeChain}），预计 ${rec.arriveEst} 到达 ${req.destination}。若路上再延误，点「突发延误」可自动改线。`;

  if (!key) {
    return { engine: "mock", narrative: base };
  }

  try {
    const prompt = `你是「行前一刻」出行 Agent。用中文写 2–3 句简洁行动指令（不要废话）。
起点：${req.origin}
终点：${req.destination}
到达约束：${req.arriveBy} 前
推荐出门：${rec.leaveBy}
方案：${rec.primaryRoute.label} / ${rec.modeChain}
理由要点：${rec.why.join("；")}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: "你是务实的通勤决策助手，只输出可执行中文短句。" },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 180,
      }),
    });

    if (!res.ok) {
      return { engine: "mock", narrative: base };
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return { engine: "mock", narrative: base };
    return { engine: "llm", narrative: text };
  } catch {
    return { engine: "mock", narrative: base };
  }
}

export async function runPlan(req: PlanRequest): Promise<PlanResponse> {
  const tools = [];

  const w = await weatherLookup(req.destination, req.scenario);
  tools.push(w.tool);

  const r = await routeOptions(req.origin, req.destination, req.modes, req.scenario);
  tools.push(r.tool);

  const primary = r.result[0];
  const leave = await leaveTimePlanner(req.arriveBy, primary, w.result, req.scenario);
  tools.push(leave.tool);

  let disruptionNote: string | undefined;
  let recommendation = buildRecommendation(
    w.result,
    r.result,
    leave.result,
    primary
  );

  // If preset is disruption, auto-chain replan for demo drama
  if (req.scenario === "disruption") {
    const rp = await replanOnDisruption(
      {
        origin: req.origin,
        destination: req.destination,
        arriveBy: req.arriveBy,
        modes: req.modes,
        delayMin: 15,
        previousRouteId: primary.id,
      },
      w.result,
      r.result
    );
    tools.push(rp.tool);
    const arriveEst = addMinutes(rp.result.leaveBy, rp.result.chosen.durationMin);
    recommendation = buildRecommendation(
      w.result,
      r.result,
      {
        leaveBy: rp.result.leaveBy,
        bufferMin: 6,
        arriveEst,
        reason: rp.result.note,
      },
      rp.result.chosen,
      rp.result.note
    );
    disruptionNote = rp.result.note;
  }

  const { engine, narrative } = await maybeLlmNarrative(req, recommendation);

  return {
    ok: true,
    engine,
    tools,
    recommendation: { ...recommendation, disruptionNote },
    narrative,
  };
}

export async function runReplan(req: ReplanRequest): Promise<PlanResponse> {
  const tools = [];

  const w = await weatherLookup(req.destination, "disruption");
  tools.push(w.tool);

  const r = await routeOptions(req.origin, req.destination, req.modes, "disruption");
  tools.push(r.tool);

  const rp = await replanOnDisruption(req, w.result, r.result);
  tools.push(rp.tool);

  const arriveEst = addMinutes(rp.result.leaveBy, rp.result.chosen.durationMin);
  const leave = {
    leaveBy: rp.result.leaveBy,
    bufferMin: 6 + Math.ceil(req.delayMin / 3),
    arriveEst,
    reason: rp.result.note,
  };

  // Also emit leave_time_planner for full 4-tool story on replan path
  const leaveTool = await leaveTimePlanner(
    req.arriveBy,
    rp.result.chosen,
    w.result,
    "disruption"
  );
  tools.push(leaveTool.tool);

  const recommendation = buildRecommendation(
    w.result,
    r.result,
    {
      ...leave,
      leaveBy: leaveTool.result.leaveBy,
      arriveEst: leaveTool.result.arriveEst,
      bufferMin: leaveTool.result.bufferMin,
    },
    rp.result.chosen,
    rp.result.note
  );

  // Prefer urgency leave: if delay, nudge earlier than pure planner when needed
  if (req.delayMin >= 15) {
    recommendation.leaveBy = subtractMinutes(
      leaveTool.result.leaveBy,
      Math.min(8, Math.floor(req.delayMin / 2))
    );
    recommendation.disruptionNote = rp.result.note;
  }

  const planLike: PlanRequest = {
    origin: req.origin,
    destination: req.destination,
    arriveBy: req.arriveBy,
    modes: req.modes,
    scenario: "disruption",
  };
  const { engine, narrative } = await maybeLlmNarrative(planLike, recommendation);

  return {
    ok: true,
    engine,
    tools,
    recommendation,
    narrative,
  };
}
