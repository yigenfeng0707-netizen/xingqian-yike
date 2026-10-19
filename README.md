# 行前一刻

> ACC 2026 Time to Build · **赛道：AI+生活** · 方向：智慧出行  
> 出门前 30 秒，根据目的地、出发约束、天气与交通偏好，生成「唯一推荐行动」，延误时自动改线。

## 问题

通勤/跨城办事的上班族，出门前要在天气、地铁、网约车、日历之间来回横跳。  
现有 App 擅长**列选项**，不擅长在约束下给出**唯一可执行行动**，更少在延误时**主动改线**。

## 方案

可运行 Web Agent（不是聊天包装）：

| 工具 | 作用 |
|---|---|
| `weather_lookup` | 目的地天气与缓冲建议 |
| `route_options` | 枚举地铁/公交/骑行/打车及混合方案（北京高保真 Mock） |
| `leave_time_planner` | 倒推必须出门时刻 |
| `replan_on_disruption` | 延误触发后自动改线 |

输出：出门时刻 + 模式链 + 为什么 + 备选；UI 实时展示工具调用轨迹。

## 快速运行

```bash
cd xingqian-yike
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000) → **Agent 工作室**。

生产构建：

```bash
npm run build && npm start
```

### 可选 LLM 叙事

默认使用确定性 Mock 规划器（无 Key 也可完整体验工具轨迹）。若设置：

```bash
export OPENAI_API_KEY=sk-...
# 可选
export OPENAI_MODEL=gpt-4o-mini
```

则结果卡旁白可走 OpenAI；工具编排仍本地执行。

## 架构

```
浏览器 /studio
  → POST /api/plan | /api/replan
    → Agent 编排（src/lib/agent/planner.ts）
      → tools: weather / route / leave_time / replan
      → mocks: 海淀·中关村·国贸等
  ← { tools[], recommendation, narrative, engine }
```

关键目录：

- `src/lib/tools` — 四工具实现  
- `src/lib/mocks/beijing.ts` — 地点/天气/路线 Mock 与三预设  
- `src/lib/agent/planner.ts` — 多步编排 + 可选 LLM  
- `src/components/AgentStudio.tsx` — 主交互  
- `docs/` — PPT 文案、海报 brief、Demo 剧本  

## 评委 3 分钟上手

1. 打开 `/studio`  
2. 点预设 **「晴天通勤：家→中关村 9:30」** —— 看左侧工具轨迹与右侧唯一行动  
3. 点结果卡 **「突发延误 +15 分钟」** —— 观察 `replan_on_disruption`  
4. 再试 **「改目的地：国贸」**  
5. 需要故事与架构说明：`/about`

## Demo 剧本（与产品预设对齐）

1. 晴天通勤：海淀家 → 中关村软件园，9:30 前到达  
2. 突发延误 +15 分钟：自动改线（偏向高可靠 / 混合 / 末端打车）  
3. 改目的地：国贸·中国尊，10:00 前到达  

详细口播见 [`docs/demo-script.md`](docs/demo-script.md)。

## 比赛区间增量（10.13–10.22）

- 锁定切口：通勤决策 Agent（唯一行动，而非全能助手）  
- 实现四工具可解释 Agent + 中文当代 UI  
- 三条固定 Demo 剧本与延误改线闭环  
- 交付 README / ≤6 页 PPT 文案 / 海报 brief / Demo 剧本 / MIT  

PPT 文案：[`docs/pitch.md`](docs/pitch.md)  
海报 brief：[`docs/poster-brief.md`](docs/poster-brief.md)

## 许可

MIT · 见 [LICENSE](LICENSE)
