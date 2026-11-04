---
title: "[Sample] What is Syralit? Interactive data apps in Go"
description: "Syralit is a Go-native, Streamlit-inspired framework for interactive data apps, dashboards and AI tool interfaces, with no JavaScript or frontend build step."
pubDate: 2026-11-02
category: ecosystem
tags: ["sample", "syralit"]
draft: false
sample: true
---

> **Sample ecosystem post (placeholder).** Every fact below is taken from the [Syralit README](https://github.com/HazelnutParadise/syralit) (main branch, read on 2026-11-05).

## What it is

Syralit is a Go-native framework for building interactive data apps, dashboards and AI tool interfaces. It is inspired by Streamlit and designed for Go. You write Go functions and get a live web app: no JavaScript, no HTML templates, no frontend build step.

## Getting started (from the README)

It needs Go 1.26 or newer. Install the CLI:

```bash
go install github.com/HazelnutParadise/syralit/cmd/syralit@latest
```

Then scaffold a project and run it with hot reload:

```bash
syralit new myapp
cd myapp
syralit dev
```

A minimal app:

```go
package main

import sy "github.com/HazelnutParadise/syralit"

func main() {
    sy.App(func() {
        sy.Title("Hello Syralit")
        name := sy.TextInput("Your name")
        if name != "" {
            sy.Success("Hello, " + name + "!")
        }
    })
}
```

Run it with `go run .` and open http://localhost:8600.

## With Insyra

The repository's `examples/` folder includes `insyra-interactive`, a click-to-filter dashboard, along with a data explorer and a data studio example.

## Where to get it

See the [Syralit repository](https://github.com/HazelnutParadise/syralit). It is MIT licensed.
