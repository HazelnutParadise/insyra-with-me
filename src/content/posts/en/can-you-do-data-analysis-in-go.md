---
title: "Can you do data analysis in Go? 4 Golang libraries compared, plus Python interop"
description: "Yes, you can do data analysis in Golang. Compare Gonum, Gota, dataframe-go and Insyra, see which dataframe library is maintained, and call pandas from Go."
pubDate: 2026-11-18
category: guides
tags: ["faq", "data-analysis", "golang", "dataframe", "pandas", "gonum", "gota", "dataframe-go"]
faq: [{"q": "Can you do data analysis in Go?", "a": "Yes. Data analysis in Golang is real, and you can do the whole loop in Go: load a CSV or an Excel sheet, clean it, group it, run a test or a regression, draw a chart, and ship it all as one binary."}, {"q": "What's the best Go library for data analysis?", "a": "There's no single winner, because they don't all do the same job. If you only need math on numbers, Gonum is hard to beat. If you need a table and the analysis after it, that's the gap Insyra was built for."}, {"q": "Is there a pandas alternative for Golang?", "a": "Kind of, and it depends on what \"pandas\" means to you. If you mean \"a DataFrame with pandas-style names\", look at Gota and dataframe-go from the list above, or gpandas, which is modeled on pandas. If you mean \"the thing I open to load, clean, summarize and model data\", that's closer to what Insyra aims for. It isn't a pandas port and doesn't copy the API. It does the same job, the Go way. More on that in why I built a \"Pandas\" for Go."}, {"q": "Which golang dataframe library should I use?", "a": "For something new in 2026, I'd start with a library that's still maintained and has releases you can pin to a version. Archived doesn't mean broken, so existing Gota code that works can keep working. Nobody will fix what breaks next, though."}, {"q": "Can Go read an Excel file into a DataFrame?", "a": "Yes. The go-to Go library for Excel files is Excelize, and Insyra uses it under the hood too. With Gota you read rows with Excelize yourself and pass them to dataframe.LoadRecords. dataframe-go lists Excel as an export format. In Insyra it's one call: insyra.ReadExcelSheet(\"sales.xlsx\", \"2026\", false, true) reads a sheet into a DataTable, and dt.ToExcel(\"report.xlsx\", insyra.ExcelWriteOptions{Sheet: \"2026\", SetColNamesToFirstRow: true}) writes one back (new in v0.3.5). One heads-up for v0.3.5: cells read from Excel come in as strings, so convert numeric columns before you do math on them."}, {"q": "Can you do statistics and plotting in Golang?", "a": "Yes. Everyday statistics and the common chart types are all covered in Go. Here's what each kind of task means, and which library does it. Statistics: Descriptive statistics (mean, median, standard deviation, quartiles: the numbers that tell you what your data looks like): Gonum's stat computes them on a slice of numbers. Insyra computes them on a table column, and Describe prints a summary of the whole table at once, as in the example above. Correlation and regression (whether two numbers move together, and how well one predicts the other): Gonum and Insyra both do correlation and linear regression. Insyra also gives you the p-value, a number that shows whether the result could just be chance, and fits polynomial, exponential and logarithmic curves. Hypothesis tests (checking whether a difference between groups is real or just luck): Insyra's stats has t-tests, chi-square tests and ANOVA, which compares the averages of three or more groups in one go. Gonum has no ready-made tests. It gives you the probability distributions (normal, t, chi-square) to build one yourself. PCA (squeezing many columns into a few that keep most of the information): Insyra runs it on a table, and Gonum's stat runs it on a matrix. Insyra's README says its statistics are checked against R. Charts: Static charts (image files such as PNG, SVG or PDF, ready to drop into a report): gonum/plot draws them. Insyra's gplot wraps it, so a line chart, bar chart, scatter plot or histogram takes one function call to create. Interactive charts (HTML pages you open and interact with in a browser): go-echarts draws them. Insyra's plot wraps it and covers line, bar, scatter, pie, box plot and heatmap, and it can save a chart as PNG too. Models: Insyra's ml fits models such as linear and logistic regression, decision trees and random forests, in the style of Python's scikit-learn, and nn builds and trains neural networks. The README says both run with no Python runtime and no cgo (Go's way of calling C code)."}, {"q": "Go vs Python for data analysis: do you have to choose?", "a": "No. Keep Go as the main flow and call Python for the one step that needs it. Insyra connects to it directly, in two ways: py: real Python, called from Go. py.RunCodef runs Python code and fills $v1, $v2, … with your Go values. A DataTable arrives as a pandas.DataFrame and a DataList as a pandas.Series. Hand a pandas or polars DataFrame to insyra.Return and it comes back to Go as a DataTable (a Series comes back as a DataList). The first time, it sets up its own Python environment with uv and preinstalls numpy, pandas, polars, scikit-learn, statsmodels, matplotlib and a few more, so there's no venv for you to babysit. That first run needs network access. pd: gpandas, no Python at all. pd.FromDataTable turns a DataTable into a gpandas DataFrame and ToDataTable brings it back, for when you want pandas-style methods but still one Go binary. The round trip is shown in the comparison post."}]
draft: false
---

## Can you do data analysis in Go? The short answer

Yes. Data analysis in Golang is real, and you can do the whole loop in Go: load a CSV or an Excel sheet, clean it, group it, run a test or a regression, draw a chart, and ship it all as one binary.

Go's data ecosystem is smaller than Python's, and the tools are spread across a few libraries instead of one obvious stack. The good news: needing Python for one step doesn't mean leaving Go (more on that below). So the useful question isn't "can I", it's "which library does which part". That's what this FAQ answers.

## What's the best Go library for data analysis?

There's no single winner, because they don't all do the same job. Here's how I'd sort the four names you'll see most:

- **[Gonum](https://github.com/gonum/gonum): the numbers.** A set of numeric packages for Go: matrix math (`mat`), statistics (`stat`), optimization (finding the inputs that give the best result), graphs (networks of nodes and links) and more. It's actively maintained, with v0.17.0 out in January 2026 and releases on a six-month schedule. What it doesn't have is a table: you work with `[]float64` slices and matrices, not named columns. Its README also carries an "unstable" stability badge, so expect API changes between versions.
- **[Gota](https://github.com/go-gota/gota): the classic Go DataFrame.** It holds data as DataFrames (whole tables) and Series (single columns), loads CSV and JSON, filters rows, joins two tables on a shared column, and converts to and from Gonum matrices. The repo is archived (read-only), the last release is v0.12.0 from October 2021, and its README still says the API "is still in flux so *use at your own risk*".
- **[dataframe-go](https://github.com/rocketlaunchr/dataframe-go): the DataFrame with the long I/O list.** It reads and writes data files (CSV, JSONL, Parquet) and databases (MySQL, PostgreSQL), and exports to Excel. It can also fill gaps in a column by interpolation, forecast a time series from its past values, and draw plots. It has no statistics of its own: its README points you to a stats library such as Gonum or montanaflynn/stats. It isn't archived, but the last commit is from October 2021, there are no tagged releases, and the README says the API isn't stable yet and recommends pinning a commit.
- **[Insyra](https://github.com/HazelnutParadise/insyra): the whole workflow.** A `DataTable` (table) and `DataList` (column) at the core, with a sub-package for each job: `stats` runs statistics, `plot` and `gplot` draw charts, `ml` fits machine-learning models and `nn` builds neural networks. Current release v0.3.5, October 24, 2026, MIT licensed. Its README says it's evolving fast, so check the docs for your version.

If you only need math on numbers, Gonum is hard to beat. If you need a table and the analysis after it, that's the gap Insyra was built for.

## Is there a pandas alternative for Golang?

Kind of, and it depends on what "pandas" means to you.

If you mean "a DataFrame with pandas-style names", look at Gota and dataframe-go from the list above, or gpandas, which is modeled on pandas. If you mean "the thing I open to load, clean, summarize and model data", that's closer to what [Insyra](https://github.com/HazelnutParadise/insyra) aims for. It isn't a pandas port and doesn't copy the API. It does the same job, the Go way. More on that in [why I built a "Pandas" for Go](/posts/why-i-built-a-pandas-for-go/).

## Which golang dataframe library should I use?

For something new in 2026, I'd start with a library that's still maintained and has releases you can pin to a version. Archived doesn't mean broken, so existing Gota code that works can keep working. Nobody will fix what breaks next, though.

A full side-by-side of Gota, dataframe-go, qframe, gpandas and Insyra (I/O, group-by, joins, stats, charts, ML, repo status) is in [Insyra vs Gota vs dataframe-go: a Pandas alternative for Go](/posts/insyra-vs-gota-vs-dataframe-go/).

## Data analysis in Golang: a Gonum vs Insyra code example

Here's the same small analysis written twice, once with Gonum and once with Insyra: eight weeks of ad spend and signups. Do they move together?

**With Gonum alone**, you hold the columns yourself as slices:

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

Clean and fast to write. You get the numbers, but no p-value and no table, and keeping column names and text columns (like the ad channel) in sync is on you.

**With Insyra**, the data stays a table and the stats come with test results:

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

`Describe` is the `df.describe()` you know from pandas. It skips the text `channel` column by default (`DescribeOptions{IncludeAll: true}` keeps it). The two programs agree on r, intercept and slope. Versions used: Go 1.27.3, `gonum.org/v1/gonum` v0.17.0 and `github.com/HazelnutParadise/insyra` v0.3.5. If you've never touched Insyra, [your first data analysis in Go with Insyra](/posts/first-data-analysis-in-go-with-insyra/) walks through CSV → new column → group by → sort → save.

## Can Go read an Excel file into a DataFrame?

Yes. The go-to Go library for Excel files is [Excelize](https://github.com/qax-os/excelize), and Insyra uses it under the hood too. With Gota you read rows with Excelize yourself and pass them to `dataframe.LoadRecords`. dataframe-go lists Excel as an export format.

In Insyra it's one call: `insyra.ReadExcelSheet("sales.xlsx", "2026", false, true)` reads a sheet into a `DataTable`, and `dt.ToExcel("report.xlsx", insyra.ExcelWriteOptions{Sheet: "2026", SetColNamesToFirstRow: true})` writes one back (new in v0.3.5). One heads-up for v0.3.5: cells read from Excel come in as strings, so convert numeric columns before you do math on them.

## Can you do statistics and plotting in Golang?

Yes. Everyday statistics and the common chart types are all covered in Go. Here's what each kind of task means, and which library does it.

**Statistics**

- **Descriptive statistics** (mean, median, standard deviation, quartiles: the numbers that tell you what your data looks like): Gonum's `stat` computes them on a slice of numbers. Insyra computes them on a table column, and `Describe` prints a summary of the whole table at once, as in the example above.
- **Correlation and regression** (whether two numbers move together, and how well one predicts the other): Gonum and Insyra both do correlation and linear regression. Insyra also gives you the p-value, a number that shows whether the result could just be chance, and fits polynomial, exponential and logarithmic curves.
- **Hypothesis tests** (checking whether a difference between groups is real or just luck): Insyra's `stats` has t-tests, chi-square tests and ANOVA, which compares the averages of three or more groups in one go. Gonum has no ready-made tests. It gives you the probability distributions (normal, t, chi-square) to build one yourself.
- **PCA** (squeezing many columns into a few that keep most of the information): Insyra runs it on a table, and Gonum's `stat` runs it on a matrix.

Insyra's README says its statistics are checked against R.

**Charts**

- **Static charts** (image files such as PNG, SVG or PDF, ready to drop into a report): [gonum/plot](https://github.com/gonum/plot) draws them. Insyra's `gplot` wraps it, so a line chart, bar chart, scatter plot or histogram takes one function call to create.
- **Interactive charts** (HTML pages you open and interact with in a browser): [go-echarts](https://github.com/go-echarts/go-echarts) draws them. Insyra's `plot` wraps it and covers line, bar, scatter, pie, box plot and heatmap, and it can save a chart as PNG too.

**Models:** Insyra's `ml` fits models such as linear and logistic regression, decision trees and random forests, in the style of Python's scikit-learn, and `nn` builds and trains neural networks. The README says both run with no Python runtime and no cgo (Go's way of calling C code).

## Go vs Python for data analysis: do you have to choose?

No. Keep Go as the main flow and call Python for the one step that needs it. Insyra connects to it directly, in two ways:

- **`py`: real Python, called from Go.** `py.RunCodef` runs Python code and fills `$v1`, `$v2`, … with your Go values. A `DataTable` arrives as a `pandas.DataFrame` and a `DataList` as a `pandas.Series`. Hand a pandas or polars DataFrame to `insyra.Return` and it comes back to Go as a `DataTable` (a Series comes back as a `DataList`). The first time, it sets up its own Python environment with uv and preinstalls numpy, pandas, polars, scikit-learn, statsmodels, matplotlib and a few more, so there's no venv for you to babysit. That first run needs network access.
- **`pd`: gpandas, no Python at all.** `pd.FromDataTable` turns a `DataTable` into a [gpandas](https://github.com/apoplexi24/gpandas) DataFrame and `ToDataTable` brings it back, for when you want pandas-style methods but still one Go binary. The round trip is shown in the [comparison post](/posts/insyra-vs-gota-vs-dataframe-go/).

Here's the `py` route with the same ad data. Go reads it, pandas does a quick groupby, and the answer lands back in Go as a `DataTable`:

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

	// $v1 arrives in Python as a pandas.DataFrame.
	// Whatever DataFrame you hand to insyra.Return comes back as a DataTable.
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

So social brings in more signups per 100 spent, even though search gets more budget. `byChannel` is an ordinary `DataTable` again, so the rest (stats, a chart, `ToExcel`) stays in Go. In Insyra v0.3.5 the managed environment uses Python 3.12, and a polars DataFrame returned through `insyra.Return` also lands as a `DataTable`.

Two caveats. Each call runs Python as a separate process and passes the data over local IPC, so call it for a step, not inside a hot loop. And if your whole day is exploring data in a notebook, Jupyter + pandas is still the smoothest place to do that. Go starts to make the most sense once the analysis turns into a program: a service, a CLI, a scheduled job, one binary you can ship.

## Missing something for data analysis in Go? Open an issue

If Insyra is missing the one thing you need to do data analysis in Go, [open an issue on GitHub](https://github.com/HazelnutParadise/insyra/issues). Bug reports, feature ideas and "how do I do X" questions are all welcome there.

[Insyra on GitHub](https://github.com/HazelnutParadise/insyra) · [Docs](https://hazelnutparadise.github.io/insyra/) ([DataTable](https://hazelnutparadise.github.io/insyra/#/DataTable), [DataList](https://hazelnutparadise.github.io/insyra/#/DataList)) · [Official site](https://insyra.hazelnut-paradise.com)
