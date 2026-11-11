---
title: "Insyra v0.3.5「Huashan」：有什麼新東西"
description: "Insyra v0.3.5 帶來留在 GPU 上的訓練步驟、新的 quant/ta 套件、不需要磁碟檔案的讀寫、Excel 匯出，並且需要 Go 1.26。"
pubDate: 2026-11-11
category: releases
tags: ["release", "v0.3.5", "excel", "csv", "quant", "gpu"]
---

Insyra v0.3.5 在 2026 年 10 月 24 日釋出，還是「Huashan」0.3.x 這條線。下面是如果我要升級，會想先知道的部分。內容全部來自 [v0.3.5 釋出說明](https://github.com/HazelnutParadise/insyra/releases/tag/v0.3.5)和[變更紀錄](https://github.com/HazelnutParadise/insyra/blob/main/CHANGELOG_TW.md)。

## 重點

- **訓練步驟可以留在 GPU 上。** `Tensor.To(dev)`、`ToHost()` 和 `Release()` 能把 float32 張量搬到裝置上再搬回來，位元完全一致；tape 的 MatMul、Add、SoftmaxCrossEntropy，以及 SGD、Adam、AdamW 的更新步驟都在那裡執行。釋出說明也提到，CPU 上的 2-D float32 `MatMul` 快了 1.2 到 2.9 倍。
- **新的 `quant/ta` 技術分析套件。** 趨勢（`SMA`、`EMA`、`MACD`、`Ichimoku`……）、通道與停損（`Bollinger`、`Keltner`、`SuperTrend`……）、震盪指標（`RSI`、`KD`、`CCI`……）、量能（`OBV`、`MFI`……）、`CandlePatterns` 等等。TA-Lib 有同樣指標的，結果都有拿來對照。
- **用 `quant` 做市場效率研究。** `QuantileSort`、`FamaMacBeth`、`EventStudy`，以及資料窺探檢定 `RealityCheck`、`SPATest`、`RomanoWolf`。
- **`datafetch` 支援台灣和日本市場。** 期交所期貨與選擇權歷史資料、零股報價、股權分散表、月營收、FinMind，以及 JPX 投資人類別交易資料。
- **讀寫不再需要磁碟上的檔案。** `ReadCSV` 可以從任何 `io.Reader` 讀，`StreamCSV` 一次讀一批 CSV，`DataTable` 也終於可以用 `ToExcel` 寫成 Excel。
- **核心的小改進。** `SliceRows` / `SliceCols`、`FilterRowsWhere`、`ColDataTypes`、`ShowHead` / `ShowTail`，還有 CCL 的 `DATEPART`。

## 我每天都會用到的：從哪裡都能讀，寫成 Excel

v0.3.5 以前，讀 CSV 要給檔案路徑或字串。現在 `ReadCSV` 吃任何 `io.Reader`（HTTP 回應內容、`embed.FS` 裡的檔案、記憶體裡的位元組），`ToExcel` 則會把資料表寫成活頁簿裡的一個工作表：

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

用 v0.3.5 跑出來的結果（第一行是 Insyra 的 info 日誌）：

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

如果 `people.xlsx` 已經存在，`ToExcel` 會保留其他工作表。如果你指定的工作表已經有了，它會回傳一個符合 `ErrSheetExists` 的錯誤，檔案完全不動；除非你設定 `IfSheetExists: insyra.SheetExistsReplace`。所以「一本活頁簿、每年一個工作表」幾行就搞定。（把上面的範例跑兩次就會看到：第二次會停在 `sheet already exists: 2026 in people.xlsx`。這就是安全的預設值在做事。）

## 不相容的變更

釋出說明列了五項，每一項都是以前錯誤、被拒絕或不安全的輸入輸出：

- **需要 Go 1.26。** `go` 指令是 `1.26.9`。Go 1.27 釋出後，Go 1.25 就不再收到修正，而 2026-10-08 公布的十一個標準函式庫漏洞，只在較新的版本裡修好。
- **`ToSQL` 會用字母（`A`、`B`……）命名沒有名稱的欄位**，而不是 MySQL 和 PostgreSQL 都會拒絕的 `""`。
- **CCL 把浮點數轉成文字時，改用一般的十進位數字。** A = 0.0000001 時，`'x' & A` 現在是 `x0.0000001`，不是 `x1e-07`；`LEN(1000000)` 是 7。想要舊的寫法，請用 `TOSTR(x, '%g')`。
- **儲存格的錯誤訊息改成從零開始算**，和 `Get(i)` 用的數字一樣（`row index 2`）。
- **`FactorAnalysis` 用 oblimin 且 `Restarts` 大於 1 時**，現在真的會重新開始。

另外值得知道：`DataList.Difference`、`MovingAverage`、`MovingStdev` 和 `WeightedMovingAverage` 已經標為棄用，會在 0.4 移除，取代它們的是 `Diff(1)` 和 `Rolling(...)`。

## 升級

```sh
go get -u github.com/HazelnutParadise/insyra/allpkgs@v0.3.5
```

如果你用的是 Go 1.21 以上，`go` 指令會自動下載 1.26.9 工具鏈，除非你設了 `GOTOOLCHAIN=local`。

完整說明：[GitHub 釋出 v0.3.5](https://github.com/HazelnutParadise/insyra/releases/tag/v0.3.5) · [CHANGELOG_TW](https://github.com/HazelnutParadise/insyra/blob/main/CHANGELOG_TW.md) · 文件：https://hazelnutparadise.github.io/insyra/（[DataTable](https://hazelnutparadise.github.io/insyra/#/DataTable)、[DataList](https://hazelnutparadise.github.io/insyra/#/DataList)）· 官網：https://insyra.hazelnut-paradise.com
