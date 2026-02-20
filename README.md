# WAF Rule Checker

一個以 `React + CSS + D3` 建立的前端工具，提供 WAF 規則檢測、規則覆蓋率儀表板、PWA 離線能力與 WebMCP 通訊範例。

- 線上網址：<https://lian0123.github.io/waf-rule-checker/>
- 專案網址：<https://github.com/Lian0123/waf-rule-checker>

## 專案介紹

本工具聚焦於以下需求：

1. **WAF 規則檢測**：支援 `PATH / QUERY / HEADER / BODY(raw) / BODY(form-data)`。
2. **Azure 風格判定**：依據 anomaly score 進行 `ALLOW / LOG / BLOCK`。
3. **規則管理**：可編輯規則 JSON、加入自訂規則庫、匯入/匯出自訂規則。
4. **覆蓋率儀表板**：用 D3 圖表呈現類別分佈、OWASP 分佈、最近掃描熱點。
5. **PWA 與離線**：可安裝到裝置並離線操作。
6. **WebMCP**：可與其他 AI 系統進行 request/response 交換。

## 快速開始

### 直接使用

開啟首頁：

- <https://lian0123.github.io/waf-rule-checker/>

### 本機開發（靜態）

可使用任一靜態伺服器啟動，例如：

```bash
python3 -m http.server 8080
```

然後瀏覽：

- <http://localhost:8080/index.html>

## 使用說明

## 1) 檢測頁（Scanner）

在 `index.html` 的檢測頁可設定：

- HTTP Method：`GET / POST / PUT`
- PATH
- QUERY STRING
- HEADER
- BODY raw（JSON 或任意文字）
- BODY form-data（`key=value` 每行一組）
- Block Threshold（Anomaly Score）

點擊 **執行檢測** 後會看到：

- 判定結果（ALLOW / LOG / BLOCK）
- 命中規則數
- 每條命中的規則資訊（規則 ID、群組、攻擊類型、違反片段、違反來源）

## 2) RULE 清單頁

可操作：

- 關鍵字搜尋（ID/名稱/分類/描述）
- TAG 篩選（分類、OWASP、規則群組、severity）
- 點擊規則看詳細資訊、觸發條件與範例 URL
- 加入/移出自訂規則庫

## 3) 覆蓋率儀表板

提供：

- 類別分佈圖
- OWASP 標籤分佈圖
- 最近一次掃描熱點圖

互動：

- 點擊圖表柱狀可直接套用篩選
- 可匯出各圖 PNG
- 可匯出檢測熱點 CSV/JSON

## 4) WebMCP 範例頁

開啟：

- `webmcp-demo.html`

可測試：

- `waf.scan`
- `waf.getRules`
- `waf.getState`
- `waf.getCoverage`
- `waf.setCoverageFilter`
- `waf.exportCoverage`
- `ai.exchangeContext`

## 檢測範例與結果解讀

以下示範如何輸入與解讀結果。

### 範例 A：SQL Injection

輸入：

- PATH: `/login`
- QUERY: `user=admin&pass=' OR 1=1 --`
- HEADER: `User-Agent: Mozilla/5.0`

解讀：

- 若命中 SQLi 相關規則且總分超過門檻，結果會是 `BLOCK`。
- 在命中明細可看到：
  - 規則 ID（例如 `CRS-xxxxx`）
  - 攻擊類型（例如 `A03:2021 Injection`）
  - 違反來源（例如 `query`）
  - 違反片段（例如 `' OR 1=1 --`）

### 範例 B：XSS

輸入：

- PATH: `/search`
- QUERY: `q=<script>alert(1)</script>`

解讀：

- 通常會命中 XSS 規則。
- 如果分數尚未達封鎖門檻，可能是 `LOG`；達門檻時為 `BLOCK`。

### 範例 C：POST Body 攻擊

輸入：

- Method: `POST`
- HEADER: `Content-Type: application/json`
- BODY raw: `{"comment":"<svg onload=alert(1)>"}`

解讀：

- 會在結果中看到違反來源為 `bodyRaw` 或 `body`。
- 這有助於快速定位問題出現在 request body，而非 URL。

### 範例 D：正常流量

輸入：

- PATH: `/products`
- QUERY: `page=1&sort=asc`
- HEADER: `User-Agent: Mozilla/5.0`

解讀：

- 若沒有命中規則，結果為 `ALLOW`。

## 常見問題（FAQ）

### Q1. 這個工具是否等同於正式 WAF？

不是。本工具是**檢測與教學輔助**，不能取代正式 WAF 設備、雲端防護策略與專業滲透測試。

### Q2. 為什麼同一請求在不同規則庫會得到不同結果？

規則內容、分數、門檻不同會導致判定差異。請確認你目前使用的是哪個規則庫與 threshold。

### Q3. PWA 安裝後打開路徑不正確怎麼辦？

本專案已針對 GitHub Pages 子路徑設定 `manifest` 的 `id/start_url/scope`。若仍異常，請清除舊版 App 與 Service Worker 快取後重裝。

### Q4. 匯入自訂規則失敗怎麼辦？

請確認 JSON 是陣列且每條規則至少包含：

- `id`, `name`, `category`, `severity`, `score`, `target`, `pattern`, `description`

### Q5. 為什麼某些攻擊沒被擋？

可能因為：

- 規則未覆蓋該 payload
- payload 被編碼/混淆
- anomaly score 尚未達門檻

可透過儀表板與命中明細調整規則或門檻。

## 貢獻指南

歡迎提交 Issue / PR！

### 建議流程

1. Fork 專案並建立分支
2. 修改程式碼與文件
3. 本機測試（含手機尺寸與至少 2 種瀏覽器）
4. 提交 PR，描述變更目的與測試方式

### PR 建議內容

- 變更摘要（What/Why）
- 截圖或錄影（UI/圖表/PWA）
- 測試清單（桌機/手機、Chrome/Safari/Edge）
- 若有 WebMCP 變更，請附 request/response 範例

## 品質與相容性建議

- 瀏覽器：Chrome、Safari、Edge 最新版
- 裝置：桌機 + iOS/Android 手機
- PWA：安裝、離線開啟、更新流程都要測試
- SEO：確認 sitemap/robots/canonical/OG 與結構化資料是否可被讀取

---

如果你希望，我可以再補一份 `CONTRIBUTING.md`（更完整的提交規範、分支命名、PR 模板與測試矩陣）。
