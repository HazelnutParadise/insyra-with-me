---
title: "How to read and write Excel files in Golang with Insyra"
description: "How to read and write Excel files in Golang: load a sheet into a DataTable, fix text numbers, write one sheet per year and serve an .xlsx download."
pubDate: 2026-11-28
category: guides
tags: ["excel", "xlsx", "golang", "datatable", "csv", "data-analysis"]
faq: [{"q": "How do you read an Excel file in Golang?", "a": "Call insyra.ReadExcelSheet(path, sheet, false, true). It opens the workbook, reads one sheet into a DataTable and uses the first row as column names. For an upload or an HTTP body, insyra.ReadExcel does the same from any io.Reader."}, {"q": "Why are Excel numbers strings after reading them in Go?", "a": "In Insyra v0.3.5 every cell read from Excel arrives as text, the same way Excelize's GetRows returns strings. Convert a column with ParseNumbers and put it back with UpdateCol before doing math."}, {"q": "How do you write an Excel file in Golang without overwriting a sheet?", "a": "dt.ToExcel(path, insyra.ExcelWriteOptions{Sheet: \"2026\", SetColNamesToFirstRow: true}) adds the sheet and keeps the other sheets. If the sheet already exists it returns an error matching insyra.ErrSheetExists; set IfSheetExists: insyra.SheetExistsReplace to replace it."}, {"q": "How do you export Excel as an HTTP download in Go?", "a": "Set the Content-Type and Content-Disposition headers, then call dt.WriteExcel(w, opts) with the http.ResponseWriter. No temp file is needed."}]
draft: false
---

Somebody always wants it in Excel. The finance team, your boss, the client who "just needs the numbers". You can fight it, or you can make Go hand them a nice `.xlsx` and get on with your day. This post is about the second option.

Here's how to read and write Excel files in Golang, step by step: read an Excel sheet into a table, turn its text cells into real numbers, write a report with one sheet per year, serve an Excel download from an HTTP handler, and convert between CSV and Excel. Every example uses [Insyra](https://github.com/HazelnutParadise/insyra) v0.3.5, a data analysis library for Golang, so you work with a `DataTable` instead of a `[][]string`.

One line installs every Insyra package, including the `csvxl` and `py` packages used below:

```bash
go get github.com/HazelnutParadise/insyra/allpkgs@v0.3.5
```

The sample data is a tiny `sales.csv`, two stores and four months:

```text
year,month,store,units,revenue
2025,Nov,Taipei,120,36000
2025,Nov,Tainan,80,22400
2025,Dec,Taipei,150,45000
2025,Dec,Tainan,95,26600
2026,Jan,Taipei,110,33000
2026,Jan,Tainan,90,25200
2026,Feb,Taipei,130,39000
2026,Feb,Tainan,70,19600
```

## How do you read an Excel file in Golang?

Use `insyra.ReadExcelSheet(path, sheet, setFirstColToRowNames, setFirstRowToColNames)`. It opens the workbook and loads one sheet into a `DataTable`. Here it reads the `2026` sheet of `report.xlsx`, the workbook built from `sales.csv` in the one-sheet-per-year section below:

```go
// sheet "2026", no row names, first row = column names
dt, err := insyra.ReadExcelSheet("report.xlsx", "2026", false, true)
if err != nil {
	panic(err)
}
dt.Show()
```

```text
DataTable (4 rows x 5 columns)
================================================================================
 stat: A(mean=2026.00, range=[2026.00, 2026.00]) 
--------------------------------------------------------------------------------
RowNames   A(year)  B(month)  C(store)  D(units)  E(revenue) 
---------- -------- --------- --------- --------- -----------
0:         '2026'   'Jan'     'Taipei'  '110'     '33000'    
1:         '2026'   'Jan'     'Tainan'  '90'      '25200'    
2:         '2026'   'Feb'     'Taipei'  '130'     '39000'    
3:         '2026'   'Feb'     'Tainan'  '70'      '19600'    
```

Compare that with plain Excelize, where you open the file, call `GetRows`, get a `[][]string` back, and then build your own structure from it. Short rows are another classic trap: `GetRows` drops empty cells at the end of a row, so rows come back with different lengths. `ReadExcelSheet` fills those gaps with `nil`, so every column has the same length.

Don't know the sheet names? `csvxl.SheetNames("report.xlsx")` lists them in workbook order.

## Why are Excel numbers strings when you read them in Go?

Because on Insyra v0.3.5, every cell read from Excel arrives as text. See the quotes around `'33000'` above? That's a string. It's the same thing Excelize does with `GetRows`, so it's not a surprise, but it does bite the first time you try to add things up.

The fix is two calls per column: `ParseNumbers` turns the text in a column into numbers, and `UpdateCol` puts the column back:

```go
revenue := dt.GetColByName("revenue")
fmt.Printf("revenue[0] is %T: %q\n", revenue.Get(0), revenue.Get(0))

// Turn the number columns into numbers.
for _, col := range []string{"units", "revenue"} {
	dt.UpdateCol(dt.GetColIndexByName(col), dt.GetColByName(col).ParseNumbers())
}
revenue = dt.GetColByName("revenue")
fmt.Printf("revenue[0] is %T: %v\n", revenue.Get(0), revenue.Get(0))
fmt.Println("2026 revenue:", revenue.Sum())
```

```text
revenue[0] is string: "33000"
revenue[0] is float64: 33000
2026 revenue: 116800
```

Before: a string. After: a `float64`, and `Sum` works. A cell that isn't a number, like `N/A`, stays as it is and Insyra logs a warning, so one stray note in a sheet doesn't crash the whole run. Convert before you write the table back with `ToExcel` too, or the numbers go into the spreadsheet as text.

## How do you read an Excel file from an upload in Go?

Use `insyra.ReadExcel(r, sheet, false, true)`. It takes any `io.Reader` (an upload, an HTTP response body, bytes in memory) and works exactly like `ReadExcelSheet`, without saving a file first. You'll see it in action in the HTTP download section below, reading straight from a response body.

## Excelize or Insyra: which Golang Excel library should you use?

Use [Excelize](https://github.com/qax-os/excelize) when the job is the spreadsheet itself (styles, merged cells, charts, formulas, templates), and use Insyra when the job is the data in it. They aren't rivals: Insyra reads and writes Excel through Excelize under the hood.

| You want to... | Reach for |
|---|---|
| Format cells, merge ranges, add charts or fill a template | Excelize |
| Read a sheet into a table and filter, group or summarize it | Insyra (`ReadExcelSheet`) |
| Write a table as a sheet without wiping the others | Insyra (`ToExcel` + `ErrSheetExists`) |
| Send an `.xlsx` to a browser | Either (`WriteExcel` in Insyra) |
| Batch-convert CSV and Excel files | Insyra's `csvxl` |

Once the sheet is a `DataTable`, the rest of data analysis in Golang is the same as with a CSV. [How to do your first data analysis in Go with Insyra](/posts/first-data-analysis-in-go-with-insyra/) walks through new columns, group by and sorting, and [Can you do data analysis in Go?](/posts/can-you-do-data-analysis-in-go/) covers the bigger picture.

## How do you write an Excel file in Golang?

Call `ToExcel` on a `DataTable` with a path and an `ExcelWriteOptions`. That's the whole API for writing Excel files in Go with Insyra:

```go
opts := insyra.ExcelWriteOptions{Sheet: "2026", SetColNamesToFirstRow: true}
err := dt.ToExcel("report.xlsx", opts)
```

`Sheet` names the sheet (empty means `Sheet1`), `SetColNamesToFirstRow` writes the header row, and `SetRowNamesToFirstCol` writes row names if your table has them. Numbers, booleans and `time.Time` values land in Excel as real values, so they sort and sum in the spreadsheet. The path needs a modern extension like `.xlsx`; the old `.xls` format can't be written.

Two more things make `ToExcel` pleasant in a real job. If `report.xlsx` doesn't exist, it's created. If it does exist, every other sheet in it stays exactly as it was. And the file is written to a temp file and renamed into place, so a crash halfway never leaves you with a broken workbook.

## How do you write one Excel sheet per year in Go without overwriting?

Loop over the years, filter the rows for each year, and call `ToExcel` with a different `Sheet` each time. Here's the full program:

```go
package main

import (
	"errors"
	"fmt"
	"os"

	"github.com/HazelnutParadise/insyra"
	"github.com/HazelnutParadise/insyra/csvxl"
)

func main() {
	_ = os.Remove("report.xlsx") // start from a clean workbook

	sales, err := insyra.ReadCSV_FileWithOptions("sales.csv", insyra.CSVReadOptions{FirstRowToColNames: true})
	if err != nil {
		panic(err)
	}

	// One sheet per year.
	for _, year := range []string{"2025", "2026"} {
		rows := sales.FilterRowsWhere(func(row *insyra.DataList) bool {
			return fmt.Sprint(row.Get(0)) == year
		})
		opts := insyra.ExcelWriteOptions{Sheet: year, SetColNamesToFirstRow: true}
		if err := rows.ToExcel("report.xlsx", opts); err != nil {
			panic(err)
		}
	}

	sheets, _ := csvxl.SheetNames("report.xlsx")
	fmt.Println("sheets:", sheets)

	// Write 2026 again: the default refuses to overwrite.
	latest := sales.FilterRowsWhere(func(row *insyra.DataList) bool {
		return fmt.Sprint(row.Get(0)) == "2026"
	})
	opts := insyra.ExcelWriteOptions{Sheet: "2026", SetColNamesToFirstRow: true}
	err = latest.ToExcel("report.xlsx", opts)
	fmt.Println("second write:", err)
	fmt.Println("is ErrSheetExists:", errors.Is(err, insyra.ErrSheetExists))

	// Ask for a replace and it goes through.
	opts.IfSheetExists = insyra.SheetExistsReplace
	if err := latest.ToExcel("report.xlsx", opts); err != nil {
		panic(err)
	}
	sheets, _ = csvxl.SheetNames("report.xlsx")
	fmt.Println("after replace:", sheets)
}
```

Output:

```text
[insyra - Info] insyra.ReadCSV: Auto-detected encoding utf-8 for sales.csv
sheets: [2025 2026]
second write: sheet already exists: 2026 in report.xlsx
is ErrSheetExists: true
after replace: [2025 2026]
```

This is my favorite part. Writing to a sheet that already exists fails by default with an error you can match with `errors.Is(err, insyra.ErrSheetExists)`, and the file isn't touched. So a nightly job that runs twice can't quietly wipe last year's numbers. When you do want to refresh a sheet, say so with `IfSheetExists: insyra.SheetExistsReplace`. The new sheet takes the old one's place in the tab order, so the workbook still reads 2025, 2026.

## How do you export Excel as an HTTP download in Golang?

Set two headers and call `WriteExcel` with the `http.ResponseWriter`. `WriteExcel` writes the table as a new one-sheet workbook to any `io.Writer`, so no temp file is involved:

```go
package main

import (
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"

	"github.com/HazelnutParadise/insyra"
)

func reportHandler(w http.ResponseWriter, r *http.Request) {
	sales, err := insyra.ReadCSV_FileWithOptions("sales.csv", insyra.CSVReadOptions{FirstRowToColNames: true})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	w.Header().Set("Content-Disposition", `attachment; filename="sales.xlsx"`)
	opts := insyra.ExcelWriteOptions{Sheet: "sales", SetColNamesToFirstRow: true}
	if err := sales.WriteExcel(w, opts); err != nil {
		log.Println("write excel:", err)
	}
}

func main() {
	// In a real service: http.HandleFunc("/report.xlsx", reportHandler)
	srv := httptest.NewServer(http.HandlerFunc(reportHandler))
	defer srv.Close()

	resp, err := http.Get(srv.URL + "/report.xlsx")
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	fmt.Println(resp.Status, resp.Header.Get("Content-Disposition"))

	// ReadExcel takes any io.Reader, so the response body reads straight in.
	dt, err := insyra.ReadExcel(resp.Body, "sales", false, true)
	if err != nil {
		panic(err)
	}
	rows, cols := dt.Size()
	fmt.Println("rows:", rows, "cols:", cols, "columns:", dt.ColNames())
}
```

```text
[insyra - Info] insyra.ReadCSV: Auto-detected encoding utf-8 for sales.csv
200 OK attachment; filename="sales.xlsx"
rows: 8 cols: 5 columns: [year month store units revenue]
```

`main` spins up a test server so the round trip fits in one program: the handler writes the workbook, and `ReadExcel` reads it back from `resp.Body`. In your service, register `reportHandler` on your router and the browser gets a `sales.xlsx` download.

## How do you convert CSV to Excel and Excel to CSV in Go?

Use the `csvxl` package: `CSVToExcel` turns CSV files into sheets of one workbook, and `ExcelToCSV` writes one CSV per sheet.

```go
package main

import (
	"fmt"
	"os"

	"github.com/HazelnutParadise/insyra/csvxl"
)

func main() {
	// CSV -> Excel: each CSV becomes one sheet.
	sheets := []csvxl.SheetFromCSV{
		{Path: "jan.csv", Sheet: "January"},
		{Path: "feb.csv", Sheet: "February"},
	}
	if err := csvxl.CSVToExcel(sheets, "months.xlsx"); err != nil {
		panic(err)
	}
	names, _ := csvxl.SheetNames("months.xlsx")
	fmt.Println("months.xlsx sheets:", names)

	// Excel -> CSV: one CSV per sheet.
	if err := os.MkdirAll("out", 0o755); err != nil {
		panic(err)
	}
	if err := csvxl.ExcelToCSV("report.xlsx", "out"); err != nil {
		panic(err)
	}
	files, _ := os.ReadDir("out")
	for _, f := range files {
		fmt.Println("wrote out/" + f.Name())
	}
	b, _ := os.ReadFile("out/2025.csv")
	fmt.Print(string(b))
}
```

```text
[insyra - Info] csvxl.addCsvSheet: Auto-detected encoding utf-8 for file jan.csv
[insyra - Info] csvxl.addCsvSheet: Auto-detected encoding utf-8 for file feb.csv
months.xlsx sheets: [January February]
wrote out/2025.csv
wrote out/2026.csv
year,month,store,units,revenue
2025,Nov,Taipei,120,36000
2025,Nov,Tainan,80,22400
2025,Dec,Taipei,150,45000
2025,Dec,Tainan,95,26600
```

`csvxl` detects each CSV's encoding by default, which helps with files saved by older spreadsheet apps in something other than UTF-8. Pass the encoding yourself (`csvxl.Big5`, for example) when you know it. To export only some sheets, `ExcelToCSV` takes `csvxl.ExcelToCSVOptions{Sheets: []string{"2026"}}`.

## Can Go send Excel data to Python pandas?

Yes. Insyra's `py` package runs Python code from Go: a `DataTable` you pass in arrives as a `pandas.DataFrame`, and the DataFrame you hand to `insyra.Return` comes back to Go as a `DataTable`.

```go
package main

import (
	"github.com/HazelnutParadise/insyra"
	"github.com/HazelnutParadise/insyra/py"
)

func main() {
	dt, err := insyra.ReadExcelSheet("report.xlsx", "2025", false, true)
	if err != nil {
		panic(err)
	}

	// $v1 arrives in Python as a pandas.DataFrame;
	// the DataFrame passed to insyra.Return comes back as a DataTable.
	var out *insyra.DataTable
	err = py.RunCodef(&out, `
df = $v1
df["revenue"] = pd.to_numeric(df["revenue"])
summary = df.groupby("store", as_index=False)["revenue"].sum()
insyra.Return(summary)
`, dt)
	if err != nil {
		panic(err)
	}
	out.Show()
}
```

```text
DataTable (2 rows x 2 columns)
================================================================================
 stat: B(mean=65000.00, range=[49000.00, 81000.00]) 
--------------------------------------------------------------------------------
RowNames   A(store)  B(revenue) 
---------- --------- -----------
0: 0       'Tainan'       49000 
1: 1       'Taipei'       81000 
```

The `py` package sets up its own Python environment with `uv` on the first run, with pandas installed and imported as `pd`, so there's no virtualenv to manage. This is handy when a teammate already has a pandas script for one step: keep the Excel I/O and the service in Go, and borrow the script. If you know pandas well, the [pandas for Golang cheat sheet](/posts/pandas-for-golang-cheat-sheet/) maps 20 everyday pandas calls to Go.

## Missing an Excel feature for data analysis in Golang? Open an issue

If your spreadsheets need something Insyra doesn't do yet, a read option, a write option, a format, [open an issue on GitHub](https://github.com/HazelnutParadise/insyra/issues) and tell us what your file looks like. Bug reports, feature ideas and "how do I do this Excel thing in Go" questions are all welcome there.

[Insyra on GitHub](https://github.com/HazelnutParadise/insyra) · [Docs](https://hazelnutparadise.github.io/insyra/) ([DataList](https://hazelnutparadise.github.io/insyra/#/DataList), [DataTable](https://hazelnutparadise.github.io/insyra/#/DataTable), [csvxl](https://hazelnutparadise.github.io/insyra/#/csvxl)) · [Official site](https://insyra.hazelnut-paradise.com)
