---
title: "Why I built Insyra, a \"Pandas\" for Go"
description: "Why Insyra exists, what \"a Pandas for Go\" does and doesn't mean, and the same analysis in pandas and in Insyra side by side."
pubDate: 2026-11-11
category: community
tags: ["insyra", "pandas", "go", "data-analysis"]
---

## The short version

When people ask what Insyra is, I say it's a "Pandas" for Go. The quotes are on purpose. It isn't a port of pandas and it doesn't copy its API. It's the same *job*: load data, clean it, add columns, group, summarize, export. Done in Go, the way Go code is usually written.

I opened the repo on August 29, 2024. This is why.

## The itch

A lot of analysis doesn't stay in a notebook. It gets called by a service, or an AI agent, or it turns into an app other people run. That's the point where I wanted it to be Go: one binary, no Python environment to ship along with it.

And honestly, I'm lazy (ask anyone). I didn't want to write the analysis in one language and then write it again in another to ship it.

## Before and after

Here's a small task: six orders, revenue = price × qty, total revenue per region, biggest first.

In pandas:

```python
import pandas as pd

df = pd.read_csv("sales.csv")
df["revenue"] = df["price"] * df["qty"]
print(df.groupby("region")["revenue"].sum().sort_values(ascending=False))
```

In Go with Insyra v0.3.5:

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

Yes, the Go one is longer. It's Go. You get named fields instead of keyword magic, an `err` you can't pretend isn't there, and a compiler that complains before your data does. (If you want it shorter, the `isr` package is syntactic sugar for exactly that.)

The full runnable version, with its real output, is in [How to do your first data analysis in Go with Insyra](/posts/first-data-analysis-in-go-with-insyra/).

## What "a Pandas for Go" means in practice

- **Two core types.** `DataList` is one column of values; `DataTable` is a table of them. A column of a `DataTable` is a `DataList`, so `dt.GetColByName("revenue").Mean()` just works.
- **Excel-style column formulas.** CCL (Column Calculation Language) lets you write `IF(A > 90, 'Excellent', 'Average')` or `['price'] * ['qty']`. Most people who do data work already know Excel formulas, so I'd rather meet them there than invent a new mini-language.
- **Chaining without losing errors.** `DataList` and `DataTable` keep the last error on the instance, so you can chain calls and check `Err()` once at the end.
- **Checked against references.** Statistics are checked against R, `ml` models against scikit-learn, and `nn` against PyTorch and onnxruntime, as the README says. A data library that's confidently wrong is worse than no library.
- **Pure Go where it matters.** `ml` and `nn` run with no Python runtime and no cgo.

## What it is not

- **Not a drop-in pandas clone.** Method names and behavior follow Go, not pandas. If you really want a pandas-shaped `DataFrame`, there's a `pd` package built on `gpandas` that converts to and from `DataTable`.
- **Not finished.** The README literally says the project is evolving rapidly, and that features not listed in the docs are still experimental. Check the docs for the version you're on.

## The rest of the family

- [Idensyra](https://github.com/HazelnutParadise/idensyra) is a mini Go IDE with Insyra pre-installed, so you can run Go analysis code without installing Go.
- [Syralit](https://github.com/HazelnutParadise/syralit) turns an analysis into a web app: Go-native, Streamlit-inspired, renders `DataTable` and `DataList` directly.

## Try it

```sh
go get github.com/HazelnutParadise/insyra/allpkgs
```

Repo: https://github.com/HazelnutParadise/insyra · Docs: https://hazelnutparadise.github.io/insyra/ · Tell me what you'd want it to do next by [opening an issue](https://github.com/HazelnutParadise/insyra/issues).
