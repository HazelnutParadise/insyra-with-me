---
title: "我為什麼要做 Insyra，一個 Go 的「Pandas」"
description: "Insyra 為什麼存在、「Go 的 Pandas」是什麼意思又不是什麼意思，還有同一個分析用 pandas 和 Insyra 寫的對照。"
pubDate: 2026-11-12
category: community
tags: ["insyra", "pandas", "go", "data-analysis"]
draft: true
---

## 先講結論

有人問我 Insyra 是什麼，我會說它是 Go 的「Pandas」。引號是故意加的。它不是把 pandas 移植過來，也沒有照抄它的 API。它做的是同一份*工作*：讀資料、清資料、加欄位、分組、彙總、輸出。只是用 Go 來做，照 Go 平常的寫法。

我在 2024 年 8 月 29 日開了這個儲存庫。下面是原因。

## 一直卡著的那件事

<!-- TIM: 請確認這段是你真正的理由，或用你自己的話改寫。依據 queue.md 裡你之前的回覆草稿。 -->
很多分析不會一直待在 notebook 裡。它會被某個服務呼叫、被 AI agent 呼叫，或變成別人要用的應用程式。走到這一步的時候，我希望它是 Go：一個執行檔，不用再帶著一整套 Python 環境一起出貨。

而且老實說，我很懶（問誰都知道）。我不想用一種語言寫完分析，為了上線又用另一種語言再寫一次。

## 前後對照

一個小任務：六筆訂單，營收 = 單價 × 數量，算出每個地區的總營收，由大到小排。

用 pandas：

```python
import pandas as pd

df = pd.read_csv("sales.csv")
df["revenue"] = df["price"] * df["qty"]
print(df.groupby("region")["revenue"].sum().sort_values(ascending=False))
```

用 Go 加 Insyra v0.3.5：

```go
dt, err := insyra.ReadCSV_FileWithOptions("sales.csv", insyra.CSVReadOptions{
	FirstRowToColNames: true,
})
if err != nil {
	panic(err)
}
dt.AddColUsingCCL("revenue", "['price'] * ['qty']")

byRegion := dt.GroupBy("region").Aggregate(
	insyra.AggregateConfig{SourceCol: "revenue", Op: insyra.OpSum, As: "total_revenue"},
)
byRegion.SortBy(insyra.DataTableSortConfig{ColumnName: "total_revenue", Descending: true})
byRegion.Show()
```

對，Go 版比較長。它就是 Go。換來的是有名字的欄位而不是關鍵字魔法、一個你沒辦法假裝沒看到的 `err`，還有一個會比你的資料更早抱怨的編譯器。（想寫短一點的話，`isr` 套件就是為了這個做的語法糖。）

可以直接執行的完整版本和真實輸出，在[用 Insyra 在 Go 裡做第一次資料分析](/posts/first-data-analysis-in-go-with-insyra/)。

## 「Go 的 Pandas」實際上是什麼

- **兩個核心型別。** `DataList` 是一欄值，`DataTable` 是由它們組成的表。`DataTable` 的一欄就是一個 `DataList`，所以 `dt.GetColByName("revenue").Mean()` 直接就能用。
- **Excel 風格的欄位公式。** CCL（欄位計算語言）讓你寫 `IF(A > 90, 'Excellent', 'Average')` 或 `['price'] * ['qty']`。做資料的人大多已經會 Excel 公式，我寧願在那裡跟大家碰面，也不想再發明一套新的小語言。
- **串接呼叫也不會弄丟錯誤。** `DataList` 和 `DataTable` 會把最後一個錯誤記在物件上，所以你可以一路串下去，最後再檢查一次 `Err()`。
- **有對照參考實作驗證。** 照 README 的說法，統計對照 R、`ml` 模型對照 scikit-learn、`nn` 對照 PyTorch 和 onnxruntime。一個很有自信地算錯的資料函式庫，比沒有函式庫更糟。
- **重要的地方是純 Go。** `ml` 和 `nn` 不需要 Python 執行環境，也不用 cgo。

## 它不是什麼

- **不是可以直接替換的 pandas 複製品。** 方法名稱和行為照 Go 的習慣，不是照 pandas。如果你真的想要 pandas 形狀的 `DataFrame`，有一個建立在 `gpandas` 上的 `pd` 套件，可以和 `DataTable` 互相轉換。
- **還沒做完。** README 就直接寫了這個專案正在快速演進，文件裡沒列出的功能都還是實驗性的。請看你用的那個版本的文件。

## 其他家族成員

- [Idensyra](https://github.com/HazelnutParadise/idensyra) 是一個預先裝好 Insyra 的迷你 Go IDE，不用安裝 Go 就能跑 Go 的分析程式。
- [Syralit](https://github.com/HazelnutParadise/syralit) 把分析變成網頁應用：Go 原生、受 Streamlit 啟發，可以直接渲染 `DataTable` 和 `DataList`。

## 試試看

```sh
go get github.com/HazelnutParadise/insyra/allpkgs
```

儲存庫：https://github.com/HazelnutParadise/insyra · 文件：https://hazelnutparadise.github.io/insyra/ · 我在 X 上是 [@TimLai666](https://x.com/TimLai666)，跟我說你希望它下一步能做什麼。
