# 部署方案(尚未部署,僅規劃)

> 這份是計畫,沒有部署任何東西,也沒有買網域。Dockerfile 與 `deploy/nginx.conf` 只有寫好,**沒有實際 build 過映像檔(未確認)**。

## 共通設定
- 建置指令:`npm ci && npm run build`
- 輸出目錄:`dist`
- Node:本機用 v24.22.1 測過;Cloudflare Pages 要設環境變數 `NODE_VERSION=24`(Pages 預設版本未確認)
- 網址常數:`src/site.config.ts` 的 `SITE_URL`(現在是 `https://insyra.me`),canonical/OG/JSON-LD/sitemap/RSS/robots.txt 都跟著它
- 404:Astro 會輸出 `dist/404.html`

## 方案一:Cloudflare Pages(建議)
**A. 連 Git(自動部署)**
1. 把專案推到 GitHub(需要 Tim 同意要放哪個 repo,例如 HazelnutParadise/insyra-with-me)
2. Cloudflare 後台 → Workers & Pages → 建立 → Pages → 連接 Git → 選 repo
3. Framework preset 選 Astro;Build command `npm run build`;Output `dist`;環境變數 `NODE_VERSION=24`
4. 之後推 `main` 就自動部署,PR 會有預覽網址

**B. wrangler 直接上傳(不連 Git)**
```sh
npm run build
npx wrangler pages deploy dist --project-name insyra-with-me
```
(第一次要 `npx wrangler login`)

- 快取:`public/_headers` 已設定 `/_astro/*` 為 `max-age=31536000, immutable`(檔名有雜湊,可以長快取)。HTML 用 Pages 預設(未確認具體值)
- 404:Pages 找到 `404.html` 會自動使用
- 優點:免維護主機、免費方案、自動 HTTPS、預覽部署。缺點:綁 Cloudflare

## 方案二:Docker(nginx 靜態映像)+ Cloudflare 代理
```sh
docker build -t insyra-with-me .
docker run -d -p 8080:80 --restart unless-stopped insyra-with-me
```
- `deploy/nginx.conf` 已設好 `/_astro/` 長快取、`try_files`、`error_page 404 /404.html`
- 需要 Tim 自己的主機(和官網同台或另一台,未確認),DNS 用 Cloudflare 橘雲代理;SSL 模式選 Full (strict) 時主機要裝來源憑證(Cloudflare Origin Certificate)
- 優點:和官網部署方式類似、完全自控。缺點:要顧主機、更新、監控

## 網域 insyra.me:Tim 要做的事
1. 自己購買 insyra.me(任一註冊商;Cloudflare Registrar 是否支援 .me 未確認)
2. 把網域加到 Cloudflare(改 nameserver 到 Cloudflare 給的兩組)
3. Pages:專案 → Custom domains → 加 `insyra.me` 和 `www.insyra.me`(Cloudflare 會自動建 DNS 紀錄)
   Docker:建 `A insyra.me → 主機 IP`(橘雲)與 `CNAME www → insyra.me`(橘雲)
4. HTTPS:SSL/TLS 開「Always Use HTTPS」
5. www 轉 apex:Rules → Redirect Rules,`www.insyra.me/*` → `https://insyra.me/${1}`,301,保留查詢字串(主網址用 apex,因為 `SITE_URL` 是 apex)

## 日後搬進官網 /blog
目標:`insyra.me/posts/<slug>` → `https://insyra.hazelnut-paradise.com/blog/<slug>`

1. 先在官網做好 `/blog/<slug>`(獨立預先渲染的入口,由 Go 伺服器先供靜態檔);**官網現有的 `#hash` 路由完全不能動**,`App.vue` 不改,上線前逐一手測現有九個 hash 網址
2. 同一次上線時把 `SITE_URL` 改成 `https://insyra.hazelnut-paradise.com`、路徑前綴改 `/blog`,讓 canonical、sitemap、RSS、JSON-LD 指向新網址
3. 設 301(擇一):
   - Cloudflare Redirect Rules(動態):來源 `http.host eq "insyra.me" and starts_with(http.request.uri.path, "/posts/")`,目標 `concat("https://insyra.hazelnut-paradise.com/blog/", substring(http.request.uri.path, 7))`,301(運算式語法上線前要在後台實測,未確認)
   - 或 Pages `_redirects`:
     ```
     /posts/:slug  https://insyra.hazelnut-paradise.com/blog/:slug  301
     /rss.xml      https://insyra.hazelnut-paradise.com/blog/rss.xml 301
     /             https://insyra.hazelnut-paradise.com/blog/        301
     ```
4. insyra.me 至少保留一年以上繼續轉址(建議值,非實測);Search Console 用「網址變更」工具通報
5. 排名短期會波動,幅度與時間 **未確認**

## 建議
先用 **Cloudflare Pages(連 Git)**:不碰官網、不用主機、HTTPS 與快取都簡單。若 Tim 偏好和官網同一套 Docker 流程,再改方案二。
