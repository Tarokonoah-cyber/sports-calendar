# Sports Calendar 體育賽事日曆

一個安靜、工具優先的個人體育賽事日曆。技術架構使用 Next.js、TypeScript、Tailwind CSS、shadcn/ui-style primitives、TanStack Query、Zustand 與 date-fns。

## 本機執行

```bash
npm install
npm run dev
```

## 正式部署

將此 repository 推送到 GitHub，並匯入 Vercel。Vercel 會自動偵測 Next.js，之後每次 push 都會自動 build 並更新網站。

## 資料

Mock 賽程放在 `/data/*.json`。前端透過 `/api/events` 讀取資料，因此未來可以把 JSON 替換成正式 API，而不需要重寫日曆介面。
