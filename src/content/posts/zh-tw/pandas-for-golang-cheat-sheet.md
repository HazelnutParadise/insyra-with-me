---
title: "pandas 常用指令用 Go 怎麼寫？20 個 Golang 對照速查表，還能直接串 Python"
description: "pandas 常用指令換成 Go 怎麼寫？整理 read_csv、groupby、merge、fillna 等 20 個 Golang 對照寫法。"
pubDate: 2026-11-21
category: guides
tags: ["速查表", "pandas", "golang", "go語言", "dataframe", "groupby", "python"]
faq: [{"q": "Golang 有 pandas 嗎？", "a": "Go 沒有官方的 pandas，但有 DataFrame（資料表）套件可以做同樣的事，這篇用的是 Insyra。Insyra 把一張表叫做 DataTable，一欄叫做 DataList，讀檔、清資料、分組統計、合併、樞紐分析、匯出 Excel 都有。其他 Go 的 DataFrame 套件（Gota、dataframe-go）差在哪，可以看〈Insyra vs Gota vs dataframe-go：Go 的 Pandas 替代方案〉。"}, {"q": "pandas 常用指令在 Go 怎麼寫？", "a": "下面這張表就是懶人包：左邊是 pandas，右邊是 Go（Insyra）的對應寫法，照用途分成讀取、檢視、篩選、分組、合併、缺失值、欄位、匯出八類。"}, {"q": "pandas read_csv 在 Go 怎麼寫？", "a": "用 insyra.ReadCSV_FileWithOptions，把 FirstRowToColNames 設成 true，第一列就會變成欄位名稱，效果跟 pandas 預設的 header=0 一樣。"}, {"q": "pandas groupby 用法換成 Go 怎麼寫？", "a": "先 GroupBy 指定分組欄位，再用 Aggregate 列出要算的東西，每個輸出欄位一個 AggregateConfig，概念跟 pandas 的具名彙總（named aggregation）一樣。"}, {"q": "pandas merge、pivot table 在 Go 怎麼做？", "a": "Merge 依共同欄位合併兩張表，Pivot 把長資料轉成樞紐分析表，排序則用 SortBy。"}, {"q": "pandas fillna、dropna：Go 怎麼處理缺失值？", "a": "補值用 FillWithMedian、FillWithMean（對應 fillna）和 FillForward（對應 ffill），刪掉有缺的列用 DropRowsContainNaN（對應 dropna）。"}, {"q": "Go 可以直接呼叫 Python pandas 嗎？", "a": "可以，Insyra 能直接串 Python：py 套件在 Go 裡執行真正的 pandas，pd 套件則轉成 gpandas（用 Go 寫的 pandas 風格 DataFrame），完全不需要 Python。"}]
draft: false
---

## Golang 有 pandas 嗎？Go 語言的 pandas 替代方案

Go 沒有官方的 pandas，但有 DataFrame（資料表）套件可以做同樣的事，這篇用的是 [Insyra](https://github.com/HazelnutParadise/insyra)。Insyra 把一張表叫做 `DataTable`，一欄叫做 `DataList`，讀檔、清資料、分組統計、合併、樞紐分析、匯出 Excel 都有。其他 Go 的 DataFrame 套件（Gota、dataframe-go）差在哪，可以看〈[Insyra vs Gota vs dataframe-go：Go 的 Pandas 替代方案](/zh-tw/posts/insyra-vs-gota-vs-dataframe-go/)〉。

用 Python 做資料分析的人，手指早就記住 `df.groupby(`、`df.merge(` 怎麼打。換到 Go 語言之後，最常卡住的不是語法，而是「pandas 那一行，在 Go 裡叫什麼」。所以這篇整理成一張 pandas 對照 Go 的速查表：20 個最常用的 pandas 指令，每一個都附上 Go 的寫法和執行結果，要用的時候直接找、直接抄。

以下範例都以 Insyra v0.3.5 為準，先安裝：

```bash
go get github.com/HazelnutParadise/insyra
```

範例資料是台北、台南兩間咖啡店四天的訂單 `orders.csv`，故意留了兩個空格，因為實務上的資料一定有缺：

```csv
date,store,product,units,price
2026-11-02,Taipei,latte,12,90
2026-11-02,Taipei,mocha,5,110
2026-11-02,Tainan,latte,8,85
2026-11-03,Taipei,latte,,90
2026-11-03,Tainan,mocha,6,105
2026-11-03,Tainan,latte,10,
2026-11-04,Taipei,mocha,7,110
2026-11-04,Tainan,latte,9,85
```

## pandas 常用指令在 Go 怎麼寫？20 個操作對照表

下面這張表就是懶人包：左邊是 pandas，右邊是 Go（Insyra）的對應寫法，照用途分成讀取、檢視、篩選、分組、合併、缺失值、欄位、匯出八類。

| 分類 | pandas | Go（Insyra） |
|---|---|---|
| 讀取 | `pd.read_csv("orders.csv")` | `insyra.ReadCSV_FileWithOptions("orders.csv", insyra.CSVReadOptions{FirstRowToColNames: true})` |
| 讀取 | `pd.read_sql(query, conn, params=[...])` | `insyra.ReadSQL(db, "orders", insyra.ReadSQLOptions{Query: ..., Params: ...})` |
| 檢視 | `df.head(3)` | `df.ShowHead(3)` |
| 檢視 | `df.shape` | `df.Size()` |
| 檢視 | `df.describe()` | `df.Describe().Show()` |
| 檢視 | `df["product"].value_counts()` | `df.GetColByName("product").Counter()` |
| 篩選 | `df[df["units"] >= 8]` | `df.FilterRowsWhere(func(row *insyra.DataList) bool { ... })` |
| 篩選 | `df.assign(revenue=df.units * df.price)` | `df.AddColUsingCCL("revenue", "['units'] * ['price']")` |
| 分組 | `df.groupby("store").agg(...)` | `df.GroupBy("store").Aggregate(insyra.AggregateConfig{...})` |
| 分組 | `df.sort_values("units", ascending=False)` | `df.SortBy(insyra.DataTableSortConfig{ColumnName: "units", Descending: true})` |
| 合併 | `df.merge(stores, on="store", how="left")` | `df.Merge(stores, insyra.MergeDirectionHorizontal, insyra.MergeModeLeft, "store")` |
| 合併 | `df.pivot_table(index=..., columns=..., values=..., aggfunc="sum")` | `df.Pivot(insyra.PivotConfig{...})` |
| 缺失值 | `df["price"].fillna(df["price"].median())` | `df.FillWithMedian("price")`（平均數用 `FillWithMean`） |
| 缺失值 | `df["units"].ffill()` | `df.FillForward(0, "units")` |
| 缺失值 | `df.dropna()` | `df.DropRowsContainNaN()`（`nil` 用 `DropRowsContainNil()`） |
| 欄位 | `df["units"].shift(1)` | `df.ShiftCol("units", 1)` |
| 欄位 | `df.rename(columns={"product": "item"})` | `df.ChangeColName("product", "item")` |
| 欄位 | `df.drop(columns=["prev_units"])` | `df.DropColsByName("prev_units")` |
| 匯出 | `df.to_csv("report.csv", index=False)` | `df.ToCSV("report.csv", false, true, false)` |
| 匯出 | `df.to_excel("report.xlsx", sheet_name="by_store", index=False)` | `df.ToExcel("report.xlsx", insyra.ExcelWriteOptions{Sheet: "by_store", SetColNamesToFirstRow: true})` |

接下來每一類都用「pandas 寫法 → Go 寫法 → 執行結果」的順序說明。

## pandas read_csv 在 Go 怎麼寫？讀取 CSV 檔

用 `insyra.ReadCSV_FileWithOptions`，把 `FirstRowToColNames` 設成 `true`，第一列就會變成欄位名稱，效果跟 pandas 預設的 `header=0` 一樣。

```python
df = pd.read_csv("orders.csv")
```

```go
df, err := insyra.ReadCSV_FileWithOptions("orders.csv", insyra.CSVReadOptions{
	FirstRowToColNames: true,
})
if err != nil {
	panic(err)
}
```

台灣常遇到的 Big5 編碼 CSV 也能讀：Insyra 會從檔案開頭判斷編碼，判斷不出來時可以自己指定 `Encoding: "big5"`，就像 pandas 的 `encoding=`。看起來像數字的欄位會自動轉成數字；如果是股票代號 `0050`、電話號碼這種「長得像數字但不能當數字」的資料，加上 `RawStrings: true`，每一格都會保留原本的文字。

## pandas describe、head 用法在 Go 怎麼對應？

`ShowHead(n)` 印出前 n 列，`Size()` 回傳列數和欄數，`Describe()` 產生敘述統計表，`value_counts()` 則對應到單一欄的 `Counter()`。

```python
df.head(3)
df.shape
df.describe()
df["product"].value_counts()
```

```go
df.ShowHead(3)
rows, cols := df.Size() // 8 5
df.Describe().Show()
fmt.Println(df.GetColByName("product").Counter()) // map[latte:5 mocha:3]
```

Insyra 的 `Describe` 比 pandas 多一列 `missing`，直接告訴你每一欄缺幾筆。這份資料的 `units` 和 `price` 各有 7 筆數值、1 筆缺漏，還沒開始清就知道要補哪裡：

```text
RowNames     A(units)  B(price)
0: count            7         7
1: missing          1         1
...
5: mean        8.1429   96.4286
9: 50%              8        90
11: max            12       110
```

## pandas 篩選資料、新增欄位，Go 語言怎麼寫？

篩選用 `FilterRowsWhere` 加一個普通的 Go 函式，新增計算欄位用 `AddColUsingCCL` 寫一條公式。

```python
big = df[df["units"] >= 8]
df = df.assign(revenue=df["units"] * df["price"])
```

```go
big := df.FilterRowsWhere(func(row *insyra.DataList) bool {
	return insyra.ToFloat64(row.Get(3)) >= 8 // 第 3 欄（從 0 算）是 units
})

df.AddColUsingCCL("revenue", "['units'] * ['price']")
```

`FilterRowsWhere` 會把每一列交給你的函式判斷，條件就是一般的 Go 程式，要多個條件用 `&&`、`||` 串起來即可。`AddColUsingCCL` 用的是 CCL，Insyra 內建、寫法很像 Excel 公式的語言：`['units']` 代表名叫 units 的欄位，`IF(...)`、`SUM(...)` 的用法也跟試算表差不多，會寫 Excel 公式的人很快就上手。

## pandas groupby 用法換成 Go 怎麼寫？

先 `GroupBy` 指定分組欄位，再用 `Aggregate` 列出要算的東西，每個輸出欄位一個 `AggregateConfig`，概念跟 pandas 的具名彙總（named aggregation）一樣。

```python
by_store = df.groupby("store", as_index=False).agg(
    units=("units", "sum"),
    revenue=("revenue", "sum"),
    avg_price=("price", "mean"),
)
```

```go
byStore := df.GroupBy("store").Aggregate(
	insyra.AggregateConfig{SourceCol: "units", Op: insyra.OpSum, As: "units"},
	insyra.AggregateConfig{SourceCol: "revenue", Op: insyra.OpSum, As: "revenue"},
	insyra.AggregateConfig{SourceCol: "price", Op: insyra.OpMean, As: "avg_price"},
)
```

執行結果（缺失值已先補好，補法在後面「缺失值」那一段）：

```text
RowNames   A(store)  B(units)  C(revenue)  D(avg_price)
0:         'Taipei'        32        3120           100
1:         'Tainan'        33        2975         91.25
```

分組欄位會留在表裡當一般欄位，等於 pandas 的 `as_index=False`。除了加總、平均，還有中位數、最小值、最大值、計數、標準差、變異數、第一筆、最後一筆、相異值個數，以及可以放自己函式的 `OpCustom`。

## pandas merge、pivot table 在 Go 怎麼做？

`Merge` 依共同欄位合併兩張表，`Pivot` 把長資料轉成樞紐分析表，排序則用 `SortBy`。

**sort_values：排序**

```python
by_store = by_store.sort_values("units", ascending=False)
```

```go
byStore.SortBy(insyra.DataTableSortConfig{ColumnName: "units", Descending: true})
```

要依多個欄位排序，就傳多個設定，排前面的優先。

**merge：合併兩張表**

另一張 `stores.csv` 記錄每間店的中文名稱和店長：

```python
merged = by_store.merge(stores, on="store", how="left")
```

```go
stores, _ := insyra.ReadCSV_FileWithOptions("stores.csv", insyra.CSVReadOptions{FirstRowToColNames: true})
merged, err := byStore.Merge(stores, insyra.MergeDirectionHorizontal, insyra.MergeModeLeft, "store")
```

```text
RowNames   A(store)  B(units)  C(revenue)  D(avg_price)  E(city_zh)  F(manager)
0:         'Tainan'        33        2975         91.25  '台南'      'Ben'
1:         'Taipei'        32        3120           100  '台北'      'Amy'
```

`MergeModeInner`、`MergeModeOuter`、`MergeModeLeft`、`MergeModeRight` 對應 pandas 的 `how=` 四種合併方式。

**pivot_table：樞紐分析表**

```python
wide = df.pivot_table(index="date", columns="store", values="units",
                      aggfunc="sum", fill_value=0)
```

```go
wide, err := df.Pivot(insyra.PivotConfig{
	Index:   []string{"date"},
	Columns: "store",
	Values:  "units",
	AggFunc: "sum",
	FillNA:  0,
})
```

```text
RowNames   A(date)       B(Taipei)  C(Tainan)
0:         '2026-11-02'         17          8
1:         '2026-11-03'          8         16
2:         '2026-11-04'          7          9
```

產生的新欄位照資料出現的順序排（Taipei 在 Tainan 前面）；pandas 會依名稱排序，想要一樣的順序就加上 `SortCols: true`。反過來把寬表轉回長表（pandas 的 `melt`），用 `Unpivot`。

## pandas fillna、dropna 用法：Go 怎麼處理缺失值？

補值用 `FillWithMedian`、`FillWithMean`（對應 `fillna`）和 `FillForward`（對應 `ffill`），刪掉有缺的列用 `DropRowsContainNaN`（對應 `dropna`）。

```python
clean = df.dropna()                                    # 剩 6 列
df["units"] = df["units"].ffill()
df["price"] = df["price"].fillna(df["price"].median())
```

```go
clean := df.Clone().DropRowsContainNaN() // 剩 6 列
df.FillForward(0, "units").FillWithMedian("price")
```

`FillForward` 的 `0` 是上限，0 代表全部補；填正數就是最多連續補幾格，跟 pandas 的 `limit=` 一樣。補完之後，11/03 台北拿鐵的 `units` 變成 8（沿用上一列），台南拿鐵缺的價格變成中位數 90。另外還有往後補的 `FillBackward`、眾數補值 `FillWithMode` 和內插補值 `FillByInterpolation`。

要注意一點：CSV 裡空白的數字格讀進來是 `NaN`，所以讀完 CSV 想 `dropna`，用的是 `DropRowsContainNaN`。`DropRowsContainNil` 處理的是 `nil`，例如下一段 `ShiftCol` 平移後空出來的第一格。

## pandas shift、rename、drop 在 Go 怎麼寫？

`ShiftCol` 回傳平移後的欄位，`ChangeColName` 改欄位名稱，`DropColsByName` 刪除欄位。

```python
df["prev_units"] = df["units"].shift(1)
df = df.rename(columns={"product": "item"})
df = df.drop(columns=["prev_units"])
```

```go
prev := df.ShiftCol("units", 1)
prev.SetName("prev_units")
df.AppendCols(prev)

df.ChangeColName("product", "item")
df.DropColsByName("prev_units")
```

`ShiftCol` 回傳的是單一欄（`DataList`），所以要用 `AppendCols` 接回表上。平移後第一列是 `nil`，就是 pandas 放 `NaN` 的那一格。算「跟前一天比」的差異時很常用到。

## pandas to_excel、to_csv、read_sql 用法在 Go 怎麼對應？

`ToCSV`、`ToExcel` 輸出檔案，`ToSQL`、`ReadSQL` 透過 [GORM](https://gorm.io) 的資料庫連線寫入和讀取。

```python
merged.to_csv("report.csv", index=False)
merged.to_excel("report.xlsx", sheet_name="by_store", index=False)
```

```go
merged.ToCSV("report.csv", false, true, false)
merged.ToExcel("report.xlsx", insyra.ExcelWriteOptions{
	Sheet:                 "by_store",
	SetColNamesToFirstRow: true,
})
```

`ToCSV` 的三個布林值依序是：要不要把列名稱寫成第一欄（pandas 的 `index`）、要不要把欄位名稱寫成第一列（`header`）、要不要加 UTF-8 BOM。CSV 要給同事用 Excel 打開、裡面又有中文的話，第三個設成 `true`，Excel 比較能正確辨識成 UTF-8。

資料庫的部分，以 SQLite 為例（用純 Go 的 `glebarez/sqlite` 驅動）：

```python
df.to_sql("orders", conn, if_exists="replace", index=False)
tainan = pd.read_sql("SELECT date, product, units FROM orders WHERE store = ?",
                     conn, params=["Tainan"])
```

```go
// import "github.com/glebarez/sqlite" and "gorm.io/gorm"
db, _ := gorm.Open(sqlite.Open("shop.db"), &gorm.Config{})

df.ToSQL(db, "orders", insyra.ToSQLOptions{IfExists: insyra.SQLActionIfTableExistsReplace})

tainan, err := insyra.ReadSQL(db, "orders", insyra.ReadSQLOptions{
	Query:  "SELECT date, product, units FROM orders WHERE store = ?",
	Params: []any{"Tainan"},
})
```

查詢條件來自使用者輸入時，一律用 `Params` 帶參數，跟 pandas 的 `params=` 同一個道理。

## 從 pandas 換到 Golang 要注意什麼？3 個差異

最常讓人愣一下的有三個：方法會直接改原本的表、錯誤是用回傳值處理、欄位可以用名稱也可以用 Excel 欄位字母。

1. **預設直接修改原表。** `FillForward`、`SortBy`、`AddColUsingCCL`、`ChangeColName`、`DropColsByName`、`DropRowsContainNaN` 會直接改這張表再把它回傳，所以可以一路串下去，也不用記 `inplace=True`。想保留原表，先 `Clone()` 一份。`FilterRowsWhere`、`GroupBy(...).Aggregate`、`Merge`、`Pivot` 則是回傳一張新表。
2. **錯誤是回傳值。** 讀檔、`Merge`、`Pivot` 這些可能失敗的函式，會在表格旁邊多回傳一個 `error`，照 Go 的習慣檢查就好。
3. **欄位用名稱或字母都行。** 多數方法收欄位名稱，很多也接受 Excel 風格的欄位字母（`"A"`、`"B"`），遇到標題亂七八糟的檔案特別方便。

## Go 可以直接呼叫 Python pandas 嗎？

可以，Insyra 能直接串 Python：`py` 套件在 Go 裡執行真正的 pandas，`pd` 套件則轉成 gpandas（用 Go 寫的 pandas 風格 DataFrame），完全不需要 Python。

**`py`：從 Go 呼叫真正的 pandas。** `py.RunCodef` 執行一段 Python 程式碼，`$v1`、`$v2`… 會換成你從 Go 傳進去的值。`DataTable` 傳過去就是 `pandas.DataFrame`，Python 那邊把 DataFrame 交給 `insyra.Return`，回到 Go 就是 `DataTable`。第一次執行時會用 uv 自動建好 Python 環境（pandas 已包含在內），所以第一次需要連網。

```go
// import "github.com/HazelnutParadise/insyra/py"
// 先在 Go 把缺值補好：v0.3.5 的 py 無法傳送 NaN 儲存格。
df.FillForward(0, "units").FillWithMedian("price")

var out *insyra.DataTable
err = py.RunCodef(&out, `
df = $v1
df["revenue"] = df["units"] * df["price"]
summary = df.groupby("product", as_index=False).agg(
    units=("units", "sum"),
    revenue=("revenue", "sum"),
)
insyra.Return(summary)
`, df)
```

```text
RowNames   A(product)  B(units)  C(revenue)
0: 0       'latte'           47        4145
1: 1       'mocha'           18        1950
```

也就是說，手上那段離不開 pandas 的程式可以原封不動留在 pandas，其餘流程照樣寫在 Go。

**`pd`：接 gpandas，不用 Python。** `pd.FromDataTable(df)` 把 `DataTable` 轉成 [gpandas](https://github.com/apoplexi24/gpandas) 的 DataFrame，`ToDataTable()` 再轉回來，整支程式還是編成一個執行檔。

```go
// import "github.com/HazelnutParadise/insyra/pd"
gdf, err := pd.FromDataTable(df)
// ... 使用 gpandas 的方法 ...
back, err := gdf.ToDataTable()
```

想從頭跟著一份資料完整做一次，可以看〈[用 Insyra 在 Go 裡做第一次資料分析](/zh-tw/posts/first-data-analysis-in-go-with-insyra/)〉；還在評估 Go 適不適合做資料分析，可以看〈[Go 可以做資料分析嗎？4 個 Golang 套件比較，還能直接串 Python](/zh-tw/posts/can-you-do-data-analysis-in-go/)〉。

## Go 語言缺 pandas 功能怎麼辦？到 GitHub 開 issue

如果你每天在用的 pandas 指令，這張速查表裡找不到 Go 的對應寫法，歡迎到 GitHub [開一個 issue](https://github.com/HazelnutParadise/insyra/issues) 告訴我們是哪一個。回報 bug、許願新功能、問「這行 pandas 在 Go 要怎麼寫」都可以。

[Insyra GitHub 儲存庫](https://github.com/HazelnutParadise/insyra) · [使用文件](https://hazelnutparadise.github.io/insyra/)（[DataTable](https://hazelnutparadise.github.io/insyra/#/DataTable)、[DataList](https://hazelnutparadise.github.io/insyra/#/DataList)） · [官網](https://insyra.hazelnut-paradise.com)
