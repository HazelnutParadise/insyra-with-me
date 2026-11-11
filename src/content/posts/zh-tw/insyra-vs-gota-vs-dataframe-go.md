---
title: "Insyra vs Gota vs dataframe-go：Go 的 Pandas 替代方案"
description: "想找 Golang 的 pandas 替代品？我把 Gota、dataframe-go、qframe、gpandas 和 Insyra 擺在一起看：各自會什麼、還有沒有人維護、什麼情況選哪個。"
pubDate: 2026-11-18
category: guides
tags: ["comparison", "dataframe", "pandas", "gota", "dataframe-go", "qframe", "gpandas"]
draft: false
---

## 先講結論

在 Go 裡找 pandas 的替代品，翻來翻去大概就是這幾個：Gota、dataframe-go、qframe、gpandas，還有我自己做的 Insyra（嗨）。這幾套想解決的問題不太一樣，所以與其問「哪個最好」，不如問「我現在手上這件事該用哪個」。

懶得看完的話，結論是這樣：

- 只需要一個快、不可變的資料表來篩選、分組，qframe 就很夠用。
- 想要 API 長得最像 pandas，去看 gpandas（Insyra 也能跟它互轉）。
- 分析不會停在資料表，後面還要接統計、畫圖、模型、神經網路，這就是我做 Insyra 想解決的事。
- Gota 和 dataframe-go 對 Go 的資料處理幫助很大，不過要拿來開新專案，先看一下下面寫的專案狀態。

文中寫到的東西，我都在 2026 年 11 月 12 日一個一個對過各專案的儲存庫和 README。這篇沒有效能比較：我沒跑過公平的測試，隨便生一張圖出來，對誰都沒好處。

## 這次比的五套

**[Gota](https://github.com/go-gota/gota)** 大概是 Go 最有名的 DataFrame 函式庫，GitHub 上約 3.3k 顆星。DataFrame、Series 都有，能讀 CSV 和 JSON，篩選、`GroupBy` 加彙總、用 `Arrange` 排序、join 都做得到，也能跟 gonum 的矩陣互轉。

不過這個儲存庫在 GitHub 上已經封存，變成唯讀了。最後一版是 2021 年 10 月的 v0.12.0，README 也寫著 API 還在變動，「*使用風險自負*」。很多 Go 工程師（包括我）都是靠 Gota 認識 DataFrame 的。

**[dataframe-go](https://github.com/rocketlaunchr/dataframe-go)**（rocketlaunchr 做的）是老牌函式庫裡 I/O 最齊的一套：CSV、JSONL、Parquet、MySQL、PostgreSQL 都能讀也能寫，還能匯出 Excel。另外有內插、時間序列預測（SES、Holt-Winters），也能接 go-chart 畫圖。統計的部分，README 直接建議你用 gonum 或 montanaflynn/stats。

它沒有封存，但最後一次 commit 停在 2021 年 10 月，而且一個標記版本都沒有。README 也提醒 API 還不穩定，建議鎖定某個 commit 來用。

**[qframe](https://github.com/tobgu/qframe)** 主打不可變：每做一次操作都會拿到一個新的 QFrame，原本那份不會被動到，底層資料能共用就共用。它能讀寫 CSV、以紀錄為單位的 JSON，還有任何 `database/sql` 接得上的資料庫；篩選、分組、彙總、欄位運算式也都有。

它的錯誤處理我很喜歡：出錯時會把 `Err` 設在 frame 上，後面的操作就直接不跑。最後一次 commit 在 2024 年 7 月，join 則還列在「之後可以做的事」裡。

**[gpandas](https://github.com/apoplexi24/gpandas)** 是裡面最新、也最有 pandas 味的一套。它用泛型寫成，有 `Loc`／`iLoc` 索引、merge、分組彙總、滾動視窗、`Describe()`，能讀 CSV、JSON、Excel、Parquet、SQL 和 BigQuery，畫圖用的是 go-echarts。最後一次 commit 是 2026 年 9 月 30 日。

**[Insyra](https://github.com/HazelnutParadise/insyra)** 是我做的，這段請自己打個折。它的核心是兩個型別：`DataList`（一欄）和 `DataTable`（好幾欄組成的表）。統計、圖表、機器學習、神經網路各是一個獨立套件，全都圍著這兩個型別轉。

目前最新版是 2026 年 10 月 24 日的 v0.3.5「Huashan」，MIT 授權。README 有老實寫它還在快速演進，所以用的時候，請以你那個版本的文件為準。

## Golang dataframe 函式庫，一張表看完

✅ 表示專案的 README 或文件裡有寫到。「說明裡沒寫」是我在那裡找不到，不代表它做不到。

| | Gota | dataframe-go | qframe | gpandas（v0.6.0） | Insyra（v0.3.5） |
|---|---|---|---|---|---|
| 專案狀態（2026/11/12） | 已封存 | 沒封存，最後 commit 2021/10 | 沒封存，最後 commit 2024/07 | 持續更新，最後 commit 2026/09 | 持續更新，2026/10 出新版 |
| 授權 | Apache-2.0 | MIT | MIT | Apache-2.0 | MIT |
| 核心型別 | DataFrame、Series | DataFrame、Series | QFrame（不可變） | DataFrame、Series | DataTable、DataList |
| CSV | ✅ | ✅ | ✅ | ✅ | ✅ |
| JSON | ✅（讀） | ✅（JSONL） | ✅ | ✅ | ✅ |
| Excel | 說明裡沒寫 | ✅（匯出） | 說明裡沒寫 | ✅ | ✅ |
| Parquet | 說明裡沒寫 | ✅ | 說明裡沒寫 | ✅ | ✅（`parquet`） |
| SQL 資料庫 | 說明裡沒寫 | ✅（MySQL、PostgreSQL） | ✅（`database/sql`） | ✅（＋BigQuery） | ✅（用 GORM） |
| 分組＋彙總 | ✅ | 說明裡沒寫 | ✅ | ✅ | ✅ |
| Join／merge | ✅ | 說明裡沒寫 | 列在之後要做 | ✅ | ✅ |
| 統計 | 彙總 | 建議用 gonum／montanaflynn/stats | 彙總 | 摘要統計（`Describe`、偏態、峰態…） | 假設檢定、ANOVA、迴歸、PCA…（`stats`） |
| 圖表 | 說明裡沒寫 | ✅（go-chart） | 說明裡沒寫 | ✅（go-echarts） | ✅（`plot`：go-echarts，`gplot`：gonum/plot） |
| 機器學習 | 說明裡沒寫 | 說明裡沒寫 | 說明裡沒寫 | 說明裡沒寫 | ✅（`ml`） |
| 神經網路 | 說明裡沒寫 | 說明裡沒寫 | 說明裡沒寫 | 說明裡沒寫 | ✅（`nn`） |

## 這些情況，用別人的比較好

我寧可你挑對工具，也不要你硬用我的：

- **想要不可變、API 又小。** qframe 每個操作都回傳新的 frame，寫並行程式時比較好想清楚，README 也把效能列為設計目標。如果你要做的就是篩選、分組、彙總、輸出，用它剛剛好。
- **腦袋裡想的是 pandas 的寫法。** gpandas 刻意跟著 pandas 的命名和行為走（`Loc`、`iLoc`、merge 的 `_x`／`_y` 後綴、ddof=1 的標準差）。要把 notebook 一行一行搬過來，這種熟悉感很省事。
- **手上已經有跑得好好的 Gota 程式。** 封存不代表壞了，只是下次壞掉的時候不會有人修。要是開新專案，我會挑還有人在維護的。
- **需要 dataframe-go 的預測或內插。** README 裡都有。記得照它自己的建議，鎖定一個 commit。

## 資料表之後，Insyra 還能接著做什麼

這段才是我最在意的。用「Go 的 pandas 加 scikit-learn」來當短介紹沒問題，不過資料表只是起點。後面的統計、圖表、機器學習、神經網路，都在同一個 module 裡接著做就好，要用哪個套件再匯入哪個。

下面的程式碼都用 `github.com/HazelnutParadise/insyra@v0.3.5` 和 Go 1.27.3 編譯過，設 `CGO_ENABLED=0` 也編得過。

**統計（`stats`）。** 假設檢定、ANOVA、迴歸、PCA、因素分析、分群都有。README 寫明統計結果都跟 R 對過。

```go
before := insyra.NewDataList(12.1, 11.8, 13.0, 12.6, 12.2, 11.9)
after := insyra.NewDataList(13.4, 12.9, 13.8, 13.1, 13.6, 12.8)

res, err := stats.TwoSampleTTest(before, after, false) // false = Welch's t-test
if err != nil {
	panic(err)
}
fmt.Printf("t = %.3f, p = %.4f\n", res.Statistic, res.PValue)
// t = -4.053, p = 0.0024
```

**圖表（`plot` 和 `gplot`）。** 要互動圖表就用 `plot`，底層是 go-echarts，可以存成 HTML。要靜態圖（PNG、PDF、SVG）就用 `gplot`，底層是 gonum/plot，不用裝 Chrome。

```go
sales := insyra.NewDataList(960, 520, 520).SetName("Revenue")

chart := plot.CreateBarChart(plot.BarChartConfig{
	Title: "Revenue by region",
	XAxis: []string{"East", "North", "South"},
}, sales)

if err := plot.SaveHTML(chart, "revenue.html"); err != nil {
	panic(err)
}
```

**機器學習（`ml`）和神經網路（`nn`）。** `ml` 走 scikit-learn 那套路子：迴歸、決策樹、隨機森林、梯度提升、pipeline、交叉驗證、網格搜尋都有，還能匯出 ONNX。`nn` 有自動微分 tape，加上 `Sequential` 這種一層一層疊起來的 API，可以自己訓練網路，也能跑公開的 ONNX 模型。照 README 的說法，這兩個套件都不需要 Python 執行環境，也不用 cgo。

```go
x := insyra.NewDataTable(
	insyra.NewDataList(1, 2, 3, 10, 11, 12).SetName("visits"),
	insyra.NewDataList(0, 1, 0, 5, 6, 4).SetName("purchases"),
)
y := insyra.NewDataList("browse", "browse", "browse", "buy", "buy", "buy")

tree, err := ml.FitDecisionTreeClassifier(x, y, ml.DecisionTreeOptions{MaxDepth: 2})
if err != nil {
	panic(err)
}
pred, _ := tree.Predict(x)
fmt.Println(pred.Data()) // [browse browse browse buy buy buy]

// 神經網路也在同一個 module，一樣是 Go：
tape := nn.NewTape(42)
model, err := nn.NewSequential(tape,
	nn.Dense(784, 128), nn.ReLU(), nn.Dropout(0.2), nn.Dense(128, 10),
)
```

還有很多沒寫進來：Parquet 串流、CCL 欄位公式、附 REPL 的 CLI，還有真的非用 Python 不可時可以用的 `py` 套件。這些全都在[文件](https://hazelnutparadise.github.io/insyra/)裡。

## Insyra 和 gpandas 不是對手，是隊友

Insyra 有個 `pd` 套件，就是包在 gpandas 外面薄薄的一層（Insyra 現在的 `go.mod` 用的是 v0.6.0）。它可以把 Insyra 的 `DataTable` 轉成 gpandas 的 `DataFrame`，也能再轉回來，欄位順序和列名稱都會留著。手上已經有 gpandas 物件的話，用 `FromGPandasDataFrame` 和 `FromGPandasSeries` 包一下就好。

所以不用二選一。喜歡 gpandas 那套 pandas 風格的 API，那部分就用它寫；要跑 `stats`、`plot` 或 `ml` 的時候，再轉回 `DataTable`。先說清楚：DataFrame 那些方法是 gpandas 的，不是 Insyra 的，功勞是 [apoplexi24](https://github.com/apoplexi24/gpandas) 的。

```go
dt := insyra.NewDataTable(
	insyra.NewDataList("Alice", "Bob").SetName("name"),
	insyra.NewDataList(30, 25).SetName("age"),
)

df, err := pd.FromDataTable(dt) // Insyra -> gpandas
if err != nil {
	panic(err)
}
fmt.Println(df.String()) // String() 是 gpandas 自己的方法

back, err := df.ToDataTable() // gpandas -> Insyra
if err != nil {
	panic(err)
}
back.Show()
```

## 我自己會這樣選

- 篩選、分組、輸出，想要不可變：**qframe**。
- 要搬 pandas 程式，想沿用一樣的命名：**gpandas**。
- 分析後面還要接統計、圖表、模型或神經網路，而且想在同一個 Go module 裡全部搞定：**Insyra**。這正是我以前一直卡住的地方，也是[我做它的原因](/zh-tw/posts/why-i-built-a-pandas-for-go/)。
- 想拿 Gota 或 dataframe-go 開新專案：先去看一下儲存庫的狀態。

## 動手試試

想先看 Insyra 處理一份真的（但很小的）資料，可以看[用 Insyra 在 Go 裡做第一次資料分析](/zh-tw/posts/first-data-analysis-in-go-with-insyra/)：一支程式從讀檔、加欄位、分組、排序，一路做到存檔。

```sh
go get github.com/HazelnutParadise/insyra/allpkgs
```

儲存庫：https://github.com/HazelnutParadise/insyra · 文件：https://hazelnutparadise.github.io/insyra/ · 要是我哪個函式庫寫錯了，來 X 跟我說（[@TimLai666](https://x.com/TimLai666)），我會改。
