/**
 * PLACEHOLDER COPY — Social Media Manager will replace this.
 *
 * This file is the sole source of about-page prose (and the verified
 * example). Replace the strings below with final copy; keep the keys
 * and structure so the page template does not need to change.
 *
 * Drafted 2026-11-10 from the official Insyra README only
 * (https://github.com/HazelnutParadise/insyra, English README.md).
 * Factual wording only — no invented claims.
 */

export const ABOUT_COPY_STATUS =
  'PLACEHOLDER — Social Media Manager copy will replace this file.';

export const aboutCopy = {
  pageTitle: 'What is Insyra',
  description:
    'What Insyra is, how to install it, a short verified Go example, and links to the official site, docs, GitHub and pkg.go.dev.',
  placeholderNotice:
    'Placeholder copy drafted from the official Insyra README on 2026-11-10. Social Media Manager’s copy will replace the text in src/content/about-copy.ts.',
  definitionTitle: 'Definition',
  definition: [
    'Insyra is a complete data analysis ecosystem for Go, spanning data loading and cleaning, statistics, visualization, machine learning, and deep learning.',
    'Every layer is checked against a reference implementation: statistics against R, models against scikit-learn, neural networks against PyTorch and onnxruntime. GPU acceleration, parallel processing, Python interop, and a CLI with its own REPL come built in.',
    'The Insyra library is a tool designed for managing and analyzing data in Go. It offers features for data manipulation, statistical calculations, and data visualization.',
  ],
  installTitle: 'Install',
  installIntro:
    'To start using Insyra, install it with the following command, from the official README:',
  installCommand: 'go get github.com/HazelnutParadise/insyra/allpkgs',
  exampleTitle: 'Example',
  exampleIntro:
    'The official README Quick Example, compiled and run against the latest Insyra release (v0.3.5) in a temporary Go module on 2026-11-10. Output below is the real program output, unedited.',
  exampleSource: `package main

import (
	"fmt"

	"github.com/HazelnutParadise/insyra"
)

func main() {
	dl := insyra.NewDataList(1, 2, 3, 4, 5)
	dl.Append(6)
	fmt.Println("DataList:", dl.Data())
	fmt.Println("Mean:", dl.Mean())
}
`,
  exampleOutput: `DataList: [1 2 3 4 5 6]
Mean: 3.5
`,
  exampleVersion: 'v0.3.5',
  linksTitle: 'Links',
  links: [
    { label: 'GitHub', href: 'https://github.com/HazelnutParadise/insyra' },
    { label: 'Documentation', href: 'https://hazelnutparadise.github.io/insyra/' },
    { label: 'Official site', href: 'https://insyra.hazelnut-paradise.com' },
    { label: 'pkg.go.dev', href: 'https://pkg.go.dev/github.com/HazelnutParadise/insyra' },
  ],
} as const;
