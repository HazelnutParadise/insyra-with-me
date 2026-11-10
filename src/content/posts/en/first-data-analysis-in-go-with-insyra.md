---
title: "How to do your first data analysis in Go with Insyra"
description: "Load a CSV, add a calculated column, group and sort, and save the result, in one short Go program with Insyra v0.3.5."
pubDate: 2026-11-11
category: guides
tags: ["getting-started", "datatable", "csv", "ccl", "groupby"]
draft: true
---

## Goal

By the end of this post you'll have one small Go program that does the classic first analysis: load a CSV, add a revenue column, total it per region, sort it, and save the answer as a new CSV. No notebook, no second language. Just `go run`.

## Prerequisites

- Go 1.26 or newer. Insyra v0.3.5 sets `go 1.26.9` in its `go.mod`. With Go 1.21+ the `go` command downloads that toolchain for you unless `GOTOOLCHAIN=local` is set.
- A fresh module:

```sh
mkdir first-insyra && cd first-insyra
go mod init first-insyra
go get github.com/HazelnutParadise/insyra/allpkgs
```

Everything below was run with Insyra v0.3.5.

## Step 1: Load the CSV into a DataTable

Our data is six orders. To keep the example copy-and-run, the CSV sits in a string; with a real file you'd call `insyra.ReadCSV_FileWithOptions("sales.csv", opts)` and pass the same options.

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

`FirstRowToColNames` turns the header row into column names. `ShowHead(3)` prints the first three rows, so you can see what you loaded (and what type each column became) before doing anything else.

## Step 2: Add a column with CCL

CCL, the Column Calculation Language, works like Excel formulas. You can refer to a column by its letter (`A`, `B`, ...) or by its name in `['...']`:

```go
dt.AddColUsingCCL("revenue", "['price'] * ['qty']")
```

That's the whole step. Every row now has `revenue = price × qty`.

## Step 3: Group, sum and sort

```go
byRegion := dt.GroupBy("region").Aggregate(
	insyra.AggregateConfig{SourceCol: "revenue", Op: insyra.OpSum, As: "total_revenue"},
)
byRegion.SortBy(insyra.DataTableSortConfig{ColumnName: "total_revenue", Descending: true})
byRegion.Show()
```

`GroupBy` takes one or more key columns, and `Aggregate` takes one config per output column. `OpSum` is one of several operations; `OpMean`, `OpMedian`, `OpCount` and friends work the same way.

## Step 4: Pull one column out as a DataList

A column of a `DataTable` is a `DataList`, and a `DataList` knows its own statistics:

```go
revenue := dt.GetColByName("revenue")
fmt.Println("Mean revenue per order:", revenue.Mean())
```

## Step 5: Save the result

```go
if err := byRegion.ToCSV("revenue_by_region.csv", false, true, false); err != nil {
	panic(err)
}
```

The three booleans are: write row names as the first column (no), write column names as the first row (yes), add a UTF-8 BOM (no; turn it on if the file is headed for Excel).

## The whole program

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

## Expected result

`go run .` prints this (Insyra v0.3.5):

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

And `revenue_by_region.csv` contains:

```csv
region,total_revenue
East,960
North,520
South,520
```

Small thing I like here: `Show` puts a quick stat line on top of the table (mean and range of the numeric column), so a weird number jumps out before you've written a single check.

## Next steps

- Prefer shorter code? The `isr` package is syntactic sugar over Insyra: `isr.DL.Of(1, 2, 3)` instead of `insyra.NewDataList(1, 2, 3)`. See the [isr docs](https://hazelnutparadise.github.io/insyra/#/isr).
- Every `DataTable` method: [DataTable docs](https://hazelnutparadise.github.io/insyra/#/DataTable). Every `DataList` method: [DataList docs](https://hazelnutparadise.github.io/insyra/#/DataList).
- All of CCL (`IF`, `CASE`, ranges, `LAG`, `CUMSUM`, ...): [CCL docs](https://hazelnutparadise.github.io/insyra/#/CCL).
- A longer, end-to-end version of this workflow: [Sales Analysis End-to-End tutorial](https://github.com/HazelnutParadise/insyra/blob/main/Docs/tutorials/sales-analysis-end-to-end.md).
- Full documentation: https://hazelnutparadise.github.io/insyra/ · Official site: https://insyra.hazelnut-paradise.com
