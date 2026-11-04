package main

import (
	"fmt"

	"github.com/HazelnutParadise/insyra"
)

// Dates (Asia/Taipei) from the GitHub API: repos/HazelnutParadise/insyra
// (created_at) and releases/tags/v0.1.0, releases/tags/v0.2.0.
func main() {
	steps := insyra.NewDataList("Created", "v0.1.0").
		SetName("Milestone")
	dates := insyra.NewDataList("2024-08-29", "2025-02-10").
		SetName("Date")
	dt := insyra.NewDataTable(steps, dates).
		SetName("Insyra Milestones")

	dt.AppendRowsByColName(map[string]any{
		"Milestone": "v0.2.0", "Date": "2025-05-30",
	})
	fmt.Println("Insyra With Me: since", dates.Get(0))
}
