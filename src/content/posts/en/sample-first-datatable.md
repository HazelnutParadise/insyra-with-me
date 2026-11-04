---
title: "[Sample] Building a small DataTable"
description: "Placeholder post: create a DataTable from named DataLists and preview it, using the snippet from the Insyra README."
pubDate: 2026-11-03
tags: ["sample", "datatable"]
draft: false
---

> **Placeholder.** Snippet copied from the [Insyra README](https://github.com/HazelnutParadise/insyra) (dev branch, read on 2026-11-04).

## Columns are DataLists

A `DataTable` is built from `DataList` columns, each given a name with `SetName`:

```go
func main() {
    dt := insyra.NewDataTable(
        insyra.NewDataList("Alice", "Bob", "Charlie").SetName("Name"),
        insyra.NewDataList(28, 34, 29).SetName("Age"),
    ).SetName("Team Members")

    insyra.Show("Preview", dt, 2) // First two rows
}
```

## Checking errors

The README shows the instance error pattern:

```go
dl := insyra.NewDataList(1,2,3).Sort().Reverse()
if err := dl.Err(); err != nil {
    fmt.Println("Error:", err.Message)
    dl.ClearErr()
}
```

More in the [DataTable documentation](https://github.com/HazelnutParadise/insyra/blob/main/Docs/DataTable.md).
