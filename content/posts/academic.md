+++
title = "Academic Profile"
date = "2021-01-14"
update = true
aliases = ["/academic/"]
+++

## Introduction

I’m a junior undergraduate student studying Computer Science in
[Shanghai Jiao Tong University](http://en.sjtu.edu.cn/) (SJTU).
I’m expected to graduate in 2022.

My real name is Chi Zhang. As the name is too common in Chinese culture, I’m generally
referred to as Alex Chi.

In my second year at SJTU, I applied for a research internship.
It turned out that the whole experience was a disaster for me. For half a year
I had nothing to do, except attending weekly lab meetups. I had no idea of what
the team was doing, and what I could do. I suffered a lot, questioning myself,
"Am I qualified for this position?" The next semester I quit that team.
Only then did I find myself more of an engineer than a researcher.

My past experience focuses on building system software with the Rust programming
language, especially storage systems. I built [AgateDB][agatedb] during my
internship in PingCAP.
In addition to individual projects, I love becoming part of the open-source
community. I contributed to [the TiKV project](https://tikv.org), and I'm
currently a maintainer at [SJTUG mirror](https://mirrors.sjtug.sjtu.edu.cn).

## Experience

### Intern at PingCAP, Inc.

*August 2020 ~ January 2021*

I built a key-value storage engine [AgateDB][agatedb].
Inspired by the WiscKey paper, AgateDB separates large values from the
LSM tree into a value log. This design leads to a 10x write speedup
on large values, compared with current storage engine used by TiKV.
AgateDB is a Rust port of [BadgerDB][badger].

[badger]: https://github.com/dgraph-io/badger
[agatedb]: https://github.com/tikv/agatedb

### Contributor in TiKV Community

*May 2020 ~ December 2020*

I became part of the TiKV community as a [Community Bridge][7] mentee. In
[Full Chunk-based Computing][1] project, I migrated the TiKV coprocessor
to use the TiDB Chunk format during the computation process and added some
new features. Then, as community co-leader of the TiKV coprocessor, I
mentored [@Xuanwo][5] on [Enum/Set support in TiKV][6].

<details>

<summary>More Resources</summary>

* [My CommunityBridge Mentorship with TiKV Project][2]
* [Sharing in TiKV monthly meeting][3]
* [Full Chunk-based Computing Project][4]

</details>

[1]: https://github.com/skyzh/tikv/issues/2
[2]: https://tikv.org/blog/communitybridge-mentorship/
[3]: https://youtu.be/46zhiiDBT5w?t=682
[4]: https://github.com/skyzh/tikv/projects/1
[5]: https://github.com/Xuanwo
[6]: https://github.com/tikv/tikv/issues/9066
[7]: https://mentorship.lfx.linuxfoundation.org


### TA in PPCA Ray-Tracing Project

*July 2020 ~ August 2020*

Principle and Practice of Computer Algorithms (PPCA)
is a project-oriented course for first-year undergraduates,
where they use what they have learned to build a toy application
in one month. I mentored 13 students to make a ray-tracer with
the Rust programming language. 

<details>

<summary>More Resources</summary>

* [Student Project Showcase][ppca_1]
* [Project Template and Tutorials][ppca_2]

</details>

[ppca_1]: https://github.com/skyzh/raytracer-tutorial/issues/9
[ppca_2]: https://github.com/skyzh/raytracer-tutorial

### Maintainer of SJTUG Mirror

*May 2019 ~ Now*

Shanghai Jiao Tong University Linux User Group ([SJTUG][sjtug_3])
sets up a public mirror of open-source software in China, which
serves 70k users and 1.5 million requests per day. I built
infrasturcture for the new [Siyuan][sjtug_2] mirror server, which
enables on-demand mirroring with [mirror-intel][sjtug_1] and hosts
the first Flathub mirror in China.

[sjtug_1]: https://github.com/sjtug/mirror-intel
[sjtug_2]: https://github.com/sjtug/mirror-docker-siyuan
[sjtug_3]: https://github.com/sjtug/

## Projects

I enjoy making toy projects. This "learn by doing" process is so much fun. For example,
[core-os-riscv](https://github.com/skyzh/core-os-riscv), a toy operating system based on xv6 in Rust.

<details>

<summary>More Projects</summary>

* [a distributed key-value store based on Raft](https://github.com/skyzh/raft-kvs) (Rust, Apr. 2020)
* [a dynamic-scheduling RISC-V simulator](https://github.com/skyzh/RISCV-Simulator) (C++, July 2019),
  also [a MIPS simulator](https://github.com/skyzh/mips-simulator) (Haskell, Apr. 2020)
* [a simple ray-tracer](https://github.com/skyzh/raytracer.rs) (Rust, Jan. 2019)
* [a real-time environment monitoring service](https://github.com/skyzh/BlueSense)
  (Vue, golang, Python, May 2017 ~ Now), [[website]](https://bluesense.skyzh.xyz)

</details>

You may refer to [my GitHub](https://github.com/skyzh/) for more information.

---

The following things are necessary parts of an academic profile, but I don't think they are meaningful
to myself. From my perspective, what I've actually done is more important than those scores and awards.

## Academic Status

* First Year GPA: 92.79/100 (1/154)
* Second Year GPA: 94.94/100 (1/155)

I enjoy studying courses in Computer Science, and I did well in most of them.

<details>

<summary>Full-score courses</summary>

* Full-score (100/100) courses
  * CS154: C++ Programming Language (Fall 2018)
  * CS149: Data Structure (Spring 2019)
  * MS125: Principle and Practice of Computer Algorithms (Summer 2019)
  * CS241: Principles and Practice of Problem Solving (Fall 2019)
  [[final project + presentation]](https://github.com/skyzh/Meteor)
  * CS307: Operating System (Spring 2020)
  * CS356: Operating System Projects (Spring 2020)
  [[final project + presentation]](https://github.com/skyzh/oom_killer)
  * CS145: Computer Architecture Experiments (Spring 2020)
  [[final project + report]](https://github.com/skyzh/mips-cpu)
* Other major courses
  * (95/100) CS359: Computer Architecture (Spring 2020)
  * (96/100) EI209: Computer Organization (Spring 2020)
  * (92/100) CS214: Algorithms and Complexity (Spring 2020)

</details>

## Honors and Awards

National Scholarship (Ministry of Education of P.R. China), 2019

I was also qualified for National Scholarship in 2020, but I gave that chance to
my classmates. It's boring to get the same award every year.

</details>
