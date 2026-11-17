---
title: "Go 能不能做資料分析？一篇老實講的 FAQ"
description: "Go 可以做資料分析。Gonum、Gota、dataframe-go、Insyra 各自負責哪一塊、哪個 Golang dataframe 套件還有人維護、什麼時候還是 Python 比較好，一次講清楚。"
pubDate: 2026-11-18
category: guides
tags: ["faq", "data-analysis", "golang", "dataframe", "pandas", "gonum", "gota", "dataframe-go"]
faq: [{"q": "Go 能不能做資料分析？", "a": "可以。用 Go 做資料分析是玩真的：讀 CSV 或 Excel、清資料、分組、跑檢定或迴歸、畫圖，整個流程都能在 Go 裡完成，最後還能包成一個執行檔丟出去。但老實說，Go 的資料生態圈比 Python 小，工具也散在好幾個套件裡，不像 Python 有一套大家默契都很好的組合。所以真正該問的不是「能不能」，而是「哪個套件負責哪一塊」。這篇 FAQ 就是在回答這件事。先自首：其中一個套件 Insyra 是我做的，看的時候請自己打個折，不過我盡量對其他套件公平。下面講到別人專案的內容，都是 2026 年 11 月 17 日從它們自己的 GitHub 儲存庫和 README 查來的。"}, {"q": "Go 資料分析要用哪個套件？", "a": "沒有一個通吃的答案，因為它們本來就不是在做同一件事。如果你只是要對一串數字做運算，Gonum 很難打。如果你要的是一張表，加上表之後的分析，那正是我做 Insyra 想補的那一塊。"}, {"q": "Golang 有類似 pandas 的套件嗎？", "a": "有，但要看你說的「pandas」是哪個意思。如果是「API 名字長得像 pandas 的 DataFrame」，可以看 Gota、dataframe-go 和 gpandas。如果是「打開來就能讀資料、清資料、做摘要、建模型的那個東西」，那比較接近我做 Insyra 的目標。它不是 pandas 移植版，也沒有照抄 API，做的是同一份工作，只是用 Go 的方式寫。這部分我在〈我為什麼要做 Insyra，一個 Go 的「Pandas」〉講比較多。"}, {"q": "Golang dataframe 套件該選哪個？", "a": "如果是 2026 年要開新專案，我會先挑還有人維護、而且有正式版本可以鎖的套件。封存不代表壞掉，手上能跑的 Gota 程式碼可以繼續用；只是之後哪裡壞了，不會有人來修。"}, {"q": "Go 可以把 Excel 讀成 DataFrame 嗎？", "a": "可以。Go 處理 Excel 檔最常用的是 Excelize，Insyra 底層用的也是它。用 Gota 的話，要先用 Excelize 自己把每一列讀出來，再丟給 dataframe.LoadRecords。dataframe-go 則是把 Excel 列在匯出格式裡。在 Insyra 裡一行就好：insyra.ReadExcelSheet(\"sales.xlsx\", \"2026\", false, true) 把一個工作表讀成 DataTable，dt.ToExcel(\"report.xlsx\", insyra.ExcelWriteOptions{Sheet: \"2026\", SetColNamesToFirstRow: true}) 再寫回去（v0.3.5 新增）。v0.3.5 有個地方要注意：從 Excel 讀進來的儲存格都是字串（我實際寫出去再讀回來確認過），數字欄位要先轉型再計算。"}, {"q": "Go 能做統計跟畫圖嗎？還是只能處理表格？", "a": "可以，而且這裡正是各套件差最多的地方。統計： Gonum 的 stat 套件有基本款（平均、變異數、相關、迴歸、機率分布）。Insyra 的 stats 直接吃 DataList，再加上假設檢定、ANOVA、各種迴歸、PCA 等等，README 寫明統計結果有拿 R 來對過。 圖表： gonum/plot 畫靜態圖，go-echarts 畫可以互動的 HTML 圖。Insyra 兩個都有包：gplot 用 gonum/plot，plot 用 go-echarts。 模型： Insyra 有 ml（scikit-learn 風格的模型）和 nn（神經網路），README 說這兩個都不需要 Python 環境，也不用 cgo。"}, {"q": "什麼時候還是乖乖用 Python？", "a": "你習慣在 notebook 裡工作。 用 Jupyter 加 pandas 邊看邊試，到現在還是最順手的。等分析要變成一支正式程式，Go 才比較有優勢。 你需要某個只有 Python 才有的套件。 有些模型和領域套件就是只有 Python 版。（真的需要的話，Insyra 的 py 套件可以在 Go 裡執行 Python 程式碼，變數還能雙向傳。） 團隊已經在共用 pandas 程式碼。 一條跑得好好的流程，為了換語言重寫，通常不划算。Go 最適合的情境是：分析本來就要放進 Go 的服務或 CLI 裡、你想要一個執行檔就搞定、不想再管 Python 環境，或者你就是喜歡 Go，想一路用 Go 的腦袋想下去。"}]
draft: false
---

## Go 能不能做資料分析？先講結論

可以。用 Go 做資料分析是玩真的：讀 CSV 或 Excel、清資料、分組、跑檢定或迴歸、畫圖，整個流程都能在 Go 裡完成，最後還能包成一個執行檔丟出去。

但老實說，Go 的資料生態圈比 Python 小，工具也散在好幾個套件裡，不像 Python 有一套大家默契都很好的組合。所以真正該問的不是「能不能」，而是「哪個套件負責哪一塊」。這篇 FAQ 就是在回答這件事。先自首：其中一個套件 [Insyra](https://github.com/HazelnutParadise/insyra) 是我做的，看的時候請自己打個折，不過我盡量對其他套件公平。下面講到別人專案的內容，都是 2026 年 11 月 17 日從它們自己的 GitHub 儲存庫和 README 查來的。

## Go 資料分析要用哪個套件？

沒有一個通吃的答案，因為它們本來就不是在做同一件事。最常看到的四個名字，我會這樣分：

- **[Gonum](https://github.com/gonum/gonum)：管數字的。** 一整組 Go 的數值運算套件：矩陣（`mat`）、統計（`stat`）、最佳化、圖論等等。維護得很勤，2026 年 1 月出了 v0.17.0，固定每半年發一版。它沒有的是「表格」：你處理的是 `[]float64` 和矩陣，不是有名字的欄位。README 上還掛著「unstable」的穩定度標章，版本之間 API 可能會變。
- **[Gota](https://github.com/go-gota/gota)：老牌的 Go DataFrame。** 有 DataFrame 和 Series、讀 CSV／JSON、篩選、合併，也能跟 Gonum 的矩陣互轉。不過儲存庫已經封存（唯讀），最後一版是 2021 年 10 月的 v0.12.0，README 到現在還寫著 API「仍在變動，*使用風險自負*」。
- **[dataframe-go](https://github.com/rocketlaunchr/dataframe-go)：讀寫格式最多的 DataFrame。** CSV、JSONL、Parquet、MySQL、PostgreSQL 都能讀能寫，可以匯出 Excel，還有內插、時間序列預測和畫圖。統計的部分，README 是叫你去用 Gonum 或 montanaflynn/stats。它沒有封存，但最後一次 commit 是 2021 年 10 月，也沒有打過任何版本標籤，README 自己說 API 還不穩定，建議鎖定某個 commit。
- **[Insyra](https://github.com/HazelnutParadise/insyra)：整條流程一起包。** 我做的。核心是 `DataTable`（表格）和 `DataList`（欄位），外面再分出統計（`stats`）、圖表（`plot`、`gplot`）、機器學習（`ml`）、神經網路（`nn`）幾個套件。目前版本 v0.3.5，2026 年 10 月 24 日釋出，MIT 授權。README 也有講它還在快速演進，用之前請對一下你那個版本的文件。

如果你只是要對一串數字做運算，Gonum 很難打。如果你要的是一張表，加上表之後的分析，那正是我做 Insyra 想補的那一塊。

## Golang 有類似 pandas 的套件嗎？

有，但要看你說的「pandas」是哪個意思。

如果是「API 名字長得像 pandas 的 DataFrame」，可以看 Gota、dataframe-go 和 gpandas。如果是「打開來就能讀資料、清資料、做摘要、建模型的那個東西」，那比較接近我做 Insyra 的目標。它不是 pandas 移植版，也沒有照抄 API，做的是同一份工作，只是用 Go 的方式寫。這部分我在[〈我為什麼要做 Insyra，一個 Go 的「Pandas」〉](/zh-tw/posts/why-i-built-a-pandas-for-go/)講比較多。

## Golang dataframe 套件該選哪個？

如果是 2026 年要開新專案，我會先挑還有人維護、而且有正式版本可以鎖的套件。封存不代表壞掉，手上能跑的 Gota 程式碼可以繼續用；只是之後哪裡壞了，不會有人來修。

Gota、dataframe-go、qframe、gpandas 跟 Insyra 的完整對照（讀寫格式、分組、合併、統計、圖表、機器學習、儲存庫狀態），我整理在[〈Insyra vs Gota vs dataframe-go：Go 的 Pandas 替代方案〉](/zh-tw/posts/insyra-vs-gota-vs-dataframe-go/)，這裡就不再貼一次表。

## 用 Go 做資料分析，實際長怎樣？

同一個小問題，兩種寫法：八週的廣告花費跟註冊數，兩個有沒有一起動？

**只用 Gonum**，欄位要自己用 slice 拿著：

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

寫起來很乾淨，也很快。數字有了，但沒有 p 值、沒有表格，欄位名稱還有像廣告管道這種文字欄位，要靠你自己對齊。

**用 Insyra**，資料一直是一張表，統計結果也會附上檢定數字：

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

`Describe` 就是 pandas 裡那個 `df.describe()`。文字欄位 `channel` 預設會跳過（要留著就加 `DescribeOptions{IncludeAll: true}`）。兩支程式算出來的 r、截距、斜率都一樣，這正是你想看到的。兩支都是用 Go 1.27.3，搭配 `gonum.org/v1/gonum` v0.17.0 和 `github.com/HazelnutParadise/insyra` v0.3.5 實際跑過的。沒碰過 Insyra 的話，可以從[〈用 Insyra 在 Go 裡做第一次資料分析〉](/zh-tw/posts/first-data-analysis-in-go-with-insyra/)開始，從讀 CSV、加欄位、分組、排序到存檔走一遍。

## Go 可以把 Excel 讀成 DataFrame 嗎？

可以。Go 處理 Excel 檔最常用的是 [Excelize](https://github.com/qax-os/excelize)，Insyra 底層用的也是它。用 Gota 的話，要先用 Excelize 自己把每一列讀出來，再丟給 `dataframe.LoadRecords`。dataframe-go 則是把 Excel 列在匯出格式裡。

在 Insyra 裡一行就好：`insyra.ReadExcelSheet("sales.xlsx", "2026", false, true)` 把一個工作表讀成 `DataTable`，`dt.ToExcel("report.xlsx", insyra.ExcelWriteOptions{Sheet: "2026", SetColNamesToFirstRow: true})` 再寫回去（v0.3.5 新增）。v0.3.5 有個地方要注意：從 Excel 讀進來的儲存格都是字串（我實際寫出去再讀回來確認過），數字欄位要先轉型再計算。

## Go 能做統計跟畫圖嗎？還是只能處理表格？

可以，而且這裡正是各套件差最多的地方。

- **統計：** Gonum 的 `stat` 套件有基本款（平均、變異數、相關、迴歸、機率分布）。Insyra 的 `stats` 直接吃 `DataList`，再加上假設檢定、ANOVA、各種迴歸、PCA 等等，README 寫明統計結果有拿 R 來對過。
- **圖表：** [gonum/plot](https://github.com/gonum/plot) 畫靜態圖，[go-echarts](https://github.com/go-echarts/go-echarts) 畫可以互動的 HTML 圖。Insyra 兩個都有包：`gplot` 用 gonum/plot，`plot` 用 go-echarts。
- **模型：** Insyra 有 `ml`（scikit-learn 風格的模型）和 `nn`（神經網路），README 說這兩個都不需要 Python 環境，也不用 cgo。

## 什麼時候還是乖乖用 Python？

比起叫你用我的，我更希望你選對：

- **你習慣在 notebook 裡工作。** 用 Jupyter 加 pandas 邊看邊試，到現在還是最順手的。等分析要變成一支正式程式，Go 才比較有優勢。
- **你需要某個只有 Python 才有的套件。** 有些模型和領域套件就是只有 Python 版。（真的需要的話，Insyra 的 `py` 套件可以在 Go 裡執行 Python 程式碼，變數還能雙向傳。）
- **團隊已經在共用 pandas 程式碼。** 一條跑得好好的流程，為了換語言重寫，通常不划算。

Go 最適合的情境是：分析本來就要放進 Go 的服務或 CLI 裡、你想要一個執行檔就搞定、不想再管 Python 環境，或者你就是喜歡 Go，想一路用 Go 的腦袋想下去。

## 發現缺了什麼，或是我哪裡寫錯？

如果我對 Gonum、Gota、dataframe-go 哪裡寫錯了，或是你想用 Go 做資料分析，Insyra 剛好就少了你要的那一樣，歡迎到 GitHub [開一個 issue](https://github.com/HazelnutParadise/insyra/issues)。回報 bug、許願新功能、問「X 要怎麼做」都可以，那裡是我真的會看到的地方。

儲存庫：https://github.com/HazelnutParadise/insyra · 文件：https://hazelnutparadise.github.io/insyra/（[DataTable](https://hazelnutparadise.github.io/insyra/#/DataTable)、[DataList](https://hazelnutparadise.github.io/insyra/#/DataList)）· 官網：https://insyra.hazelnut-paradise.com
