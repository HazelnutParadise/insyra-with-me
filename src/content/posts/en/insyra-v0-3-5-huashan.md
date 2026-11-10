---
title: "Insyra v0.3.5 \"Huashan\": what's new"
description: "Insyra v0.3.5 brings GPU training steps, a new quant/ta package, I/O without files on disk, Excel export, and requires Go 1.26."
pubDate: 2026-11-13
category: releases
tags: ["release", "v0.3.5", "excel", "csv", "quant", "gpu"]
draft: true
---

Insyra v0.3.5, still on the "Huashan" 0.3.x line, was released on October 24, 2026. Here's the part I'd want to know if I were upgrading. Everything below comes from the [v0.3.5 release notes](https://github.com/HazelnutParadise/insyra/releases/tag/v0.3.5) and the [changelog](https://github.com/HazelnutParadise/insyra/blob/main/CHANGELOG.md#v035).

## Highlights

- **A training step can stay on the GPU.** `Tensor.To(dev)`, `ToHost()` and `Release()` move a float32 tensor to a device and back bit for bit, and the tape's MatMul, Add, SoftmaxCrossEntropy and the SGD, Adam and AdamW steps run there. The release notes also put 2-D float32 `MatMul` on the CPU at 1.2 to 2.9 times faster.
- **New `quant/ta` package for technical analysis.** Trend (`SMA`, `EMA`, `MACD`, `Ichimoku`, ...), channels and stops (`Bollinger`, `Keltner`, `SuperTrend`, ...), oscillators (`RSI`, `KD`, `CCI`, ...), volume (`OBV`, `MFI`, ...), `CandlePatterns` and more. Where TA-Lib has the same indicator, the result is checked against it.
- **`quant` for market-efficiency research.** `QuantileSort`, `FamaMacBeth`, `EventStudy`, and data-snooping tests `RealityCheck`, `SPATest` and `RomanoWolf`.
- **`datafetch` for Taiwan and Japan markets.** TAIFEX futures and options history, odd-lot quotes, shareholding distribution, monthly revenue, FinMind and JPX investor-type trading.
- **I/O without a file on disk.** `ReadCSV` reads from any `io.Reader`, `StreamCSV` reads a CSV a batch at a time, and a `DataTable` can now be written to Excel with `ToExcel`.
- **Smaller core niceties.** `SliceRows` / `SliceCols`, `FilterRowsWhere`, `ColDataTypes`, `ShowHead` / `ShowTail`, and CCL `DATEPART`.

## The one I'll use every day: read from anywhere, write to Excel

Before v0.3.5, reading a CSV meant a file path or a string. Now `ReadCSV` takes any `io.Reader` (an HTTP response body, an `embed.FS` file, bytes in memory), and `ToExcel` writes a table as one sheet of a workbook:

```go
package main

import (
	"fmt"
	"strings"

	"github.com/HazelnutParadise/insyra"
)

func main() {
	// Any io.Reader works: an HTTP body, an embed.FS file, bytes in memory.
	r := strings.NewReader("name,age,city,joined\nAmy,31,Taipei,2024\nBen,27,Tainan,2025\nCara,35,Taichung,2023\n")
	dt, err := insyra.ReadCSV(r, insyra.CSVReadOptions{FirstRowToColNames: true})
	if err != nil {
		panic(err)
	}

	fmt.Println(dt.ColDataTypes())

	// Columns from B up to (not including) D, like s[from:to] on a Go slice.
	dt.SliceCols("B", "D").ShowHead(2)

	// Write the table as one sheet of a workbook.
	if err := dt.ToExcel("people.xlsx", insyra.ExcelWriteOptions{
		Sheet:                 "2026",
		SetColNamesToFirstRow: true,
	}); err != nil {
		panic(err)
	}
	fmt.Println("saved people.xlsx")
}
```

Output with v0.3.5 (the first line is Insyra's info log):

```text
2026/11/10 19:00:50 [insyra - Info] insyra.ReadCSV: Auto-detected encoding utf-8 for the CSV input
[string number string number]
DataTable (3 rows x 2 columns) [showing rows 0 to 1]
================================================================================
 stat (selected range): A(mean=29.00, range=[27.00, 31.00]) 
--------------------------------------------------------------------------------
RowNames   A(age)  B(city)  
---------- ------- ---------
0:             31  'Taipei' 
1:             27  'Tainan' 

saved people.xlsx
```

If `people.xlsx` already exists, `ToExcel` keeps its other sheets. If the sheet you name is already there, it returns an error matching `ErrSheetExists` and leaves the file alone, unless you set `IfSheetExists: insyra.SheetExistsReplace`. So one workbook with one sheet per year is a few lines. (Run the example above twice and you'll see it: the second run stops with `sheet already exists: 2026 in people.xlsx`. That's the safe default doing its job.)

## Breaking changes

The release notes list five. Each one is an input or output that was wrong, refused or unsafe before:

- **Go 1.26 is required.** The `go` directive is `1.26.9`. Go 1.25 stopped receiving fixes when Go 1.27 was released, and eleven standard-library vulnerabilities published on 2026-10-08 were fixed only in newer releases.
- **`ToSQL` names an unnamed column by its letter** (`A`, `B`, ...) instead of `""`, which MySQL and PostgreSQL refuse.
- **CCL turns a float into text as plain decimal digits.** `'x' & A` for A = 0.0000001 is now `x0.0000001`, not `x1e-07`; `LEN(1000000)` is 7. Use `TOSTR(x, '%g')` for the old spelling.
- **Error text for a cell now counts from zero**, the same number `Get(i)` takes (`row index 2`).
- **`FactorAnalysis` with oblimin and `Restarts` above 1** now really restarts.

Also worth knowing: `DataList.Difference`, `MovingAverage`, `MovingStdev` and `WeightedMovingAverage` are deprecated and will be removed in 0.4. Their replacements are `Diff(1)` and `Rolling(...)`.

## Upgrade

```sh
go get -u github.com/HazelnutParadise/insyra/allpkgs@v0.3.5
```

With Go 1.21 or newer, the `go` command downloads the 1.26.9 toolchain automatically unless `GOTOOLCHAIN=local` is set.

Full notes: [GitHub release v0.3.5](https://github.com/HazelnutParadise/insyra/releases/tag/v0.3.5) · [CHANGELOG](https://github.com/HazelnutParadise/insyra/blob/main/CHANGELOG.md#v035) · Docs: https://hazelnutparadise.github.io/insyra/ ([DataTable](https://hazelnutparadise.github.io/insyra/#/DataTable), [DataList](https://hazelnutparadise.github.io/insyra/#/DataList)) · Official site: https://insyra.hazelnut-paradise.com
