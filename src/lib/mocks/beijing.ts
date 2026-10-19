import type { TravelMode, WeatherResult, RouteOption } from "../types";

export const PLACES = {
  homeHaidian: "海淀区·中关村南大街（家）",
  zhongguancun: "中关村软件园·东北门",
  guomao: "国贸·中国尊",
  wangjing: "望京SOHO",
  xizhimen: "西直门交通枢纽",
  dongzhimen: "东直门",
} as const;

export const PRESETS = [
  {
    id: "sunny",
    label: "晴天通勤：家→中关村 9:30",
    origin: PLACES.homeHaidian,
    destination: PLACES.zhongguancun,
    arriveBy: "09:30",
    modes: ["地铁", "公交", "骑行"] as TravelMode[],
    scenario: "sunny" as const,
  },
  {
    id: "disruption",
    label: "突发延误 +15 分钟",
    origin: PLACES.homeHaidian,
    destination: PLACES.zhongguancun,
    arriveBy: "09:30",
    modes: ["地铁", "公交", "骑行", "打车"] as TravelMode[],
    scenario: "disruption" as const,
  },
  {
    id: "change_dest",
    label: "改目的地：国贸",
    origin: PLACES.homeHaidian,
    destination: PLACES.guomao,
    arriveBy: "10:00",
    modes: ["地铁", "打车"] as TravelMode[],
    scenario: "change_dest" as const,
  },
] as const;

const weatherByScenario: Record<string, WeatherResult> = {
  sunny: {
    location: "北京·海淀",
    condition: "晴",
    tempC: 18,
    precipProb: 5,
    wind: "北风 2 级",
    advice: "体感舒适，适合短距离骑行接驳；无需雨具。",
  },
  disruption: {
    location: "北京·海淀",
    condition: "多云转阴",
    tempC: 16,
    precipProb: 25,
    wind: "北风 3 级",
    advice: "路面偏湿滑风险低，但早高峰地铁延误概率升高，建议预留缓冲。",
  },
  change_dest: {
    location: "北京·朝阳",
    condition: "晴间多云",
    tempC: 19,
    precipProb: 10,
    wind: "西南风 2 级",
    advice: "国贸周边拥堵时段 8:30–10:00，地铁更稳。",
  },
  default: {
    location: "北京",
    condition: "多云",
    tempC: 17,
    precipProb: 15,
    wind: "微风",
    advice: "常规通勤天气，优先可靠线路。",
  },
};

export function getWeather(destination: string, scenario?: string): WeatherResult {
  if (scenario && weatherByScenario[scenario]) return weatherByScenario[scenario];
  if (destination.includes("国贸") || destination.includes("朝阳")) {
    return { ...weatherByScenario.change_dest };
  }
  return { ...weatherByScenario.sunny };
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function buildRouteOptions(
  origin: string,
  destination: string,
  modes: TravelMode[],
  scenario?: string
): RouteOption[] {
  const toGuomao = destination.includes("国贸");
  const toZgc = destination.includes("中关村") || destination.includes("软件园");
  const seed = hashSeed(`${origin}|${destination}|${scenario || ""}`);

  const all: RouteOption[] = [];

  if (modes.includes("地铁")) {
    if (toZgc) {
      all.push({
        id: "metro-zgc",
        label: "地铁 4/10 号线换乘",
        modes: ["地铁"],
        durationMin: 38 + (seed % 5),
        transfers: 1,
        walkMin: 12,
        costYuan: 4,
        reliability: scenario === "disruption" ? 0.72 : 0.92,
        summary: "健德门 → 知春路 → 骑行/步行至软件园",
        steps: [
          "步行 8 分钟至健德门站",
          "地铁 10 号线内环至知春路（约 12 分钟）",
          "换乘 4 号线至西二旗附近接驳点（约 10 分钟）",
          "步行/骑行 10 分钟至软件园东北门",
        ],
      });
    }
    if (toGuomao) {
      all.push({
        id: "metro-guomao",
        label: "地铁 10 号线直达国贸",
        modes: ["地铁"],
        durationMin: 52 + (seed % 6),
        transfers: 0,
        walkMin: 14,
        costYuan: 5,
        reliability: 0.9,
        summary: "健德门 → 国贸（10 号线）",
        steps: [
          "步行 8 分钟至健德门站",
          "地铁 10 号线外环直达国贸（约 35 分钟）",
          "步行 6 分钟至中国尊",
        ],
      });
    }
    if (!toZgc && !toGuomao) {
      all.push({
        id: "metro-generic",
        label: "地铁主干线",
        modes: ["地铁"],
        durationMin: 45,
        transfers: 1,
        walkMin: 15,
        costYuan: 5,
        reliability: 0.88,
        summary: "地铁换乘至目的地周边",
        steps: ["步行至最近地铁站", "地铁换乘", "步行至目的地"],
      });
    }
  }

  if (modes.includes("公交") && toZgc) {
    all.push({
      id: "bus-zgc",
      label: "快速公交 + 短步行",
      modes: ["公交"],
      durationMin: 48 + (seed % 7),
      transfers: 0,
      walkMin: 10,
      costYuan: 2,
      reliability: scenario === "disruption" ? 0.65 : 0.8,
      summary: "专线公交直达中关村软件园南门",
      steps: [
        "步行 5 分钟至公交站",
        "快速公交约 35 分钟",
        "步行 5 分钟至东北门",
      ],
    });
  }

  if (modes.includes("骑行") && toZgc) {
    all.push({
      id: "bike-zgc",
      label: "共享单车直达",
      modes: ["骑行"],
      durationMin: 28 + (seed % 4),
      transfers: 0,
      walkMin: 2,
      costYuan: 3,
      reliability: scenario === "sunny" ? 0.85 : 0.7,
      summary: "沿北四环辅路骑行至软件园",
      steps: [
        "开锁共享单车",
        "北四环辅路骑行约 25 分钟",
        "停车场还车，步行 2 分钟入园",
      ],
    });
  }

  if (modes.includes("打车")) {
    const base = toGuomao ? 55 : toZgc ? 32 : 40;
    all.push({
      id: "taxi-primary",
      label: "网约车门到门",
      modes: ["打车"],
      durationMin: base + (scenario === "disruption" ? 12 : seed % 8),
      transfers: 0,
      walkMin: 0,
      costYuan: toGuomao ? 68 : 35,
      reliability: scenario === "disruption" ? 0.78 : 0.86,
      summary: toGuomao ? "经三环/四环至国贸" : "经北四环至中关村软件园",
      steps: ["呼叫网约车（预计 3–6 分钟上车）", "门到门送达"],
    });
  }

  // Hybrid for disruption recovery
  if (modes.includes("地铁") && modes.includes("打车") && toZgc) {
    all.push({
      id: "hybrid-metro-taxi",
      label: "地铁主干 + 末端打车",
      modes: ["地铁", "打车"],
      durationMin: 34,
      transfers: 1,
      walkMin: 6,
      costYuan: 22,
      reliability: 0.9,
      summary: "地铁避开拥堵段，末端打车抢时间",
      steps: [
        "步行 6 分钟至健德门",
        "地铁 10 号线至知春路",
        "末端网约车 8 分钟直达东北门",
      ],
    });
  }

  if (all.length === 0) {
    all.push({
      id: "fallback-walk-taxi",
      label: "保底：打车",
      modes: ["打车"],
      durationMin: 40,
      transfers: 0,
      walkMin: 0,
      costYuan: 40,
      reliability: 0.8,
      summary: "无可用偏好模式时的保底方案",
      steps: ["呼叫网约车直达"],
    });
  }

  return all.sort((a, b) => {
    // Prefer reliability * speed tradeoff
    const score = (r: RouteOption) => r.reliability * 100 - r.durationMin + (r.costYuan < 20 ? 5 : 0);
    return score(b) - score(a);
  });
}

export function parseArriveBy(arriveBy: string): { h: number; m: number } {
  const [h, m] = arriveBy.split(":").map((x) => parseInt(x, 10));
  return { h: h || 9, m: m || 0 };
}

export function formatTime(h: number, m: number): string {
  const hh = ((h % 24) + 24) % 24;
  const mm = ((m % 60) + 60) % 60;
  const carry = Math.floor(m / 60);
  const H = (hh + carry + 24) % 24;
  return `${String(H).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function subtractMinutes(arriveBy: string, minutes: number): string {
  const { h, m } = parseArriveBy(arriveBy);
  const total = h * 60 + m - minutes;
  const norm = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  return formatTime(Math.floor(norm / 60), norm % 60);
}

export function addMinutes(time: string, minutes: number): string {
  const { h, m } = parseArriveBy(time);
  const total = h * 60 + m + minutes;
  const norm = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  return formatTime(Math.floor(norm / 60), norm % 60);
}
