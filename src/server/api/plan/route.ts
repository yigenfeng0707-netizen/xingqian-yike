import { NextRequest, NextResponse } from "next/server";
import { runPlan } from "@/lib/agent/planner";
import type { PlanRequest, TravelMode } from "@/lib/types";

const VALID_MODES: TravelMode[] = ["地铁", "公交", "骑行", "打车"];

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<PlanRequest>;
    const origin = (body.origin || "").trim();
    const destination = (body.destination || "").trim();
    const arriveBy = (body.arriveBy || "09:30").trim();
    const modes = (body.modes || ["地铁", "公交"]).filter((m): m is TravelMode =>
      VALID_MODES.includes(m as TravelMode)
    );

    if (!origin || !destination) {
      return NextResponse.json(
        { ok: false, error: "请填写起点与终点" },
        { status: 400 }
      );
    }
    if (modes.length === 0) {
      return NextResponse.json(
        { ok: false, error: "请至少选择一种出行方式" },
        { status: 400 }
      );
    }

    const result = await runPlan({
      origin,
      destination,
      arriveBy,
      modes,
      scenario: body.scenario,
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "规划失败，请重试" },
      { status: 500 }
    );
  }
}
