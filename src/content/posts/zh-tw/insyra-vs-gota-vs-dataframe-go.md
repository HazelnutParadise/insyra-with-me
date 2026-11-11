---
title: "Insyra vs Gota vs dataframe-go：Go 的 Pandas 替代方案"
description: "在找 Golang 的 pandas 替代方案？老實比較 Gota、dataframe-go、qframe、gpandas 和 Insyra：能做什麼、還有沒有在維護、什麼情況該選哪個。"
pubDate: 2026-11-18
category: guides
tags: ["comparison", "dataframe", "pandas", "gota", "dataframe-go", "qframe", "gpandas"]
draft: false
---

## 先講結論

如果你在找 Golang 的 pandas 替代方案，會一直看到幾個名字：Gota、dataframe-go、qframe、gpandas，還有（嗨）我自己做的 Insyra。它們想做的事不完全一樣，所以「哪個最好」其實問錯了，該問的是「哪個適合我手上這件事」。

一段話版本：如果你只需要一個快速、不可變的資料表來篩選和分組，qframe 就很好用。如果你想要最像 pandas 的 API，可以看 gpandas（而且 Insyra 可以跟它互通）。如果分析不會停在資料表，還要繼續做統計、圖表、模型和神經網路，那就是我做 Insyra 要解決的事。Gota 和 dataframe-go 對 Go 的資料處理貢獻很大，但要用它們開新專案之前，先看一下下面寫的專案狀態。

這篇的所有內容，都在 2026 年 11 月 12 日對照過各專案的儲存庫和 README。沒有效能比較，因為我沒有跑過公平的測試，編出來的圖表對誰都沒幫助。

## 參賽者

**[Gota](https://github.com/go-gota/gota)** 是最有名的 Go DataFrame 函式庫（GitHub 大約 3.3k 顆星）。它有 DataFrame 和 Series、可以讀 CSV 和 JSON、篩選、`GroupBy` 加彙總、用 `Arrange` 排序、join，還能跟 gonum 矩陣互轉。這個儲存庫在 GitHub 上已經封存（唯讀）。最後一個版本是 2021 年 10 月的 v0.12.0，README 也寫著 API「仍在變動，*使用風險自負*」。很多 Go 程式（包括我）都是從 Gota 學會 DataFrame 的。

**[dataframe-go](https://github.com/rocketlaunchr/dataframe-go)**（rocketlaunchr）是老一輩函式庫裡 I/O 支援最廣的：CSV、JSONL、Parquet、MySQL、PostgreSQL 都能讀寫，還能匯出 Excel。它也有內插、時間序列預測（SES、Holt-Winters），以及透過 go-chart 畫圖。統計的部分，README 建議你用 gonum 或 montanaflynn/stats。它沒有封存，但最後一次 commit 是 2021 年 10 月，也沒有任何標記版本。README 提醒 API 還不穩定，建議鎖定某個 commit。

**[qframe](https://github.com/tobgu/qframe)** 是不可變的資料表：每個操作都會回傳新的 QFrame，原本的不會被改到，底層資料能共用就共用。它可以讀寫 CSV、以紀錄為單位的 JSON，以及任何 `database/sql` 支援的資料庫，能做篩選、分組、彙總和欄位運算式。錯誤處理也很順：出錯時會在 frame 上設定 `Err`，後面的操作就不會執行。最後一次 commit 是 2024 年 7 月，join 則列在「未來可以做的事」裡。

**[gpandas](https://github.com/apoplexi24/gpandas)** 是這幾個裡最新、也最像 pandas 的。它用泛型打造，有 `Loc`／`iLoc` 索引、merge、分組彙總、滾動視窗、`Describe()`，能讀 CSV、JSON、Excel、Parquet、SQL 和 BigQuery，還能用 go-echarts 畫圖。最後一次 commit 是 2026 年 9 月 30 日。

**[Insyra](https://github.com/HazelnutParadise/insyra)** 是我做的，所以看這段的時候請記得這一點。它的核心型別是 `DataList`（一個欄位）和 `DataTable`（由欄位組成的表）。圍繞它們的是各自獨立的套件：統計、圖表、機器學習和神經網路。目前的版本是 v0.3.5「Huashan」（2026 年 10 月 24 日），MIT 授權。README 很老實地寫著它還在快速演進，所以請查你所用版本的文件。

## Golang dataframe 函式庫比較表

✅ = 專案的 README 或文件裡有寫。「文件未提及」代表我在那裡找不到，不代表做不到。

| | Gota | dataframe-go | qframe | gpandas（v0.6.0） | Insyra（v0.3.5） |
|---|---|---|---|---|---|
| 儲存庫狀態（2026/11/12） | 已封存 | 未封存；最後 commit 2021/10 | 未封存；最後 commit 2024/07 | 活躍；最後 commit 2026/09 | 活躍；2026/10 發布 |
| 授權 | Apache-2.0 | MIT | MIT | Apache-2.0 | MIT |
| 核心型別 | DataFrame、Series | DataFrame、Series | QFrame（不可變） | DataFrame、Series | DataTable、DataList |
| CSV | ✅ | ✅ | ✅ | ✅ | ✅ |
| JSON | ✅（讀取） | ✅（JSONL） | ✅ | ✅ | ✅ |
| Excel | 文件未提及 | ✅（匯出） | 文件未提及 | ✅ | ✅ |
| Parquet | 文件未提及 | ✅ | 文件未提及 | ✅ | ✅（`parquet`） |
| SQL 資料庫 | 文件未提及 | ✅（MySQL、PostgreSQL） | ✅（`database/sql`） | ✅（＋BigQuery） | ✅（透過 GORM） |
| 分組＋彙總 | ✅ | 文件未提及 | ✅ | ✅ | ✅ |
| Join／merge | ✅ | 文件未提及 | 列為未來工作 | ✅ | ✅ |
| 統計 | 彙總 | 透過 gonum／montanaflynn/stats | 彙總 | 摘要統計（`Describe`、偏態、峰態…） | 假設檢定、ANOVA、迴歸、PCA…（`stats`） |
| 圖表 | 文件未提及 | ✅（go-chart） | 文件未提及 | ✅（go-echarts） | ✅（`plot`：go-echarts，`gplot`：gonum/plot） |
| 機器學習 | 文件未提及 | 文件未提及 | 文件未提及 | 文件未提及 | ✅（`ml`） |
| 神經網路 | 文件未提及 | 文件未提及 | 文件未提及 | 文件未提及 | ✅（`nn`） |

## 什麼時候其他選擇更好

我寧願你選對工具，也不要硬選我的：

- **你要不可變、API 小巧。** qframe「每個操作都回傳新 frame」的設計，在並行程式裡很好推敲，而且它的 README 把效能列為設計目標。如果你要做的就是篩選、分組、彙總、輸出，它很合適。
- **你習慣用 pandas 的方式思考。** gpandas 刻意照著 pandas 的命名和行為走（`Loc`、`iLoc`、merge 的 `_x`／`_y` 後綴、ddof=1 的標準差）。如果你要一行一行移植 notebook，這種熟悉感很值錢。
- **你手上有能正常運作的 Gota 程式。** 封存不代表壞掉，而是代表下次壞掉時沒人會修。如果是新專案，我會從還有在維護的開始。
- **你需要 dataframe-go 的預測或內插工具。** README 裡都有。記得照 README 自己建議的，鎖定一個 commit。

## Insyra 在 DataFrame 之外還能做什麼

這是我最在意的部分，也是我不把 Insyra 說成「Go 版的 pandas 加 scikit-learn」的原因。資料表只是開始，同一個 module 會接著處理後面的步驟。每一步都是獨立的套件，用到什麼才匯入什麼。

下面的程式碼都用 `github.com/HazelnutParadise/insyra@v0.3.5` 和 Go 1.27.3 編譯過，用 `CGO_ENABLED=0` 也能編譯。

**統計（`stats`）。** 假設檢定、ANOVA、迴歸、PCA、因素分析、分群等等。README 寫明統計結果都對照過 R。

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

**圖表（`plot` 和 `gplot`）。** `plot` 用 go-echarts 做互動圖表，可以存成 HTML。`gplot` 用 gonum/plot 做靜態圖表（PNG、PDF、SVG），不需要 Chrome。

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

**機器學習（`ml`）和神經網路（`nn`）。** `ml` 提供 scikit-learn 風格的迴歸、決策樹、隨機森林、梯度提升、pipeline、交叉驗證、網格搜尋，還能匯出 ONNX。`nn` 用自動微分 tape 和 `Sequential` 層 API 訓練網路，也能執行公開的 ONNX 模型。README 寫明這兩個套件都不需要 Python 執行環境，也不用 cgo。

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

還有很多這裡不一一列出（Parquet 串流、CCL 欄位公式、附 REPL 的 CLI，以及真的需要 Python 時可以用的 `py` 套件）。全部都在[文件](https://hazelnutparadise.github.io/insyra/)裡。

## Insyra 和 gpandas：是朋友，不是對手

Insyra 有一個 `pd` 套件，是包在 gpandas 外面的一層薄薄的封裝（Insyra 目前的 `go.mod` 用的是 v0.6.0）。它能把 Insyra 的 `DataTable` 轉成 gpandas 的 `DataFrame`，再轉回來，欄位順序和列名稱都會保留。`FromGPandasDataFrame` 和 `FromGPandasSeries` 則可以把你手上已經有的 gpandas 物件包起來。

所以你不用二選一：喜歡 gpandas 那套 pandas 風格 API 的地方就用它，要做 `stats`、`plot` 或 `ml` 時再轉回 `DataTable`。先講清楚，DataFrame 的方法是 gpandas 的，不是 Insyra 的。功勞歸 [apoplexi24](https://github.com/apoplexi24/gpandas)。

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

## 我會怎麼選

- 篩選、分組、輸出，而且想要不可變：**qframe**。
- 要移植 pandas 程式，想用一樣的命名：**gpandas**。
- 分析還要繼續做統計、圖表、模型或神經網路，而且希望全部在同一個 Go module 裡：**Insyra**。這就是我一直卡住的地方，也是[我做它的原因](/zh-tw/posts/why-i-built-a-pandas-for-go/)。
- 要用 Gota 或 dataframe-go 開新專案：先看一下儲存庫的狀態。

## 試試看

如果你想先看 Insyra 處理一份真實（但很小）的資料，[用 Insyra 在 Go 裡做第一次資料分析](/zh-tw/posts/first-data-analysis-in-go-with-insyra/)會帶你在一支程式裡完成讀入、加欄位、分組、排序和存檔。

```sh
go get github.com/HazelnutParadise/insyra/allpkgs
```

儲存庫：https://github.com/HazelnutParadise/insyra · 文件：https://hazelnutparadise.github.io/insyra/ · 如果我對哪個函式庫的描述有錯，在 X 上跟我說（[@TimLai666](https://x.com/TimLai666)），我會修正。
