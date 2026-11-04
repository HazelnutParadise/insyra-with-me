package main

import (
	"fmt"

	"github.com/HazelnutParadise/insyra"
)

// Real dates from the GitHub API: repos/HazelnutParadise/insyra (created_at) and /releases.
// published_at (UTC) converted to Asia/Taipei (UTC+8) dates.
func main() {
	steps := insyra.NewDataList("Created",
		"v0.2.4", "v0.3.0", "v0.3.4").SetName("Milestone")
	dates := insyra.NewDataList("2024-08-29", "2025-09-20",
		"2026-07-18", "2026-09-28").SetName("Date")
	dt := insyra.NewDataTable(steps, dates).
		SetName("Insyra Milestones")

	dt.AppendRowsByColName(map[string]any{
		"Milestone": "v0.3.5", "Date": "2026-10-24",
	})
	fmt.Println("Insyra With Me:",
		dt.NumRows(), "milestones and counting")
}
