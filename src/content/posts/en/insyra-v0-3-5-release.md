---
title: "[Sample] Insyra v0.3.5 released: quant/ta, GPU training steps, Go 1.26"
description: "Insyra v0.3.5 adds a quant/ta package for technical analysis, a training step that can stay on the GPU, a wider quant toolkit, and requires Go 1.26."
pubDate: 2026-10-24
category: releases
tags: ["sample", "release"]
draft: false
---

> **Sample release-news post (placeholder).** Based only on the [v0.3.5 release notes](https://github.com/HazelnutParadise/insyra/releases/tag/v0.3.5), published 2026-10-24 09:52 (Asia/Taipei). Read those notes for the full list.

## Highlights

According to the release notes, v0.3.5 is a release on the 0.3.x line with:

- a training step that can stay on the GPU
- a new `quant/ta` package for technical analysis
- a wider `quant` toolkit for market-efficiency research
- many fixes

## Breaking changes

The notes list five breaking changes. The first is that **Go 1.26 is now required**. Check the [release notes](https://github.com/HazelnutParadise/insyra/releases/tag/v0.3.5) before you upgrade.

## Upgrade

```sh
go get github.com/HazelnutParadise/insyra/allpkgs
```

(This is the install command from the README.)
