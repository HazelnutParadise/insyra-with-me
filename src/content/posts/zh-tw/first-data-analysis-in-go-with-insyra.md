---
title: "用 Insyra 在 Go 裡做第一次資料分析"
description: "讀入 CSV、加一個計算欄位、分組加總再排序、把結果存檔，用 Insyra v0.3.5 寫成一支短短的 Go 程式。"
pubDate: 2026-11-11
category: guides
tags: ["getting-started", "datatable", "csv", "ccl", "groupby"]
---

## 目標

看完這篇，你會有一支小小的 Go 程式，做完最經典的第一次分析：讀入 CSV、加一個營收欄位、依地區加總、排序，再把答案存成新的 CSV。不用 notebook，也不用換語言，`go run` 就好。

## 準備

- Go 1.26 以上。Insyra v0.3.5 的 `go.mod` 寫的是 `go 1.26.9`。如果你用的是 Go 1.21 以上，`go` 指令會自動幫你下載這個工具鏈（除非你設了 `GOTOOLCHAIN=local`）。
- 開一個新的 module：

```sh
mkdir first-insyra && cd first-insyra
go mod init first-insyra
go get github.com/HazelnutParadise/insyra/allpkgs
```

下面所有程式都是用 Insyra v0.3.5 實際跑過的。

## 步驟 1：把 CSV 讀進 DataTable

資料是六筆訂單。為了讓範例複製貼上就能跑，CSV 直接放在字串裡；如果是真的檔案，就改呼叫 `insyra.ReadCSV_FileWithOptions("sales.csv", opts)`，選項一樣。

```go
const salesCSV = `region,product,price,qty
North,Coffee,120,3
South,Tea,80,5
North,Tea,80,2
East,Coffee,120,4
South,Coffee,120,1
East,Tea,80,6
`

dt, err := insyra.ReadCSV_StringWithOptions(salesCSV, insyra.CSVReadOptions{
	FirstRowToColNames: true,
})
if err != nil {
	panic(err)
}
dt.ShowHead(3)
```

`FirstRowToColNames` 會把第一列當成欄位名稱。`ShowHead(3)` 印出前三列，讓你在做任何事之前，先看看讀進來的是什麼（還有每一欄被判斷成什麼型別）。

## 步驟 2：用 CCL 加一個欄位

CCL（Column Calculation Language，欄位計算語言）用起來就像 Excel 公式。欄位可以用字母（`A`、`B`……）指定，也可以用 `['...']` 寫欄位名稱：

```go
dt.AddColUsingCCL("revenue", "['price'] * ['qty']")
```

這一步就這樣。現在每一列都有 `revenue = price × qty`。

## 步驟 3：分組、加總、排序

```go
byRegion := dt.GroupBy("region").Aggregate(
	insyra.AggregateConfig{SourceCol: "revenue", Op: insyra.OpSum, As: "total_revenue"},
)
byRegion.SortBy(insyra.DataTableSortConfig{ColumnName: "total_revenue", Descending: true})
byRegion.Show()
```

`GroupBy` 可以放一個或多個分組欄位，`Aggregate` 則是每個輸出欄位給一個設定。`OpSum` 只是其中一種運算，`OpMean`、`OpMedian`、`OpCount` 這些用法都一樣。

## 步驟 4：把一欄拿出來當 DataList

`DataTable` 的每一欄都是一個 `DataList`，而 `DataList` 自己就會算統計量：

```go
revenue := dt.GetColByName("revenue")
fmt.Println("Mean revenue per order:", revenue.Mean())
```

## 步驟 5：存檔

```go
if err := byRegion.ToCSV("revenue_by_region.csv", false, true, false); err != nil {
	panic(err)
}
```

三個布林值依序是：要不要把列名寫成第一欄（不要）、要不要把欄名寫成第一列（要）、要不要加 UTF-8 BOM（不要；如果檔案是要給 Excel 開的，可以打開）。

## 完整程式

```go
package main

import (
	"fmt"

	"github.com/HazelnutParadise/insyra"
)

const salesCSV = `region,product,price,qty
North,Coffee,120,3
South,Tea,80,5
North,Tea,80,2
East,Coffee,120,4
South,Coffee,120,1
East,Tea,80,6
`

func main() {
	dt, err := insyra.ReadCSV_StringWithOptions(salesCSV, insyra.CSVReadOptions{
		FirstRowToColNames: true,
	})
	if err != nil {
		panic(err)
	}
	dt.ShowHead(3)

	dt.AddColUsingCCL("revenue", "['price'] * ['qty']")

	byRegion := dt.GroupBy("region").Aggregate(
		insyra.AggregateConfig{SourceCol: "revenue", Op: insyra.OpSum, As: "total_revenue"},
	)
	byRegion.SortBy(insyra.DataTableSortConfig{ColumnName: "total_revenue", Descending: true})
	byRegion.Show()

	revenue := dt.GetColByName("revenue")
	fmt.Println("Mean revenue per order:", revenue.Mean())

	if err := byRegion.ToCSV("revenue_by_region.csv", false, true, false); err != nil {
		panic(err)
	}
}
```

## 執行結果

`go run .` 會印出（Insyra v0.3.5）：

```text
DataTable (6 rows x 4 columns) [showing rows 0 to 2]
================================================================================
 stat (selected range): C(mean=93.33, range=[80.00, 120.00]) 
--------------------------------------------------------------------------------
RowNames   A(region)  B(product)  C(price)  D(qty) 
---------- ---------- ----------- --------- -------
0:         'North'    'Coffee'         120       3 
1:         'South'    'Tea'             80       5 
2:         'North'    'Tea'             80       2 

DataTable (3 rows x 2 columns)
================================================================================
 stat: B(mean=666.67, range=[520.00, 960.00]) 
--------------------------------------------------------------------------------
RowNames   A(region)  B(total_revenue) 
---------- ---------- -----------------
0:         'East'                  960 
1:         'North'                 520 
2:         'South'                 520 

Mean revenue per order: 333.3333333333333
```

`revenue_by_region.csv` 的內容：

```csv
region,total_revenue
East,960
North,520
South,520
```

我自己很喜歡的一個小地方：`Show` 會在表格上面先放一行統計（數值欄的平均和範圍），所以就算你還沒寫任何檢查，奇怪的數字也會先跳出來。

## 下一步

- 想寫得更短？`isr` 套件是 Insyra 的語法糖：用 `isr.DL.Of(1, 2, 3)` 取代 `insyra.NewDataList(1, 2, 3)`。請看 [isr 文件](https://hazelnutparadise.github.io/insyra/#/isr)。
- `DataTable` 的所有方法：[DataTable 文件](https://hazelnutparadise.github.io/insyra/#/DataTable)。`DataList` 的所有方法：[DataList 文件](https://hazelnutparadise.github.io/insyra/#/DataList)。
- CCL 的完整功能（`IF`、`CASE`、範圍、`LAG`、`CUMSUM`……）：[CCL 文件](https://hazelnutparadise.github.io/insyra/#/CCL)。
- 同一套流程更完整的版本：[Sales Analysis End-to-End 教學](https://github.com/HazelnutParadise/insyra/blob/main/Docs/tutorials/sales-analysis-end-to-end.md)。
- 完整文件：https://hazelnutparadise.github.io/insyra/ · 官網：https://insyra.hazelnut-paradise.com
