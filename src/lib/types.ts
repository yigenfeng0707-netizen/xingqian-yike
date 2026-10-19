export type TravelMode = "地铁" | "公交" | "骑行" | "打车";

export interface PlanRequest {
  origin: string;
  destination: string;
  arriveBy: string; // HH:mm
  modes: TravelMode[];
  scenario?: "sunny" | "disruption" | "change_dest";
}

export interface ToolCall {
  id: string;
  name: "weather_lookup" | "route_options" | "leave_time_planner" | "replan_on_disruption";
  status: "pending" | "running" | "done" | "error";
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  startedAt: number;
  finishedAt?: number;
  summary?: string;
}

export interface WeatherResult {
  location: string;
  condition: string;
  tempC: number;
  precipProb: number;
  wind: string;
  advice: string;
}

export interface RouteOption {
  id: string;
  label: string;
  modes: TravelMode[];
  durationMin: number;
  transfers: number;
  walkMin: number;
  costYuan: number;
  reliability: number; // 0-1
  summary: string;
  steps: string[];
}

export interface LeavePlan {
  leaveBy: string;
  bufferMin: number;
  arriveEst: string;
  reason: string;
}

export interface Recommendation {
  leaveBy: string;
  arriveEst: string;
  modeChain: string;
  primaryRoute: RouteOption;
  why: string[];
  backup: {
    leaveBy: string;
    modeChain: string;
    note: string;
  };
  weather: WeatherResult;
  disruptionNote?: string;
}

export interface PlanResponse {
  ok: boolean;
  engine: "mock" | "llm";
  tools: ToolCall[];
  recommendation: Recommendation;
  narrative: string;
}

export interface ReplanRequest {
  origin: string;
  destination: string;
  arriveBy: string;
  modes: TravelMode[];
  delayMin: number;
  previousLeaveBy?: string;
  previousRouteId?: string;
}
