---
title: "Insyra vs Gota vs dataframe-go: a Pandas alternative for Go"
description: "Looking for a Golang pandas alternative? An honest look at Gota, dataframe-go, qframe, gpandas and Insyra: scope, maintenance, and when to pick which."
pubDate: 2026-11-18
category: guides
tags: ["comparison", "dataframe", "pandas", "gota", "dataframe-go", "qframe", "gpandas"]
draft: false
---

## The short answer

If you're searching for a Golang pandas alternative, you'll find a handful of names over and over: Gota, dataframe-go, qframe, gpandas, and (hi) Insyra, which I build. They're not all trying to do the same thing, so "which is best" is the wrong question. "Which one fits the job in front of me" is the right one.

My one-paragraph version: if all you need is a fast, immutable table for filtering and grouping, qframe is a fine pick. If you want the most pandas-shaped API, look at gpandas (and Insyra can talk to it). If the analysis keeps going past the table, into statistics, charts, models and neural nets, that's the job I built Insyra for. Gota and dataframe-go did a lot for Go data work, but check their status below before you start something new on them.

Everything here was checked against each project's repo and README on November 12, 2026. No benchmarks, because I haven't run fair ones, and a made-up chart helps nobody.

## The contenders

**[Gota](https://github.com/go-gota/gota)** is the best-known Go DataFrame library (about 3.3k GitHub stars). It has DataFrames and Series, CSV and JSON loading, filtering, `GroupBy` with aggregation, sorting with `Arrange`, joins, and a bridge to gonum matrices. The repository is archived (read-only) on GitHub. Its last release is v0.12.0 from October 2021, and its README says the API "is still in flux so *use at your own risk*". A lot of Go code learned DataFrames from Gota, me included.

**[dataframe-go](https://github.com/rocketlaunchr/dataframe-go)** (rocketlaunchr) has the widest I/O list of the older libraries: CSV, JSONL, Parquet, MySQL and PostgreSQL in and out, plus Excel export. It also has interpolation, time-series forecasting (SES, Holt-Winters), and plotting through go-chart. For statistics, its README points you to gonum or montanaflynn/stats. It isn't archived, but the last commit is from October 2021 and it has no tagged releases. The README warns that the API isn't stable yet and recommends pinning a commit.

**[qframe](https://github.com/tobgu/qframe)** is an immutable data frame: every operation returns a new QFrame and leaves the original alone, sharing the underlying data where it can. It reads and writes CSV, record-oriented JSON and any `database/sql` database, and does filtering, grouping, aggregation and column expressions. It also chains errors nicely: an error sets `Err` on the frame and stops later operations. Its last commit is from July 2024, and joins are listed under ideas for future work.

**[gpandas](https://github.com/apoplexi24/gpandas)** is the newest of the group and the most pandas-like. It's built on generics and has `Loc`/`iLoc` indexing, merges, group-by aggregations, rolling windows, `Describe()`, CSV, JSON, Excel, Parquet, SQL and BigQuery loading, and go-echarts charts. Its last commit is from September 30, 2026.

**[Insyra](https://github.com/HazelnutParadise/insyra)** is mine, so read this part with that in mind. Its core types are `DataList` (a column) and `DataTable` (a table of columns). Around them sit separate packages for statistics, charts, machine learning and neural networks. The current release is v0.3.5 "Huashan" (October 24, 2026), MIT licensed. The README is honest that it's evolving fast, so check the docs for the version you're on.

## Golang dataframe library comparison table

✅ = documented in the project's README or docs. "Not documented" means I couldn't find it there, not that it's impossible.

| | Gota | dataframe-go | qframe | gpandas (v0.6.0) | Insyra (v0.3.5) |
|---|---|---|---|---|---|
| Repo status (Nov 12, 2026) | Archived | Not archived; last commit Oct 2021 | Not archived; last commit Jul 2024 | Active; last commit Sep 2026 | Active; release Oct 2026 |
| License | Apache-2.0 | MIT | MIT | Apache-2.0 | MIT |
| Core types | DataFrame, Series | DataFrame, Series | QFrame (immutable) | DataFrame, Series | DataTable, DataList |
| CSV | ✅ | ✅ | ✅ | ✅ | ✅ |
| JSON | ✅ (read) | ✅ (JSONL) | ✅ | ✅ | ✅ |
| Excel | Not documented | ✅ (export) | Not documented | ✅ | ✅ |
| Parquet | Not documented | ✅ | Not documented | ✅ | ✅ (`parquet`) |
| SQL databases | Not documented | ✅ (MySQL, PostgreSQL) | ✅ (`database/sql`) | ✅ (+ BigQuery) | ✅ (via GORM) |
| Group by + aggregate | ✅ | Not documented | ✅ | ✅ | ✅ |
| Joins / merge | ✅ | Not documented | Listed as future work | ✅ | ✅ |
| Statistics | Aggregations | Via gonum / montanaflynn/stats | Aggregations | Summary stats (`Describe`, skew, kurtosis…) | Hypothesis tests, ANOVA, regressions, PCA… (`stats`) |
| Charts | Not documented | ✅ (go-chart) | Not documented | ✅ (go-echarts) | ✅ (`plot`: go-echarts, `gplot`: gonum/plot) |
| Machine learning | Not documented | Not documented | Not documented | Not documented | ✅ (`ml`) |
| Neural networks | Not documented | Not documented | Not documented | Not documented | ✅ (`nn`) |

## Where the others are the better choice

I'd rather you pick the right tool than pick mine:

- **You want immutability and a small API.** qframe's "every operation returns a new frame" design is easy to reason about in concurrent code, and its README sets performance as a design goal. If your work is filter, group, aggregate, write out, it's a clean fit.
- **You think in pandas.** gpandas follows pandas' names and behavior on purpose (`Loc`, `iLoc`, `_x`/`_y` merge suffixes, ddof=1 standard deviation). If you're porting a notebook line by line, that familiarity is worth a lot.
- **You have existing Gota code that works.** Archived doesn't mean broken. It means nobody will fix what breaks next. For a new project, I'd start somewhere maintained.
- **You need dataframe-go's forecasting or interpolation helpers.** They're there in the README. Just pin a commit, as the README itself recommends.

## What Insyra does beyond the DataFrame

This is the part I care about most. Calling it Go's answer to pandas + scikit-learn is a fair shorthand, but the table is only the start. From there, the same module can keep going into stats, charts, machine learning, and neural nets, and you only import the packages you actually use.

All snippets below were built against `github.com/HazelnutParadise/insyra@v0.3.5` with Go 1.27.3, and they also build with `CGO_ENABLED=0`.

**Statistics (`stats`).** Hypothesis tests, ANOVA, regressions, PCA, factor analysis, clustering and more. The README says stats are checked against R.

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

**Charts (`plot` and `gplot`).** `plot` makes interactive go-echarts charts you can save as HTML. `gplot` makes static gonum/plot charts (PNG, PDF, SVG) without needing Chrome.

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

**Machine learning (`ml`) and neural networks (`nn`).** `ml` has scikit-learn-style regressions, decision trees, random forests, gradient boosting, pipelines, cross-validation, grid search and ONNX export. `nn` trains networks with an autodiff tape and a `Sequential` layer API, and runs published ONNX models. The README says both run with no Python runtime and no cgo.

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

// And a neural net, same module, still Go:
tape := nn.NewTape(42)
model, err := nn.NewSequential(tape,
	nn.Dense(784, 128), nn.ReLU(), nn.Dropout(0.2), nn.Dense(128, 10),
)
```

There's more I won't list here (Parquet streaming, CCL column formulas, a CLI with a REPL, a `py` package for when you really do need Python). The [docs](https://hazelnutparadise.github.io/insyra/) have all of it.

## Insyra and gpandas: friends, not rivals

Insyra has a `pd` package, a thin wrapper around gpandas (v0.6.0 in Insyra's current `go.mod`). It converts an Insyra `DataTable` to a gpandas `DataFrame` and back, keeping column order and row names. `FromGPandasDataFrame` and `FromGPandasSeries` wrap gpandas values you already have.

So you don't have to choose: use gpandas' pandas-style API where you like it, then come back to a `DataTable` for `stats`, `plot` or `ml`. To be clear, the DataFrame methods come from gpandas, not from Insyra. Credit to [apoplexi24](https://github.com/apoplexi24/gpandas).

```go
dt := insyra.NewDataTable(
	insyra.NewDataList("Alice", "Bob").SetName("name"),
	insyra.NewDataList(30, 25).SetName("age"),
)

df, err := pd.FromDataTable(dt) // Insyra -> gpandas
if err != nil {
	panic(err)
}
fmt.Println(df.String()) // String() is gpandas' own method

back, err := df.ToDataTable() // gpandas -> Insyra
if err != nil {
	panic(err)
}
back.Show()
```

## How I'd choose

- Filter, group and write out, and you want immutability: **qframe**.
- Porting pandas code and you want the same names: **gpandas**.
- The analysis keeps going into statistics, charts, models or neural nets, and you'd like all of that in one Go module: **Insyra**. That's the gap I kept hitting, and it's [why I built it](/posts/why-i-built-a-pandas-for-go/).
- Starting something new on Gota or dataframe-go: check the repo status first.

## Try it

If you want to see Insyra on a real (tiny) dataset first, [How to do your first data analysis in Go with Insyra](/posts/first-data-analysis-in-go-with-insyra/) walks through load, add a column, group, sort and save in one program.

```sh
go get github.com/HazelnutParadise/insyra/allpkgs
```

Repo: https://github.com/HazelnutParadise/insyra · Docs: https://hazelnutparadise.github.io/insyra/ · If I got something wrong about any of these libraries, tell me on X ([@TimLai666](https://x.com/TimLai666)) and I'll fix it.
