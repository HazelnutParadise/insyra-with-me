package main

import (
	"fmt"

	"github.com/HazelnutParadise/insyra"
)

// Real Insyra releases from api.github.com/repos/HazelnutParadise/insyra/releases.
// published_at (UTC) converted to Asia/Taipei (UTC+8) dates.
func main() {
	tags := insyra.NewDataList(
		"v0.2.4", "v0.3.0", "v0.3.4",
	).SetName("Version")
	dates := insyra.NewDataList("2025-09-20",
		"2026-07-18", "2026-09-28").SetName("Released")
	dt := insyra.NewDataTable(tags, dates).
		SetName("Insyra Releases")

	dt.AppendRowsByColName(map[string]any{
		"Version": "v0.3.5", "Released": "2026-10-24",
	})
	fmt.Println("Insyra With Me:",
		dt.NumRows(), "releases and counting")
}
