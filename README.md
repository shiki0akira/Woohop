# Woohop

明天就要帶破冰？打開就能帶。手機瀏覽器直接開、免下載、免註冊的破冰／派對遊戲。

正式網址：https://www.vibeweb100.com/zh-TW/（品牌改名 Woohop，網域不換）

## 結構

| 資料夾 | 網址 | 部署 |
|---|---|---|
| `apps/homepage` | `/{lang}/` | Vercel（push 到 main 自動部署） |
| `apps/avalon` | `/avalon/{lang}` | Vercel（push 到 main 自動部署） |
| `apps/buzzer` | `/buzzer/{lang}/` | Cloudflare Workers，`cd apps/buzzer && npm run deploy` |
| `apps/match` | `/match/{lang}/` | 同上 |
| `apps/bingo` | `/bingo/{lang}/` | 同上 |
| `apps/warmup` | `/bomb/`、`/bamboo/`、`/stairs/`、`/orchard/` | 暖場遊戲合在一個 assets-only Worker，`cd apps/warmup && npm run deploy` 一次部署全部 |
| `apps/feedback` | `/api/feedback` | Cloudflare Workers（意見表單 → 寄到 woohop.app@gmail.com），`cd apps/feedback && npx wrangler deploy` |

幸福模擬器（`/happiness/`）是獨立 repo，不在這裡。

每個 `apps/*` 都是獨立專案，各自 `npm install`、各自建置與部署。

## 文件

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — 網址結構、路由、部署、設計代幣
- [docs/redesign-plan.md](docs/redesign-plan.md) — 改版企劃書
