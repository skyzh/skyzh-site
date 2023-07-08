---
title: "Shared Indexes and Joins in Streaming Databases"
pubDate: "2022-12-28T13:00:00-05:00"
tags: ["Rust", "Database", "Development", "RisingWave"]
description: "Shared Indexes and Joins in Streaming Databases"
external: true
---

This article is basically an English version of [my previous post](https://www.skyzh.dev/posts/articles/2022-05-29-shared-state-in-risingwave/), which was originally written in May 2022. This is also a summary of my
undergraduate's thesis on streaming indexes and streaming joins. Now it is half a year later and the implementation
in RisingWave has changed a lot. But the basic idea stays the same: push data to the remote node instead of pull.

[https://www.risingwave-labs.com/blog/shared-indexes-and-joins-in-streaming-databases/](https://www.risingwave-labs.com/blog/shared-indexes-and-joins-in-streaming-databases/)
