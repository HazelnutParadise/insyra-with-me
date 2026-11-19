---
title: "Pandas for Golang cheat sheet: 20 pandas operations in Go"
description: "Looking for pandas in Golang? A cheat sheet of 20 everyday pandas operations, from read_csv to groupby, merge and to_excel, with the Insyra equivalent in Go."
pubDate: 2026-11-21
category: guides
tags: ["cheat-sheet", "pandas", "golang", "dataframe", "groupby", "python"]
faq: [{"q": "Is there a pandas equivalent in Go?", "a": "Yes. The closest pandas equivalent in Go is a DataFrame-style library, and this pandas for Golang cheat sheet maps 20 pandas calls you type every day to their Insyra version. Here's the thing about switching languages: you don't forget pandas. Your fingers still type df.groupby( before your brain catches up. So instead of a tour, this is a lookup table. Find the pandas line you already know, copy the Go line next to it, and get back to work."}, {"q": "Which Go function replaces each pandas call?", "a": "Each pandas call in the left column has a one-line Go equivalent on the right. df is a pandas DataFrame on the left and an Insyra DataTable on the right."}, {"q": "How do you read a CSV in Go like pandas read_csv?", "a": "Use insyra.ReadCSV_FileWithOptions and set FirstRowToColNames, which is what pandas does by default with header=0."}, {"q": "How do you do a pandas groupby in Go?", "a": "Call GroupBy with the key columns, then Aggregate with one AggregateConfig per output column. It's the same idea as pandas named aggregation."}, {"q": "How do you sort, merge and pivot tables in Go like pandas?", "a": "SortBy sorts, Merge joins two tables on a key column, and Pivot turns long data into a wide table."}, {"q": "How do you handle missing values in Go like pandas fillna and dropna?", "a": "Use FillWithMedian / FillWithMean for fillna, FillForward for ffill, and DropRowsContainNaN for dropna."}, {"q": "Can you call real pandas from Go?", "a": "Yes. Insyra connects to Python directly: the py package runs real pandas from Go, and the pd package converts to gpandas, a pandas-style DataFrame written in Go."}]
draft: false
---

## Is there a pandas equivalent in Go?

Yes. The closest pandas equivalent in Go is a DataFrame-style library, and this pandas for Golang cheat sheet maps 20 pandas calls you type every day to their [Insyra](https://github.com/HazelnutParadise/insyra) version.

Here's the thing about switching languages: you don't forget pandas. Your fingers still type `df.groupby(` before your brain catches up. So instead of a tour, this is a lookup table. Find the pandas line you already know, copy the Go line next to it, and get back to work.

In Insyra a table is a `DataTable` and a column is a `DataList`. The examples use Insyra v0.3.5, the current release:

```bash
go get github.com/HazelnutParadise/insyra
```

All examples use one tiny file, `orders.csv`: two coffee shops, four days, and two gaps on purpose, because real data always has gaps.

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

## Golang pandas cheat sheet: which Go function replaces each pandas call?

Each pandas call in the left column has a one-line Go equivalent on the right. `df` is a pandas DataFrame on the left and an Insyra `DataTable` on the right.

| # | pandas | Insyra (Go) |
|---|---|---|
| 1 | `pd.read_csv("orders.csv")` | `insyra.ReadCSV_FileWithOptions("orders.csv", insyra.CSVReadOptions{FirstRowToColNames: true})` |
| 2 | `df.head(3)` | `df.ShowHead(3)` |
| 3 | `df.shape` | `df.Size()` |
| 4 | `df.describe()` | `df.Describe().Show()` |
| 5 | `df["product"].value_counts()` | `df.GetColByName("product").Counter()` |
| 6 | `df[df["units"] >= 8]` | `df.FilterRowsWhere(func(row *insyra.DataList) bool { ... })` |
| 7 | `df.assign(revenue=df.units * df.price)` | `df.AddColUsingCCL("revenue", "['units'] * ['price']")` |
| 8 | `df.groupby("store").agg(...)` | `df.GroupBy("store").Aggregate(insyra.AggregateConfig{...})` |
| 9 | `df.sort_values("units", ascending=False)` | `df.SortBy(insyra.DataTableSortConfig{ColumnName: "units", Descending: true})` |
| 10 | `df.merge(stores, on="store", how="left")` | `df.Merge(stores, insyra.MergeDirectionHorizontal, insyra.MergeModeLeft, "store")` |
| 11 | `df.pivot_table(index=..., columns=..., values=..., aggfunc="sum")` | `df.Pivot(insyra.PivotConfig{...})` |
| 12 | `df["price"].fillna(df["price"].median())` | `df.FillWithMedian("price")` (also `FillWithMean`) |
| 13 | `df["units"].ffill()` | `df.FillForward(0, "units")` |
| 14 | `df.dropna()` | `df.DropRowsContainNaN()` (or `DropRowsContainNil()`) |
| 15 | `df["units"].shift(1)` | `df.ShiftCol("units", 1)` |
| 16 | `df.rename(columns={"product": "item"})` | `df.ChangeColName("product", "item")` |
| 17 | `df.drop(columns=["prev_units"])` | `df.DropColsByName("prev_units")` |
| 18 | `df.to_csv("report.csv", index=False)` | `df.ToCSV("report.csv", false, true, false)` |
| 19 | `df.to_excel("report.xlsx", sheet_name="by_store", index=False)` | `df.ToExcel("report.xlsx", insyra.ExcelWriteOptions{Sheet: "by_store", SetColNamesToFirstRow: true})` |
| 20 | `pd.read_sql(query, conn, params=[...])` | `insyra.ReadSQL(db, "orders", insyra.ReadSQLOptions{Query: ..., Params: ...})` |

The sections below show each one as a before/after pair, with the output you get.

## How do you read a CSV in Go like pandas read_csv?

Use `insyra.ReadCSV_FileWithOptions` and set `FirstRowToColNames`, which is what pandas does by default with `header=0`.

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

Insyra detects the file encoding from the first bytes, and you can name it yourself with `Encoding: "big5"` when an old Excel export needs it, like pandas' `encoding=`. Columns that look numeric become numbers. If a column only looks numeric (stock IDs like `0050`, phone numbers), set `RawStrings: true` and every cell stays the exact text from the file.

## How do you inspect a table in Go like df.head() and df.describe()?

`ShowHead(n)` prints the first n rows, `Size()` returns rows and columns, and `Describe()` builds the summary table.

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

`Describe` has one row pandas doesn't: `missing`. On our file it shows a count of 7 and 1 missing for both `units` and `price`, so the gaps are visible before you start cleaning:

```text
RowNames     A(units)  B(price)
0: count            7         7
1: missing          1         1
...
5: mean        8.1429   96.4286
9: 50%              8        90
11: max            12       110
```

## How do you filter rows and add columns in Go like pandas?

Filter with `FilterRowsWhere` and a plain Go function; add a computed column with `AddColUsingCCL` and a short formula.

```python
big = df[df["units"] >= 8]
df = df.assign(revenue=df["units"] * df["price"])
```

```go
big := df.FilterRowsWhere(func(row *insyra.DataList) bool {
	return insyra.ToFloat64(row.Get(3)) >= 8 // column 3 is units
})

df.AddColUsingCCL("revenue", "['units'] * ['price']")
```

`FilterRowsWhere` hands you each row as a `DataList`, so the condition is ordinary Go: `&&`, `||`, string checks, whatever you need. `AddColUsingCCL` uses CCL, Insyra's Excel-like formula language: `['units']` refers to a column by name, and `IF(...)`, `SUM(...)` and friends work the way they do in a spreadsheet.

## How do you do a pandas groupby in Go?

Call `GroupBy` with the key columns, then `Aggregate` with one `AggregateConfig` per output column. It's the same idea as pandas named aggregation.

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

With the two gaps already filled (see the missing-values section below), you get:

```text
RowNames   A(store)  B(units)  C(revenue)  D(avg_price)
0:         'Taipei'        32        3120           100
1:         'Tainan'        33        2975         91.25
```

The key column stays a normal column, like `as_index=False`. Besides sum and mean there's median, min, max, count, standard deviation, variance, first, last, number of unique values, and `OpCustom` for your own function.

## How do you sort, merge and pivot tables in Go like pandas?

`SortBy` sorts, `Merge` joins two tables on a key column, and `Pivot` turns long data into a wide table.

**sort_values**

```python
by_store = by_store.sort_values("units", ascending=False)
```

```go
byStore.SortBy(insyra.DataTableSortConfig{ColumnName: "units", Descending: true})
```

Pass several configs to sort by more than one column; the first one wins ties.

**merge**

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

`MergeModeInner`, `MergeModeOuter`, `MergeModeLeft` and `MergeModeRight` match pandas' `how=`. `MergeDirectionVertical` joins rows instead of columns, closer to what `pd.concat` does.

**pivot_table**

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

New columns come out in first-seen order (Taipei before Tainan); pandas sorts them, and `SortCols: true` does the same here. Going the other way, wide to long like `melt`, is `Unpivot`.

## How do you handle missing values in Go like pandas fillna and dropna?

Use `FillWithMedian` / `FillWithMean` for `fillna`, `FillForward` for `ffill`, and `DropRowsContainNaN` for `dropna`.

```python
clean = df.dropna()                                    # 6 rows left
df["units"] = df["units"].ffill()
df["price"] = df["price"].fillna(df["price"].median())
```

```go
clean := df.Clone().DropRowsContainNaN() // 6 rows left
df.FillForward(0, "units").FillWithMedian("price")
```

The `0` in `FillForward` is the limit: 0 means fill every gap, a positive number caps how many consecutive gaps it fills, like pandas' `limit=`. After this, the `units` gap on 11/03 holds 8 (copied from the row above) and the missing Tainan latte price holds 90, the median. There are also `FillBackward`, `FillWithMode` and `FillByInterpolation`.

One detail: an empty number cell in a CSV comes in as `NaN`, so `DropRowsContainNaN` is the `dropna` you want after `ReadCSV`. `DropRowsContainNil` handles `nil` cells, such as the empty first cell that `ShiftCol` leaves (next section).

## How do you shift, rename and drop columns in Go?

`ShiftCol` returns a shifted copy of a column, `ChangeColName` renames, and `DropColsByName` removes columns.

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

`ShiftCol` gives back a `DataList` (a single column), so `AppendCols` puts it into the table. The first row of `prev_units` is `nil`, the same spot where pandas puts `NaN`.

## How do you write CSV, Excel and SQL from Go like to_csv and read_sql?

`ToCSV` and `ToExcel` write files, and `ToSQL` / `ReadSQL` work through a [GORM](https://gorm.io) database connection.

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

The three booleans in `ToCSV` are: write row names as the first column (pandas' `index`), write column names as the first row (`header`), and add a UTF-8 BOM, which helps Excel recognize Chinese text as UTF-8.

For SQL, here's a SQLite round trip with the pure-Go `glebarez/sqlite` driver:

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

Use `Params` for anything that comes from a user, same as `params=` in pandas.

## What changes when you move from Python pandas to Go?

Three things trip people up when you switch to pandas for Golang: methods change the table in place, errors come back as values, and the formula language replaces lambdas for new columns.

- **In place by default.** `FillForward`, `SortBy`, `AddColUsingCCL`, `ChangeColName`, `DropColsByName` and `DropRowsContainNaN` change the table and return it, so you can chain them, and there's no `inplace=True` to remember. Call `Clone()` first when you want to keep the original. `FilterRowsWhere`, `GroupBy(...).Aggregate`, `Merge` and `Pivot` return a new table.
- **Errors are values.** Functions that can fail, like reading a file, `Merge` and `Pivot`, return an `error` next to the table. Check it the Go way.
- **Columns by name or by letter.** Most methods accept a column name, and many also take an Excel-style letter (`"A"`, `"B"`), which is handy for files with messy headers.

## Can you call real pandas from Go?

Yes. Insyra connects to Python directly: the `py` package runs real pandas from Go, and the `pd` package converts to gpandas, a pandas-style DataFrame written in Go.

**`py`: real pandas, called from Go.** `py.RunCodef` runs Python code and fills `$v1`, `$v2`, … with Go values. A `DataTable` arrives as a `pandas.DataFrame`; hand a DataFrame to `insyra.Return` and it comes back as a `DataTable`. The first run sets up its own Python environment with uv (pandas included), so it needs network access once.

```go
// import "github.com/HazelnutParadise/insyra/py"
// Fill the gaps in Go first: on v0.3.5, py can't send a NaN cell.
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

So the one pandas trick you can't live without can stay in pandas, and the rest of the program stays in Go.

**`pd`: gpandas, no Python at all.** `pd.FromDataTable(df)` turns a `DataTable` into a [gpandas](https://github.com/apoplexi24/gpandas) DataFrame, and `ToDataTable()` brings it back. Everything still compiles into one binary.

```go
// import "github.com/HazelnutParadise/insyra/pd"
gdf, err := pd.FromDataTable(df)
// ... gpandas methods ...
back, err := gdf.ToDataTable()
```

## Is a pandas function missing in Go? Open an issue

If the pandas call you reach for every day has no row in this cheat sheet, [open an issue on GitHub](https://github.com/HazelnutParadise/insyra/issues) and tell us which one. Bug reports, feature ideas and "how do I write this pandas line in Go" questions are all welcome there.

Pick one pandas script you run every week and port it line by line with the table above. For a full walk-through on one dataset, read [How to do your first data analysis in Go with Insyra](/posts/first-data-analysis-in-go-with-insyra/). To see how Insyra compares with other Go DataFrame libraries, read [Insyra vs Gota vs dataframe-go](/posts/insyra-vs-gota-vs-dataframe-go/), and for the bigger picture, [Can you do data analysis in Go?](/posts/can-you-do-data-analysis-in-go/)

[Insyra on GitHub](https://github.com/HazelnutParadise/insyra) · [Docs](https://hazelnutparadise.github.io/insyra/) ([DataTable](https://hazelnutparadise.github.io/insyra/#/DataTable), [DataList](https://hazelnutparadise.github.io/insyra/#/DataList)) · [Official site](https://insyra.hazelnut-paradise.com)
