# SEO 檢查清單

狀態:**已內建**/**部署後要做**/**Tim 要決定**

| 項目 | 狀態 | 說明 |
|---|---|---|
| canonical | 已內建 | 每頁 `<link rel="canonical">`,依 `SITE_URL` 產生(本機 curl 確認首頁與文章頁有) |
| sitemap | 已內建 | `@astrojs/sitemap` 產 `/sitemap-index.xml`,404 不在其中 |
| robots.txt | 已內建 | 動態產生,含 `Sitemap: https://insyra.me/sitemap-index.xml` |
| Open Graph / Twitter card | 已內建 | og:title/description/url/image、`summary_large_image`;文章 cover 為 OG 圖,否則 `/og-default.png`(佔位圖,Tim 可換正式圖) |
| JSON-LD | 已內建 | 首頁 WebSite;文章 BlogPosting + BreadcrumbList;作者 Tim Lai、Organization Hazelnut Paradise |
| RSS | 已內建 | `/rss.xml` |
| 404 | 已內建 | `404.html`,`noindex` |
| 結構化資料驗證 | 部署後要做 | Google Rich Results Test、Schema.org Validator 跑正式網址(本機未驗證) |
| Search Console + Bing Webmaster | 部署後要做 | 用 DNS TXT 驗證 insyra.me,提交 sitemap-index.xml;Bing 可從 Search Console 匯入 |
| HTTPS | 部署後要做 | Cloudflare Always Use HTTPS |
| www vs apex | Tim 要決定(建議 apex) | 決定後設 301;`SITE_URL` 要一致 |
| 站內連到官網與文件 | 已內建 | header、footer、首頁 hero 都連官網、Docs、GitHub;寫作規範見 CONTENT-GUIDE.md(搜尋意圖標題、每篇連到官方文件) |
| 分類頁 | 已內建 | `/category/<slug>/` 五個分類,含在 sitemap |
| 官網 navbar 與 GitHub README 回連 | Tim 要決定 | 要改官網與 README,需 Tim 另外同意;官網 `#hash` 路由不可動 |
| hreflang(之後 zh-TW) | Tim 要決定 | 內容已按 `posts/en/`、`posts/zh-tw/` 分資料夾,URL `/zh-tw/posts/<slug>/`;加中文時再加 `hreflang="en"`、`"zh-Hant-TW"`、`x-default` 和 sitemap i18n 設定 |
| 圖片 alt | 已內建(寫作時要填) | 範例都有 alt;`coverAlt` 欄位;見 CONTENT-GUIDE.md |
| 轉址 | 部署後要做 | 搬家時的 301 見 DEPLOY.md |
| Core Web Vitals | 已在本機量測 | 見下方 |
| llms.txt | Tim 要決定(選用) | 尚未建立 |

## Lighthouse (local preview, 2026-11-05)

- Home: Perf 100 / A11y 100 / BP 100 / SEO 100 (round 3 editorial style)
- Post: Perf 100 / A11y 100 / BP 100 / SEO 100, LCP 0.8 s, CLS 0.002, TBT 0 ms
