# ACC 2026 · 行前一刻 · 提交清单

赛道：**赛道二 AI+生活**（方向：智慧出行，勿写成独立赛道）  
提交表：https://scn11bez11y3.feishu.cn/share/base/form/shrcnSvSeUSvNzncbO0Nme84v4b  
硬截止：2026-10-22 20:00（Asia/Shanghai）

## 已完成交付物（本目录）

| 文件 | 路径 | 用途 |
|------|------|------|
| 路演 PPT（≤6 页） | `deliverables/行前一刻-路演PPT.pptx` | 现场路演 / 提交附件 |
| 海报 PNG | `deliverables/行前一刻-海报.png` | 游园会 / 打印（1080×1920） |
| 源码包 | `deliverables/xingqian-yike-src.zip` | GitHub 上传用（无 node_modules / .next） |
| 本清单 | `deliverables/SUBMIT_CHECKLIST.md` | 提交核对 |

## 工程本体（仓库根）

- 可运行 Next.js Agent：`src/`（`/studio` 三剧本 + 工具轨迹 + 延误改线）
- 文案：`docs/pitch.md` / `docs/poster-brief.md` / `docs/demo-script.md`
- README：安装、Demo 路径、环境变量说明

## 仍缺 / 待补（提交表必填）

| 缺口 | 状态 | 说明 |
|------|------|------|
| **公开 GitHub 仓库 URL** | 已完成 | https://github.com/yigenfeng0707-netizen/xingqian-yike |
| **在线 Demo URL** | 已完成 | https://yigenfeng0707-netizen.github.io/xingqian-yike/studio/ （GitHub Pages 静态导出） |
| **队名** | 待从报名表拉取 | 用户称在飞书组队/报名表里；公开表单无登录不可见 |
| **队长姓名** | 待从报名表拉取 | 同上 |
| **电话 + 微信** | 待从报名表拉取 | 同上；提交表通常需要 |
| **海报二维码真实链接** | 占位 | 海报为「扫码体验 Demo」占位框；有 Demo URL 后替换 |
| **飞书提交表登录** | 阻塞 | 表单需飞书登录后才能提交；不可匿名代填 |

## 建议提交字段映射（填表时）

1. 作品名称：行前一刻  
2. 赛道：赛道二 AI+生活（智慧出行方向）  
3. 一句话：出门前 30 秒，生成「唯一推荐行动」；延误时自动改线  
4. 作品类型：Agent · Web App  
5. 仓库 URL：https://github.com/yigenfeng0707-netizen/xingqian-yike  
6. Demo URL：https://yigenfeng0707-netizen.github.io/xingqian-yike/studio/  
7. PPT：上传 `行前一刻-路演PPT.pptx`  
8. 海报：上传 `行前一刻-海报.png`  
9. 源码：仓库公开即可；必要时附 `xingqian-yike-src.zip`  

## 本地验收入口

```bash
cd xingqian-yike
npm ci
npm run build
npm run start
# 打开 http://localhost:3000/studio
```

## 评委 60 秒 Demo

打开 `/studio` → 点预设（晴天通勤）→ 看工具轨迹 → 点「突发延误」→ 观察改线结果。
