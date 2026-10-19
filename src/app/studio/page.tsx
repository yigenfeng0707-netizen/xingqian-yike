import AgentStudio from "@/components/AgentStudio";

export default function StudioPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Agent 工作室
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          输入约束 → 观察工具调用 → 拿到唯一行动。评委可直接点三个预设，或点结果卡上的「突发延误
          +15 分钟」触发改线。
        </p>
      </div>
      <AgentStudio />
    </div>
  );
}
