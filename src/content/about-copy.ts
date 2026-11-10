/**
 * About-page copy from Social Media Manager
 * (/workspace/insyra-with-me-drafts/about.md), verified 2026-11-10
 * against HazelnutParadise/insyra v0.3.5 (go.mod, README, Docs).
 *
 * This file is the sole source of about-page prose and the verified
 * example. Keep the keys and structure so the page template stays stable.
 */

export const aboutCopy = {
  pageTitle: 'What is Insyra',
  description:
    'Insyra is an open-source data analysis library for Go. It gives you DataList and DataTable, plus packages for statistics, charts, machine learning and more, all in plain Go.',
  definitionTitle: 'Definition',
  definition: [
    'Insyra is an open-source data analysis library for Go. It gives you two core structures, `DataList` for a column of values and `DataTable` for a table, plus packages for statistics, charts, machine learning and more, all in plain Go.',
    'Insyra started in August 2024 as a way to do the everyday work of data analysis (load a CSV, clean it, add a column, group, summarize, export) without leaving Go. It has grown into a whole ecosystem since then, but the idea is the same: your analysis is ordinary Go code, so it builds, tests and ships like the rest of your Go project. Insyra is MIT-licensed and built by Hazelnut Paradise.',
  ],
  whatItsForTitle: "What it's for",
  whatItsFor: [
    "**Everyday table work.** Read CSV, JSON, Excel or Parquet into a `DataTable`, then filter, sort, group, pivot, merge and write it back out.",
    "**Excel-style formulas on columns.** The Column Calculation Language (CCL) lets you write `IF(A > 90, 'Excellent', 'Average')` or `['price'] * ['qty']` to build new columns.",
    "**Statistics you can check.** The `stats` package covers tests, regressions and more, and the project checks its statistics against R.",
    "**Charts and reports.** `plot` makes interactive charts (go-echarts) and `gplot` makes static ones (gonum/plot).",
    "**Models without leaving Go.** `ml` offers scikit-learn-style models and `nn` runs and trains neural networks in pure Go, with no Python runtime and no cgo.",
  ],
  installTitle: 'Install',
  installIntro:
    'Insyra v0.3.5 needs Go 1.26 or newer (the `go` directive in `go.mod` is `1.26.9`):',
  installCommand: 'go get github.com/HazelnutParadise/insyra/allpkgs',
  exampleTitle: 'A first example',
  exampleIntro:
    'Here is a whole program: put five numbers in a `DataList` and ask for their mean, median and maximum.',
  exampleSource: `package main

import (
	"fmt"

	"github.com/HazelnutParadise/insyra"
)

func main() {
	scores := insyra.NewDataList(72, 88, 95, 64, 81).SetName("scores")
	fmt.Println("Mean:", scores.Mean())
	fmt.Println("Median:", scores.Median())
	fmt.Println("Max:", scores.Max())
}
`,
  exampleOutput: `Mean: 80
Median: 81
Max: 95
`,
  exampleVersion: 'v0.3.5',
  linksTitle: 'Links',
  links: [
    { label: 'GitHub repository', href: 'https://github.com/HazelnutParadise/insyra' },
    { label: 'Documentation', href: 'https://hazelnutparadise.github.io/insyra/' },
    { label: 'Go package reference (pkg.go.dev)', href: 'https://pkg.go.dev/github.com/HazelnutParadise/insyra' },
    { label: 'Release notes', href: 'https://github.com/HazelnutParadise/insyra/releases' },
    { label: 'Official website', href: 'https://insyra.hazelnut-paradise.com' },
    { label: 'Tim Lai, creator of Insyra, on X', href: 'https://x.com/TimLai666' },
  ],
} as const;
