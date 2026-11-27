---
title: "Golang Excel 教學：讀取、寫入、匯出 xlsx 的 7 個常見用法"
description: "Golang 怎麼讀取、寫入 Excel？從讀工作表、文字轉數字、一年一個工作表、HTTP 匯出下載，到 CSV 轉 Excel 不亂碼，7 個用法附完整程式碼。"
pubDate: 2026-11-28
category: guides
tags: ["excel", "xlsx", "golang", "go語言", "csv", "資料分析"]
faq: [{"q": "Golang 讀寫 Excel 要用什麼套件？", "a": "要排版、合併儲存格、畫圖表，用 Excelize；要把工作表讀成資料表來篩選、分組、加總，用 Insyra。Insyra 讀寫 Excel 底層用的就是 Excelize，兩個不衝突。"}, {"q": "Go 語言讀 Excel 為什麼數字變成字串？", "a": "Insyra v0.3.5 從 Excel 讀進來的儲存格都是文字，跟 Excelize 的 GetRows 一樣。要算數字的欄位，用 ParseNumbers 轉成數字，再用 UpdateCol 放回資料表。"}, {"q": "Golang 寫入 Excel 會覆蓋原本的工作表嗎？", "a": "不會。ToExcel 預設遇到同名工作表會回傳 insyra.ErrSheetExists，檔案完全不動；其他工作表也都保留。真的要覆蓋，設定 IfSheetExists: insyra.SheetExistsReplace。"}, {"q": "Golang 怎麼匯出 Excel 讓使用者下載？", "a": "在 HTTP handler 設好 Content-Type 和 Content-Disposition，再呼叫 dt.WriteExcel(w, opts)，直接寫進 http.ResponseWriter，不用先存暫存檔。"}]
draft: false
---

在台灣上班，報表最後幾乎都要變成 Excel。會計要、主管要、客戶也要。後端用 Go 寫的話，與其每次手動匯出，不如讓程式直接產出 `.xlsx`。

這篇整理 Golang 讀寫 Excel 最常用到的 7 個用法，每段都附可以直接複製的程式碼和實際輸出：

1. 讀取 Excel 工作表
2. 把讀進來的文字轉成數字
3. 寫入 Excel 檔
4. 一年一個工作表、不覆蓋舊資料
5. 匯出 Excel 給使用者下載
6. CSV 轉 Excel、Excel 轉 CSV（含 Big5 亂碼處理）
7. 把 Excel 資料交給 Python pandas

範例用的是 Go 的資料分析套件 [Insyra](https://github.com/HazelnutParadise/insyra) v0.3.5，資料讀進來是一張 `DataTable`（資料表），不用自己處理 `[][]string`。一行就把 Insyra 所有子套件裝好，這篇用到的 `csvxl`、`py` 都包含在內：

```bash
go get github.com/HazelnutParadise/insyra/allpkgs@v0.3.5
```

範例資料是一份小小的 `sales.csv`，兩間門市、四個月的銷售：

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

## Golang 讀寫 Excel 要用什麼套件？Excelize 和 Insyra 差在哪

要做「表格本身」用 [Excelize](https://github.com/qax-os/excelize)，要處理「表格裡的資料」用 Insyra。Excelize 是 Go 最常見的 Excel 套件，Insyra 讀寫 Excel 底層也是用它，所以兩個不是二選一。

| 你想做的事 | 用哪個 |
|---|---|
| 設定儲存格格式、合併儲存格、畫圖表、套範本 | Excelize |
| 把工作表讀成資料表，再篩選、分組、加總 | Insyra（`ReadExcelSheet`） |
| 寫入一個工作表，其他工作表不被洗掉 | Insyra（`ToExcel` + `ErrSheetExists`） |
| 讓瀏覽器下載 `.xlsx` | 兩個都可以（Insyra 用 `WriteExcel`） |
| 一次轉換一堆 CSV 和 Excel | Insyra 的 `csvxl` |

用 Excelize 讀檔，拿到的是 `GetRows` 回傳的 `[][]string`，後面要自己整理成結構；Insyra 一行就變成資料表。以下 7 個用法都以 Insyra 示範。

## 用法 1：Golang 怎麼讀取 Excel 工作表？

用 `insyra.ReadExcelSheet(檔名, 工作表, 第一欄當列名, 第一列當欄名)`，一行就把一個工作表讀成 `DataTable`。下面讀的 `report.xlsx` 是用法 4 產生的檔案：

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

另一個常見的坑是「每列長度不一樣」：Excelize 的 `GetRows` 會把一列最後面的空白儲存格省略掉。`ReadExcelSheet` 會把缺的格子補成 `nil`，每一欄長度都對得起來。

不知道活頁簿裡有哪些工作表，可以用 `csvxl.SheetNames("report.xlsx")` 依順序列出來。檔案是使用者上傳的、或來自 HTTP 回應，就改用 `insyra.ReadExcel(r, 工作表, false, true)`，它吃任何 `io.Reader`，不用先存成檔案，用法 5 有實際例子。

## 用法 2：Go 語言讀 Excel，數字為什麼變成字串？

因為 Insyra v0.3.5 從 Excel 讀進來的儲存格一律是文字，上面輸出裡 `'33000'` 的引號就是這個意思。Excelize 的 `GetRows` 也是回傳字串，所以不意外，但第一次要加總時一定會踩到。

解法是每個數字欄位做兩件事：`ParseNumbers` 把欄位裡的文字轉成數字，`UpdateCol` 把轉好的欄位放回資料表：

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

轉換前是 `string`，轉換後是 `float64`，`Sum` 就算得出來了。遇到 `N/A` 這種不是數字的儲存格，會保留原樣並印出警告，不會讓整支程式掛掉。要寫回 Excel 之前也記得先轉，不然數字會以文字格式寫進去，在 Excel 裡沒辦法直接加總。

## 用法 3：Golang 怎麼寫入 Excel 檔？

對 `DataTable` 呼叫 `ToExcel`，給檔名和 `ExcelWriteOptions` 就好：

```go
opts := insyra.ExcelWriteOptions{Sheet: "2026", SetColNamesToFirstRow: true}
err := dt.ToExcel("report.xlsx", opts)
```

幾個選項的意思：

- `Sheet`：工作表名稱，空字串就是 `Sheet1`
- `SetColNamesToFirstRow`：第一列寫欄位名稱（表頭）
- `SetRowNamesToFirstCol`：第一欄寫列名稱

數字、布林值和 `time.Time` 會寫成 Excel 真正的數值，可以排序、加總。副檔名要用 `.xlsx` 這類新格式，舊的 `.xls` 沒辦法寫。檔案不存在會自動建立；存在的話，其他工作表都原封不動。寫入時會先寫到暫存檔再改名，寫到一半出錯也不會留下壞掉的活頁簿。

## 用法 4：Golang 寫入 Excel 怎麼一年一個工作表，又不覆蓋舊資料？

每個年份篩出那一年的資料，用不同的 `Sheet` 名稱呼叫 `ToExcel` 就好。完整程式：

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

```text
[insyra - Info] insyra.ReadCSV: Auto-detected encoding utf-8 for sales.csv
sheets: [2025 2026]
second write: sheet already exists: 2026 in report.xlsx
is ErrSheetExists: true
after replace: [2025 2026]
```

重點在後半段：對已經存在的工作表再寫一次，預設會失敗，錯誤可以用 `errors.Is(err, insyra.ErrSheetExists)` 判斷，檔案完全不會被動到。排程不小心跑兩次，也不會把去年的數字蓋掉。真的要更新某一年，再明確加上 `IfSheetExists: insyra.SheetExistsReplace`；新的工作表會放回原本的位置，分頁順序還是 2025、2026。

## 用法 5：Golang 怎麼匯出 Excel 讓使用者下載？

在 HTTP handler 設好兩個 header，再把 `http.ResponseWriter` 交給 `WriteExcel`。`WriteExcel` 會把資料表寫成一個新的活頁簿，寫進任何 `io.Writer`，中間不用產生暫存檔：

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

這裡的 `main` 用 `httptest` 開一個測試伺服器，讓「匯出 → 下載 → 讀回來」在同一支程式跑完：handler 寫出活頁簿，`ReadExcel` 直接從 `resp.Body` 讀回來。實際專案裡，把 `reportHandler` 掛到路由上，瀏覽器就會下載 `sales.xlsx`。

## 用法 6：Go 語言 CSV 轉 Excel、Excel 轉 CSV 怎麼做？

用 Insyra 的 `csvxl` 套件：`CSVToExcel` 把多個 CSV 變成同一個活頁簿裡的工作表，`ExcelToCSV` 把每個工作表各存成一個 CSV。

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

只想匯出部分工作表，`ExcelToCSV` 可以加上 `csvxl.ExcelToCSVOptions{Sheets: []string{"2026"}}`。

### Go 語言 CSV 轉 Excel 出現亂碼怎麼辦？

亂碼通常是因為 CSV 是 Big5 編碼，台灣舊系統和舊版 Excel 存出來的 CSV 常常是這樣。`csvxl` 預設會自動偵測編碼，也可以直接指定 `csvxl.Big5`：

```go
package main

import (
	"fmt"

	"github.com/HazelnutParadise/insyra"
	"github.com/HazelnutParadise/insyra/csvxl"
)

func main() {
	// stores-big5.csv was saved by an old Excel as Big5.
	sheets := []csvxl.SheetFromCSV{{Path: "stores-big5.csv", Sheet: "門市"}}
	if err := csvxl.CSVToExcel(sheets, "stores.xlsx", csvxl.Big5); err != nil {
		panic(err)
	}
	dt, err := insyra.ReadExcelSheet("stores.xlsx", "門市", false, true)
	if err != nil {
		panic(err)
	}
	fmt.Println(dt.ColNames())
	dt.Show()
}
```

```text
[門市 數量]
DataTable (2 rows x 2 columns)
================================================================================
 stat: B(mean=100.00, range=[90.00, 110.00]) 
--------------------------------------------------------------------------------
RowNames   A(門市)  B(數量) 
---------- -------- --------
0:         '台北'   '110'   
1:         '台南'   '90'
```

中文欄位名稱和內容都正確讀進來了。除了 Big5，`csvxl` 也支援 UTF-8、UTF-16、GB18030、Shift-JIS 等編碼。

## 用法 7：Go 讀進來的 Excel 資料可以交給 Python pandas 嗎？

可以。Insyra 的 `py` 套件能在 Go 裡直接執行 Python：傳進去的 `DataTable` 在 Python 端就是 `pandas.DataFrame`，交給 `insyra.Return` 的 DataFrame 回到 Go 又變成 `DataTable`。

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

`py` 第一次執行時會用 `uv` 自動建好 Python 環境，pandas 已經裝好並以 `pd` 匯入，不用自己管虛擬環境。同事手上已經有一支 pandas 腳本時很好用：Excel 讀寫和服務留在 Go，那一步直接借用 Python。pandas 熟的話，可以搭配〈[pandas 常用指令用 Go 怎麼寫？20 個 Golang 對照速查表，還能直接串 Python](/zh-tw/posts/pandas-for-golang-cheat-sheet/)〉。

Excel 讀成 `DataTable` 之後，接下來的資料分析就跟讀 CSV 一樣。想從頭做一次完整分析，可以看〈[用 Insyra 在 Go 裡做第一次資料分析](/zh-tw/posts/first-data-analysis-in-go-with-insyra/)〉；還在評估 Go 適不適合做資料分析，可以看〈[Go 可以做資料分析嗎？4 個 Golang 套件比較，還能直接串 Python](/zh-tw/posts/can-you-do-data-analysis-in-go/)〉。

## Go 語言讀寫 Excel 還缺什麼功能？到 GitHub 開 issue

如果你的 Excel 檔需要的功能 Insyra 還沒有，不管是讀取選項、寫入選項還是某種格式，歡迎到 GitHub [開一個 issue](https://github.com/HazelnutParadise/insyra/issues)，說說你的檔案長什麼樣子。回報 bug、許願新功能、問「這個 Excel 操作在 Go 要怎麼寫」都可以。

[Insyra GitHub 儲存庫](https://github.com/HazelnutParadise/insyra) · [使用文件](https://hazelnutparadise.github.io/insyra/)（[DataList](https://hazelnutparadise.github.io/insyra/#/DataList)、[DataTable](https://hazelnutparadise.github.io/insyra/#/DataTable)、[csvxl](https://hazelnutparadise.github.io/insyra/#/csvxl)） · [官網](https://insyra.hazelnut-paradise.com)
