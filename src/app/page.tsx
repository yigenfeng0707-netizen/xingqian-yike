import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 p-8 shadow-xl shadow-teal-500/5 backdrop-blur sm:p-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
          ACC 2026 · AI+生活 · 智慧出行
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl sm:leading-tight">
          行前一刻
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
          出门前 30 秒，根据目的地、出发约束、天气与交通偏好，生成
          <span className="font-semibold text-teal-800">「唯一推荐行动」</span>
          ，延误时自动改线。
        </p>
        <p className="mt-3 text-sm text-slate-500">
          面向通勤/跨城办事的上班族 —— 不是再给你十个选项，而是替你做完决策。
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/studio"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:from-teal-500 hover:to-cyan-500"
          >
            打开 Agent 工作室
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
          >
            看架构与比赛故事
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            {
              t: "真 Agent",
              d: "weather → route → leave_time → replan，工具轨迹可解释",
            },
            {
              t: "唯一行动",
              d: "给出出门时刻 + 模式链 + 理由 + 备选，决策成本≈0",
            },
            {
              t: "延误改线",
              d: "一键模拟 +15 分钟延误，自动切换高可靠方案",
            },
          ].map((c) => (
            <div
              key={c.t}
              className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5"
            >
              <h3 className="font-semibold text-slate-900">{c.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          "预设① 晴天通勤：海淀家 → 中关村 9:30",
          "预设② 突发延误 +15 分钟自动改线",
          "预设③ 改目的地：国贸中国尊",
        ].map((s, i) => (
          <div
            key={s}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <span className="text-xs font-mono text-teal-600">Demo {i + 1}</span>
            <p className="mt-2 text-sm font-medium text-slate-800">{s}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
