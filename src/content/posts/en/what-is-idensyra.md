---
title: "[Sample] What is Idensyra? A Go editor and runtime built for Insyra"
description: "Idensyra is a cross-platform Go code editor and runtime designed for the Insyra data analysis library, with live run, Monaco Editor and igonb notebooks."
pubDate: 2026-11-02
category: ecosystem
tags: ["sample", "idensyra"]
draft: false
---

> **Sample ecosystem post (placeholder).** Every fact below is taken from the [Idensyra README](https://github.com/HazelnutParadise/idensyra) (main branch, read on 2026-11-05). The README is in Chinese; this is a summary in English.

## What it is

Idensyra is a cross-platform Go code editor and runtime built on Wails v2 and designed for [Insyra](https://insyra.hazelnut-paradise.com).

## Core features (from the README)

- **Instant execution:** runs Go code with the Yaegi interpreter, with no compile step
- **Monaco Editor:** the same editor as VS Code, with syntax highlighting and suggestions
- **Insyra integration:** full support for Insyra and the Go standard library
- **Live Run mode:** runs the code automatically while you edit (debounced)
- **Cross-platform and lightweight:** Windows, macOS and Linux, using the system WebView
- **Fully local:** all front-end assets are bundled, so it works offline

## igonb notebooks (added in v0.2.0)

`.igonb` is a Jupyter-like interactive notebook format. Cells can hold Go, Python or Markdown, and Go and Python cells can share variables.

## Where to get it

See the [Idensyra repository](https://github.com/HazelnutParadise/idensyra) and the Idensyra section of the [official site](https://insyra.hazelnut-paradise.com/#Idensyra).
