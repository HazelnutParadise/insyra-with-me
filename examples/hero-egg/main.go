package main

import (
	"fmt"

	"github.com/HazelnutParadise/insyra"
)

func main() {
	names := insyra.NewDataList(
		"Alice", "Bob", "Charlie",
	).SetName("Name")
	ages := insyra.NewDataList(28, 34, 29).
		SetName("Age")
	dt := insyra.NewDataTable(names, ages).
		SetName("Team Members")

	dt.AppendRowsByColName(map[string]any{
		"Name": "You", "Age": 1,
	})
	fmt.Println("Insyra With Me:",
		dt.NumRows(), "members and counting")
}
