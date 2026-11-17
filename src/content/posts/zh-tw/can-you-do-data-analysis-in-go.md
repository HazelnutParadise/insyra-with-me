---
title: "Go 可以做資料分析嗎？4 個 Golang 套件比較，還能直接串 Python"
description: "Go 可以做資料分析，只是套件比較分散。整理 Gonum、Gota、dataframe-go、Insyra 的差異與維護狀況，還有需要 pandas 時怎麼從 Go 直接串接 Python。"
pubDate: 2026-11-18
category: guides
tags: ["faq", "data-analysis", "golang", "dataframe", "pandas", "python", "gonum", "gota", "dataframe-go"]
faq: [{"q": "Go 語言可以做資料分析嗎？", "a": "用 Go 做資料分析是做得到的：讀 CSV、讀 Excel、清資料、分組統計、跑相關和迴歸、畫圖，整段都能寫在 Go 裡，最後編成一個執行檔就能丟到伺服器上跑。真正的問題是 Go 的資料分析套件比較分散，沒有像 Python 那樣「pandas + NumPy + matplotlib」一套大家都在用的組合，第一次找很容易不知道從哪下手。"}, {"q": "Go 資料分析套件有哪些？", "a": "最常見的有 4 個：Gonum 管數值運算，Gota 和 dataframe-go 是比較早期的 DataFrame（資料框）套件，Insyra 則是從表格一路包到統計、圖表和模型。"}, {"q": "Golang 有類似 pandas 的套件嗎？", "a": "有，Go 也有幾個 pandas 替代品，看你要的是哪一種「像」。想要 API 長得跟 pandas 很像，可以看 Gota、dataframe-go 或 gpandas。想要的是「打開來就能讀資料、整理、做摘要、跑統計」那種日常用法，Insyra 比較接近。它不是 pandas 的移植版，函式名稱也沒照抄，而是用 Go 的寫法做同一份工作。我為什麼會想做這個，寫在〈我為什麼要做 Insyra，一個 Go 的「Pandas」〉。"}, {"q": "Go 語言怎麼串 Python？", "a": "用 Insyra 就能直接串，不用換語言：主流程留在 Go，需要 Python 的那一步再呼叫它就好。很多人卡在「某一步只有 Python 有現成的套件」，就乾脆整個專案都改用 Python，其實沒必要。Insyra 有兩條路可以直接串：py：在 Go 裡直接跑 Python。 用 py.RunCodef 執行 Python 程式碼，$v1、$v2… 會換成你從 Go 傳進去的變數。DataTable 傳過去就是 pandas.DataFrame，DataList 就是 pandas.Series。Python 那邊把 pandas 或 polars 的 DataFrame 交給 insyra.Return，回到 Go 就是 DataTable（Series 則變回 DataList）。第一次執行時，它會用 uv 自己建一個 Python 環境，numpy、pandas、polars、scikit-learn、statsmodels、matplotlib 等等都先裝好，不用你自己顧 venv。只是第一次要能連網。 pd：接 gpandas，完全不用 Python。 pd.FromDataTable 把 DataTable 轉成 gpandas 的 DataFrame，ToDataTable 再轉回來。想用 pandas 風格的寫法、又想維持一個執行檔，就走這條。實際的來回轉換我在比較文裡示範過。"}, {"q": "Go 可以讀 Excel 嗎？", "a": "可以，最省事的作法是用 Insyra 一行讀成表格，它底層用的是 Go 處理 Excel 最常見的 Excelize。用 Gota 的話，要先用 Excelize 把每一列讀出來，再丟進 dataframe.LoadRecords；dataframe-go 則是支援匯出 Excel。Insyra 一行就能讀進來：insyra.ReadExcelSheet(\"sales.xlsx\", \"2026\", false, true) 把指定的工作表讀成 DataTable；要寫回去用 dt.ToExcel(\"report.xlsx\", insyra.ExcelWriteOptions{Sheet: \"2026\", SetColNamesToFirstRow: true})（v0.3.5 新增）。有個小地方要注意：v0.3.5 從 Excel 讀進來的儲存格都是字串，我自己寫出去再讀回來確認過，數字欄位記得先轉型再算。"}, {"q": "Go 能做統計和畫圖嗎？", "a": "可以，統計和畫圖在 Go 都有套件，而且這裡是各套件差最多的地方。統計： Gonum 的 stat 有平均、變異數、相關、迴歸、機率分布這些基本功。Insyra 的 stats 直接吃 DataList，另外還有假設檢定、ANOVA、各種迴歸、PCA，README 寫明統計結果有拿 R 對過。 畫圖： gonum/plot 畫靜態圖，go-echarts 畫可以互動的 HTML 圖。Insyra 兩個都有包：gplot 走 gonum/plot，plot 走 go-echarts。 機器學習： Insyra 有 ml（scikit-learn 風格）和 nn（神經網路），README 寫這兩個不需要 Python，也不用 cgo。"}, {"q": "Go 資料分析套件怎麼選？", "a": "看你要做到哪一步：只是要對一串數字做運算、算統計量：Gonum 就很夠。 手上已經有能跑的 Gota 或 dataframe-go 程式碼：可以繼續用，但新專案要先看一下維護狀態。 想要一張表從讀資料、整理、統計一路做到圖表和模型，都留在 Go 裡：Insyra。 某一步非 Python 不可：主流程留在 Go，用 Insyra 的 py 呼叫 pandas 或 polars 那一步就好，不用整個搬家。"}]
draft: false
---

## Go 語言可以做資料分析嗎？可以，而且不用跟 Python 二選一

可以，Go 語言做得了資料分析，而且不必跟 Python 二選一。講到 Go 語言可以做什麼，大家想到的多半是後端 API、微服務、CLI 工具。一講到資料分析，常聽到的回答是「那個去用 Python 啦」。

這個答案只對一半。用 Go 做資料分析是做得到的：讀 CSV、讀 Excel、清資料、分組統計、跑相關和迴歸、畫圖，整段都能寫在 Go 裡，最後編成一個執行檔就能丟到伺服器上跑。真正的問題是 Go 的資料分析套件比較分散，沒有像 Python 那樣「pandas + NumPy + matplotlib」一套大家都在用的組合，第一次找很容易不知道從哪下手。

所以這篇做三件事：整理 Go 資料分析最常被提到的 4 個套件、用同一份資料實際寫一次給你看，再講需要 pandas 的時候怎麼從 Go 直接呼叫 Python。其他套件的狀態都是 2026 年 11 月 17 日到它們的 GitHub 儲存庫跟 README 查的。

## Go 資料分析套件有哪些？4 個 Golang 套件比較

最常見的有 4 個：Gonum 管數值運算，Gota 和 dataframe-go 是比較早期的 DataFrame（資料框）套件，Insyra 則是從表格一路包到統計、圖表和模型。下面分開講。

### Gonum：Go 的數值運算與統計套件

[Gonum](https://github.com/gonum/gonum) 是 Go 的數值運算套件組，矩陣（`mat`）、統計（`stat`）、最佳化、圖論都有。專案很活躍，2026 年 1 月出了 v0.17.0，固定半年發一版。

要注意的是它沒有「表格」這種東西，你拿到的是 `[]float64` 跟矩陣，欄位名稱、文字欄位要自己管。README 上也掛著「unstable」標章，代表改版時 API 可能會動。

### Gota：老牌 Golang DataFrame 套件，但已經封存

[Gota](https://github.com/go-gota/gota) 是 Go 最早期的 DataFrame 套件之一，有 DataFrame、Series、讀 CSV／JSON、篩選、join，還能跟 Gonum 的矩陣互轉。

不過它的儲存庫已經封存（唯讀），最後一個版本是 2021 年 10 月的 v0.12.0，README 到現在還寫著 API「仍在變動，使用風險自負」。舊專案用得好好的可以繼續用，新專案我會建議先想清楚。

### dataframe-go：讀寫格式最多的 Go DataFrame 套件，停在 2021 年

[dataframe-go](https://github.com/rocketlaunchr/dataframe-go) 的強項是讀寫格式：CSV、JSONL、Parquet、MySQL、PostgreSQL 都能進能出，也能匯出 Excel，另外還有內插、時間序列預測、畫圖。統計的部分 README 是叫你搭 Gonum 或 montanaflynn/stats。

它沒有封存，但最後一次 commit 停在 2021 年 10 月，也沒有正式發過版本。README 自己寫 API 還不穩定，建議鎖定某個 commit 再用。

### Insyra：從讀資料、統計到機器學習都在 Go 裡完成

[Insyra](https://github.com/HazelnutParadise/insyra) 的核心是 `DataTable`（一張表）和 `DataList`（一個欄位），旁邊再接統計（`stats`）、圖表（`plot`、`gplot`）、機器學習（`ml`）、神經網路（`nn`），還有等一下會講的 Python 橋接（`py`、`pd`）。目前版本是 2026 年 10 月 24 日釋出的 v0.3.5，MIT 授權。它還在快速改版，用之前記得對一下你那版的文件。

### Go 資料分析套件比較表：功能定位與維護狀態

四個套件的定位和維護狀態整理如下：

| 套件 | 定位 | 有沒有表格結構 | 維護狀態（2026/11/17） |
|---|---|---|---|
| Gonum | 數值運算、統計基礎 | 沒有（slice、矩陣） | 活躍，v0.17.0 |
| Gota | DataFrame | 有 | 已封存，最後版本 2021/10 |
| dataframe-go | DataFrame + 多種讀寫格式 | 有 | 最後 commit 2021/10，無正式版本 |
| Insyra | 表格 + 統計 + 圖表 + 機器學習 + Python 橋接 | 有（DataTable） | 活躍，v0.3.5 |

各家 DataFrame 更細的功能對照（分組、合併、讀寫格式、qframe、gpandas）我另外寫在[〈Insyra vs Gota vs dataframe-go：Go 的 Pandas 替代方案〉](/zh-tw/posts/insyra-vs-gota-vs-dataframe-go/)，這裡就不重貼。

## Golang 有類似 pandas 的套件嗎？

有，Go 也有幾個 pandas 替代品，看你要的是哪一種「像」。

想要 API 長得跟 pandas 很像，可以看 Gota、dataframe-go 或 gpandas。想要的是「打開來就能讀資料、整理、做摘要、跑統計」那種日常用法，Insyra 比較接近。它不是 pandas 的移植版，函式名稱也沒照抄，而是用 Go 的寫法做同一份工作。我為什麼會想做這個，寫在[〈我為什麼要做 Insyra，一個 Go 的「Pandas」〉](/zh-tw/posts/why-i-built-a-pandas-for-go/)。

## 用 Go 做資料分析怎麼寫？Gonum 與 Insyra 範例對照

用 Gonum 是把欄位存成 slice、直接呼叫統計函式；用 Insyra 則是先把資料讀成一張表再跑統計。兩邊算出來的數字一樣，差別在 Insyra 會保留整張表，還會附上檢定結果。

假設你有 8 週的廣告花費跟註冊數，想知道「錢花越多，註冊是不是真的越多」。

**只用 Gonum**，資料就是兩個 slice：

```go
package main

import (
	"fmt"

	"gonum.org/v1/gonum/stat"
)

func main() {
	adSpend := []float64{120, 80, 150, 60, 200, 90, 170, 110}
	signups := []float64{38, 22, 44, 24, 49, 31, 43, 28}

	fmt.Printf("mean signups = %.2f\n", stat.Mean(signups, nil))
	fmt.Printf("r = %.3f\n", stat.Correlation(adSpend, signups, nil))

	alpha, beta := stat.LinearRegression(adSpend, signups, nil, false)
	fmt.Printf("signups ≈ %.2f + %.3f × adSpend\n", alpha, beta)
}
```

```text
mean signups = 34.88
r = 0.943
signups ≈ 10.59 + 0.198 × adSpend
```

很短、很好懂，數字也算出來了。但沒有 p 值，也沒有表格可以看；如果資料還有「廣告管道」這種文字欄位，就得自己另外對齊。

**改用 Insyra**，資料從頭到尾都是一張表，相關和迴歸會順便給你檢定結果：

```go
package main

import (
	"fmt"

	"github.com/HazelnutParadise/insyra"
	"github.com/HazelnutParadise/insyra/stats"
)

const data = `channel,ad_spend,signups
search,120,38
social,80,22
search,150,44
social,60,24
search,200,49
social,90,31
search,170,43
social,110,28`

func main() {
	dt, err := insyra.ReadCSV_StringWithOptions(data, insyra.CSVReadOptions{FirstRowToColNames: true})
	if err != nil {
		panic(err)
	}

	dt.Describe().Show()

	spend := dt.GetColByName("ad_spend")
	signups := dt.GetColByName("signups")

	corr, err := stats.Correlation(spend, signups, stats.PearsonCorrelation)
	if err != nil {
		panic(err)
	}
	fmt.Printf("r = %.3f, p = %.2g\n", corr.Statistic, corr.PValue)

	reg, err := stats.LinearRegression(signups, spend)
	if err != nil {
		panic(err)
	}
	fmt.Printf("signups ≈ %.2f + %.3f × ad_spend (R² = %.3f, slope p = %.2g)\n",
		reg.Intercept, reg.Slope, reg.RSquared, reg.PValue)
}
```

```text
DataTable (12 rows x 2 columns)
================================================================================
 stat: A(mean=88.41, range=[0.00, 200.00]) B(mean=25.41, range=[0.00, 49.00]) 
--------------------------------------------------------------------------------
RowNames     A(ad_spend)  B(signups) 
------------ ------------ -----------
0: count               8           8 
1: missing             0           0 
2: unique    nil          nil        
3: top       nil          nil        
4: freq      nil          nil        
5: mean            122.5      34.875 
6: std           47.7344     10.0348 
7: min                60          22 
8: 25%              87.5          27 
9: 50%               115        34.5 
10: 75%              155       43.25 
11: max              200          49 

r = 0.943, p = 0.00044
signups ≈ 10.59 + 0.198 × ad_spend (R² = 0.890, slope p = 0.00044)
```

`Describe` 就是 pandas 的 `df.describe()`，文字欄位 `channel` 預設會略過（想保留就加 `DescribeOptions{IncludeAll: true}`）。兩邊算出來的相關係數、截距、斜率完全一樣，這也算是互相驗算。以上兩支程式都用 Go 1.27.3 實際跑過，版本是 `gonum.org/v1/gonum` v0.17.0 和 `github.com/HazelnutParadise/insyra` v0.3.5。第一次用 Insyra 的話，可以先看[〈用 Insyra 在 Go 裡做第一次資料分析〉](/zh-tw/posts/first-data-analysis-in-go-with-insyra/)，從讀 CSV 一路做到存檔。

## Go 語言怎麼串 Python？用 Insyra 在 Go 裡呼叫 pandas、polars

用 Insyra 就能直接串，不用換語言：主流程留在 Go，需要 Python 的那一步再呼叫它就好。很多人卡在「某一步只有 Python 有現成的套件」，就乾脆整個專案都改用 Python，其實沒必要。Insyra 有兩條路可以直接串：

- **`py`：在 Go 裡直接跑 Python。** 用 `py.RunCodef` 執行 Python 程式碼，`$v1`、`$v2`… 會換成你從 Go 傳進去的變數。`DataTable` 傳過去就是 `pandas.DataFrame`，`DataList` 就是 `pandas.Series`。Python 那邊把 pandas 或 polars 的 DataFrame 交給 `insyra.Return`，回到 Go 就是 `DataTable`（Series 則變回 `DataList`）。第一次執行時，它會用 uv 自己建一個 Python 環境，numpy、pandas、polars、scikit-learn、statsmodels、matplotlib 等等都先裝好，不用你自己顧 venv。只是第一次要能連網。
- **`pd`：接 gpandas，完全不用 Python。** `pd.FromDataTable` 把 `DataTable` 轉成 [gpandas](https://github.com/apoplexi24/gpandas) 的 DataFrame，`ToDataTable` 再轉回來。想用 pandas 風格的寫法、又想維持一個執行檔，就走這條。實際的來回轉換我在[比較文](/zh-tw/posts/insyra-vs-gota-vs-dataframe-go/)裡示範過。

拿剛剛那份廣告資料走一次 `py`：Go 讀資料，丟給 pandas 算「每 100 元帶來幾個註冊」再依管道分組，結果再拿回 Go：

```go
package main

import (
	"github.com/HazelnutParadise/insyra"
	"github.com/HazelnutParadise/insyra/py"
)

const data = `channel,ad_spend,signups
search,120,38
social,80,22
search,150,44
social,60,24
search,200,49
social,90,31
search,170,43
social,110,28`

func main() {
	dt, err := insyra.ReadCSV_StringWithOptions(data, insyra.CSVReadOptions{FirstRowToColNames: true})
	if err != nil {
		panic(err)
	}

	// $v1 進到 Python 就是 pandas.DataFrame，
	// 丟給 insyra.Return 的 DataFrame 回到 Go 會變成 DataTable。
	var byChannel *insyra.DataTable
	err = py.RunCodef(&byChannel, `
df = $v1
df["signups_per_100"] = df["signups"] / df["ad_spend"] * 100
insyra.Return(df.groupby("channel")[["ad_spend", "signups_per_100"]].mean().round(2))
`, dt)
	if err != nil {
		panic(err)
	}

	byChannel.Show()
}
```

```text
DataTable (2 rows x 2 columns)
================================================================================
 stat: A(mean=122.50, range=[85.00, 160.00]) B(mean=29.77, range=[27.70, 31.85]) 
--------------------------------------------------------------------------------
RowNames    A(ad_spend)  B(signups_per_100) 
----------- ------------ -------------------
0: search           160                27.7 
1: social            85               31.85
```

結果滿有意思的：搜尋廣告預算比較多，但社群廣告每 100 元帶來的註冊反而比較多。回來的 `byChannel` 就是一般的 `DataTable`，後面要跑統計、畫圖、`ToExcel` 匯出，都繼續在 Go 裡做。這段我用 Insyra v0.3.5 實際跑過，它自動建的環境是 Python 3.12、pandas 3.1.1、polars 2.1.0；另外也測過從 Python 回傳 polars 的 DataFrame，一樣會變成 `DataTable`。

老實講兩個限制：每次呼叫都是另外開一個 Python 行程，資料透過本機 IPC 傳過去，所以適合拿來做「某一步」，不適合塞在很密的迴圈裡。另外，如果你的工作主要是在 notebook 裡邊看邊試，Jupyter 加 pandas 還是最順手的。等分析要變成正式程式（API 服務、CLI、排程任務、一個執行檔帶著走），Go 的優勢才會出來。

## Go 可以讀 Excel 嗎？

可以，最省事的作法是用 Insyra 一行讀成表格，它底層用的是 Go 處理 Excel 最常見的 [Excelize](https://github.com/qax-os/excelize)。用 Gota 的話，要先用 Excelize 把每一列讀出來，再丟進 `dataframe.LoadRecords`；dataframe-go 則是支援匯出 Excel。

Insyra 一行就能讀進來：`insyra.ReadExcelSheet("sales.xlsx", "2026", false, true)` 把指定的工作表讀成 `DataTable`；要寫回去用 `dt.ToExcel("report.xlsx", insyra.ExcelWriteOptions{Sheet: "2026", SetColNamesToFirstRow: true})`（v0.3.5 新增）。有個小地方要注意：v0.3.5 從 Excel 讀進來的儲存格都是字串，我自己寫出去再讀回來確認過，數字欄位記得先轉型再算。

## Go 能做統計和畫圖嗎？

可以，統計和畫圖在 Go 都有套件，而且這裡是各套件差最多的地方。

- **統計：** Gonum 的 `stat` 有平均、變異數、相關、迴歸、機率分布這些基本功。Insyra 的 `stats` 直接吃 `DataList`，另外還有假設檢定、ANOVA、各種迴歸、PCA，README 寫明統計結果有拿 R 對過。
- **畫圖：** [gonum/plot](https://github.com/gonum/plot) 畫靜態圖，[go-echarts](https://github.com/go-echarts/go-echarts) 畫可以互動的 HTML 圖。Insyra 兩個都有包：`gplot` 走 gonum/plot，`plot` 走 go-echarts。
- **機器學習：** Insyra 有 `ml`（scikit-learn 風格）和 `nn`（神經網路），README 寫這兩個不需要 Python，也不用 cgo。

## Go 資料分析套件怎麼選？我的建議

看你要做到哪一步：

- 只是要對一串數字做運算、算統計量：**Gonum** 就很夠。
- 手上已經有能跑的 Gota 或 dataframe-go 程式碼：可以繼續用，但新專案要先看一下維護狀態。
- 想要一張表從讀資料、整理、統計一路做到圖表和模型，都留在 Go 裡：**Insyra**。
- 某一步非 Python 不可：主流程留在 Go，用 Insyra 的 `py` 呼叫 pandas 或 polars 那一步就好，不用整個搬家。

## 用 Go 做資料分析遇到問題？歡迎來 GitHub 開 issue

歡迎到 GitHub [開一個 issue](https://github.com/HazelnutParadise/insyra/issues)：不管是我對 Gonum、Gota、dataframe-go 哪裡寫錯，還是你用 Go 做資料分析時發現 Insyra 少了什麼。回報 bug、許願新功能、問「這個要怎麼寫」都可以，我都會看。

儲存庫：https://github.com/HazelnutParadise/insyra · 文件：https://hazelnutparadise.github.io/insyra/（[DataTable](https://hazelnutparadise.github.io/insyra/#/DataTable)、[DataList](https://hazelnutparadise.github.io/insyra/#/DataList)）· 官網：https://insyra.hazelnut-paradise.com
