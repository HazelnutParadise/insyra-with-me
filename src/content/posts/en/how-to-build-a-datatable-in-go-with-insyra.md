---
title: "[Sample] How to build a DataTable in Go with Insyra"
description: "Create a DataTable from named DataList columns in Go with Insyra, preview its first rows, and check for errors, step by step."
pubDate: 2026-11-03
tags: ["sample", "datatable"]
category: guides
draft: false
---

> **Sample tutorial (placeholder).** All code is copied from the [Insyra README](https://github.com/HazelnutParadise/insyra) (dev branch, read on 2026-11-04).

## Goal

Build a small table of names and ages, then preview its first two rows.

## Prerequisites

- Insyra installed. See [How to install Insyra and create your first DataList](/posts/how-to-install-insyra-and-create-a-datalist/).
- You know what a `DataList` is (one column of values).

## Step 1: Make each column a named DataList

`SetName` gives each column its header.

## Step 2: Combine the columns into a DataTable and preview it

```go
func main() {
    dt := insyra.NewDataTable(
        insyra.NewDataList("Alice", "Bob", "Charlie").SetName("Name"),
        insyra.NewDataList(28, 34, 29).SetName("Age"),
    ).SetName("Team Members")

    insyra.Show("Preview", dt, 2) // First two rows
}
```

## Step 3: Check for errors

Insyra stores errors on the instance. The README shows this pattern:

```go
dl := insyra.NewDataList(1,2,3).Sort().Reverse()
if err := dl.Err(); err != nil {
    fmt.Println("Error:", err.Message)
    dl.ClearErr()
}
```

## Expected result

`Show` prints a preview of the "Team Members" table limited to two rows (Alice 28, Bob 34). The exact layout of that preview is not reproduced here.

## Next steps

- [DataTable documentation](https://github.com/HazelnutParadise/insyra/blob/main/Docs/DataTable.md)
- [Insyra docs](https://hazelnutparadise.github.io/insyra/)
