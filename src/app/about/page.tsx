import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
        Architecture & Story
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        为什么做「行前一刻」
      </h1>
      <p className="mt-4 text-base leading-relaxed text-slate-600">
        上班族出门前常在高德、地铁 App、天气、日历之间来回横跳，信息够多，决策却更累。
        现有产品擅长「列选项」，不擅长在约束下给出
        <strong className="font-semibold text-slate-800">唯一可执行行动</strong>
        ，更少在延误发生时主动改线。我们把这一步做成 Agent。
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-900">Agent 架构</h2>
      <ol className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
        <li className="rounded-xl border border-slate-200 bg-white p-4">
          <span className="font-mono text-teal-700">1. weather_lookup</span>
          <p className="mt-1 text-slate-600">感知目的地天气与出行建议，影响缓冲与骑行可行性。</p>
        </li>
        <li className="rounded-xl border border-slate-200 bg-white p-4">
          <span className="font-mono text-teal-700">2. route_options</span>
          <p className="mt-1 text-slate-600">
            基于北京海淀/中关村/国贸等高保真 Mock，按偏好枚举地铁/公交/骑行/打车及混合方案。
          </p>
        </li>
        <li className="rounded-xl border border-slate-200 bg-white p-4">
          <span className="font-mono text-teal-700">3. leave_time_planner</span>
          <p className="mt-1 text-slate-600">
            行程时长 + 天气/可靠度/时段缓冲 → 倒推「必须出门」时刻。
          </p>
        </li>
        <li className="rounded-xl border border-slate-200 bg-white p-4">
          <span className="font-mono text-teal-700">4. replan_on_disruption</span>
          <p className="mt-1 text-slate-600">
            延误触发后重排：偏向高可靠、混合接驳或末端打车，输出新的唯一行动。
          </p>
        </li>
      </ol>

      <h2 className="mt-10 text-xl font-semibold text-slate-900">技术栈</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
        <li>Next.js App Router + TypeScript + Tailwind</li>
        <li>服务端 Agent 编排（/api/plan、/api/replan），UI 展示完整工具轨迹</li>
        <li>默认离线高质量北京 Mock；若设置 OPENAI_API_KEY 则叙事层可走 LLM</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-slate-900">比赛故事（10.13–10.22）</h2>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        <li>· 锁定切口：通勤决策 Agent（唯一行动，而非全能助手）</li>
        <li>· 四工具闭环 + 三条 Demo 剧本（晴天/延误/改目的地）</li>
        <li>· 提交四件套：可运行 Demo、公开仓库、≤6 页 PPT 文案、海报 brief</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-slate-900">落地路径</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        短期：日历「下一场会议」+ 天气/路况 API 真接，推送出门提醒。
        中期：企业班车/园区通勤场景试点。长期：延误保险式「到达保障」订阅。
      </p>

      <Link
        href="/studio"
        className="mt-10 inline-flex rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500"
      >
        回去跑 Demo
      </Link>
    </div>
  );
}
