# 港鐵下一班車 MTR Next Train

查詢港鐵重鐵各站下一班車時間的 Web App。資料來自 DATA.GOV.HK 的港鐵實時班次 API。本 App 與港鐵公司無關。

## 開發

```bash
npm install
npm run dev
```

- `npm run data` 由港鐵開放數據重新產生 `src/data/stations.json`
- `npm run build` 進行型別檢查及建置

產品範圍見 [docs/product-brief.md](docs/product-brief.md)，設計見 [docs/ui-ux-plan.md](docs/ui-ux-plan.md)。
