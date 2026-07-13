# IR Kit — 繁體中文

**像擁有十人 IR 團隊一樣經營投資人關係 — 即使只有你和一個 AI agent。**

IR Kit 是開源、本機優先的投資人關係系統：股權結構表與 SAFE 轉換計算、財務儀表板（燒錢率／跑道）、投資人 CRM、YC 格式月度更新信、資料室（data room）檢查清單與營運攻略 — 專為與 coding agent（Claude Code、Codex、Cursor…）協作而設計。

## 快速開始

```bash
git clone https://github.com/howieyoung/ir-kit && cd ir-kit
node server.js        # Node 18+，零依賴 — 安裝就這一行
# → http://127.0.0.1:2330
```

## 第一天只要兩個字：告訴你的 agent「ir start」

1. 開啟 app（內建範例公司資料，立即可看）。
2. 在專案資料夾開啟你的 coding agent — 它會自動讀取 AGENTS.md。
3. 說：**「ir start」**。Agent 會建好所有資料夾（含文件收件匣 inbox）、說明隱私規則，並一步步引導你。
4. 把所有財務／募資／公司文件丟進 inbox — SAFE、銀行對帳單、股權表、簡報，完全不用整理。
5. `ir sort` 自動將文件歸類到正確的資料室資料夾 — **隨時可重複執行**，是常駐的歸檔服務。
6. 經你同意後，agent 讀取文件並建立真實的股權結構表、SAFE 帳本與每月財務 — **每個數字都附上文件出處**，不確定的進入待確認清單，絕不亂猜。
7. `ir check` 驗證通過、你確認數字無誤後，儀表板就是你公司的真實數據。若你沒有提供文件，則維持範例資料。

## 隱私設計（不是政策，是架構）

- 你的資料是本機的 JSON 檔（`data/`）與文件資料夾（`ir-workspace/`），**皆已列入 .gitignore**，不可能誤傳到公開 repo。
- 伺服器預設只綁定 localhost；公開 demo 網站的資料只存在訪客自己的瀏覽器。
- 沒有帳號、沒有雲端 — 沒有人應該為了做好 IR 而把股權表上傳給別人。

## 語言

儀表板左側欄可切換語言（英／繁中／日／韓／西／法）。完整教學已有繁中版：[教學（繁中）](TUTORIAL.zh-TW.md)；CLI 參考以英文為準：[CLI](../CLI.md) · [貢獻規則](../../CONTRIBUTING.md)（所有 PR 必須維持六語系完整覆蓋）。

MIT 授權 · [線上 Demo](https://howieyoung.github.io/ir-kit/) · [English README](../../README.md)
