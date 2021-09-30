+++
title = "Curriculum Vitae"
hidden = true
date = "2021-09-30"
date_update = true
+++

A more concise pdf version can be viewed [here](https://skyzh.github.io/files/cv.pdf).

### Education

#### Shanghai Jiao Tong University

B. Eng in Computer Science and Engineering \
September 2018 — June 2022 (Expected) \
Shanghai, China

* GPA 93.97/100 (or 4.07/4.3), Rank 1/154, National Scholarship 2019 (Top 0.2% national-wide)
* A+ Courses: Operating Systems, Computer Architecture, Computer Networks, and 28 others 

<details>
<summary>(Click to Expand)</summary>

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
    * ... and 2 more
* Other A+ courses
    * (95/100) CS359: Computer Architecture (Spring 2020)
    * (96/100) EI209: Computer Organization (Spring 2020)
    * (96/100) CS339: Computer Networks (Fall 2020)
    * (95/100) CS236: Cloud Computing (Fall 2020)
    * (99/100) CS410: Artificial Intelligence (Fall 2020)
    * (99/100) CS467: Theory of Computation (Fall 2020)
    * ... and 16 more
</details>

#### No.2 High School Attached to East China Normal University

High School \
September 2015 — June 2018 \
Shanghai, China

### Work Experience

#### Singularity Data, Inc.

Database System R&D Intern \
September 2021 — Now \
Shanghai, China

* Mainly work on design and implementation of the streaming engine from scratch in Singularity’s database product, which is aimed to provide real-time materialized view in the database system.

#### TerarkDB Team @ Bytedance, Ltd.

Storage System R&D Intern \
June 2021 — August 2021 \
Beijing, China

I worked on [TerarkDB](https://github.com/bytedance/terarkdb) for Zoned Namespace SSDs, contributed to [ZenFS](https://github.com/bzbd/zenfs), and co-designed an unnamed file system for the next-generation key-value storage 
engine.

* Implemented Zone-Aware Garbage Collection in TerarkDB for Zoned Namespace SSDs, which reduces 3-4x of space amplification caused by interleaving write lifetime.
* Added observability facilities to ZenFS (by Western Digital) to analyze bottlenecks and implemented a WAL-Aware Zone Allocator, which reduces tail latency from 1000 to 10 msec.

#### TiKV Storage Team @ PingCAP, Inc.

Storage System R&D Intern \
August 2020 — January 2021 \
Shanghai, China

I built a key-value storage engine [AgateDB][agatedb].

* Built LSM-based storage engine AgateDB from ground-up. Inspired by WiscKey paper, AgateDB separates large values from the LSM tree into a value log. This design leads to a 10x write speedup on large values in some cases, compared with the current storage engine used by TiKV.

[agatedb]: https://github.com/tikv/agatedb

### Open-Source Contributions

#### TiKV Community

May 2020 — Now

TiKV is a distributed key-value storage engine behind the MySQL-compatible HTAP database TiDB. I worked on several components of TiKV.

* TiKV Maintainer, Co-leader of Coprocessor SIG
    * Migrate the TiKV Coprocessor framework to use TiDB Chunk format (similar to Apache Arrow) during the computation process, as a mentee in Community Bridge mentorship. This is so-called Full Chunk-based Computing project. (May 2020 — July 2020) \
      [[RFC]](https://github.com/tikv/rfcs/blob/master/text/0043-copr-chunk.md) [[Tracking Issue]](https://github.com/tikv/tikv/issues/7724) [[Blog Post]](https://tikv.org/blog/communitybridge-mentorship/) [[Presentation]](https://youtu.be/46zhiiDBT5w?t=682)
    * Review patches and help grow the community.
* Mentor of TiKV LFX Mentorship
    * Mentored on Enum/Set support in TiKV project. (September 2020 — December 2020) \
      [[RFC]](https://github.com/tikv/rfcs/pull/57) [[Tracking Issue]](https://github.com/tikv/tikv/issues/9066) [[Blog Post]](https://tikv.org/blog/my-experience-in-flx-for-tikv/)
    * Co-mentored on Coprocessor Plugin project. (March 2021 — May 2021) \
      [[RFC]](https://github.com/tikv/rfcs/pull/63) [[Tracking Issue]](https://github.com/tikv/tikv/issues/9747) [[Blog Post]](https://tikv.org/blog/lfx-2021-copr-v2/)
* Develop [AgateDB][agatedb] after my internship in PingCAP.

#### Shanghai Jiao Tong University Linux User Group

May 2019 — Now

[SJTUG](https://github.com/sjtug/), or Shanghai Jiao Tong University Linux User Group, is an open-source community as well as a Linux user group in SJTU. I maintains the SJTUG mirror service and the SJTUThesis LaTeX template.

* Maintainer of SJTUG mirror service (May 2019 — Now)
    * SJTUG mirror serves 2 million requests and 3TB of data from 70k users a day.
    * Build an open-source [mirror infrastructure](https://github.com/sjtug/mirror-docker-unified).
    * Set up [Siyuan mirror server](https://mirror.sjtu.edu.cn).
    * Build [mirror-intel](https://github.com/sjtug/mirror-intel), which enables us to host the first Flathub mirror in China.
    * Leverage object storage service to store files with [mirror-clone](https://github.com/sjtug/mirror-clone).
* Maintainer of SJTU TeX Templates (May 2021 — Now)
    * Maintainer of [SJTUThesis](https://github.com/sjtug/SJTUThesis), the de-facto LaTeX thesis template used by SJTU students.
    * Incubate [SJTUBeamer](https://github.com/sjtug/SJTUBeamer) template.

### Other Experience

#### TA in PPCA Ray-Tracing Project

July 2020 — August 2020

Principle and Practice of Computer Algorithms (PPCA) is a project-oriented course for first-year undergraduates, where they use what they have learned to build a toy application in one month. I designed a lab based on *Ray Tracing In One Weekend* and mentored 13 students to make a ray-tracer with the Rust programming language.

You may take a look at [Student Project Showcase](https://github.com/skyzh/raytracer-tutorial/issues/9) and [Project Template and Tutorials](https://github.com/skyzh/raytracer-tutorial).

### Talks

* Full Chunk-based Computing in TiKV Coprocessor (August 2020) \
  [[Video on YouTube]](https://youtu.be/46zhiiDBT5w?t=682) [[Slides]](https://docs.google.com/presentation/d/1fUQTJ6gEscHUag9OhIIePL9uiIYJ61TSpfor-pajBoE/)
* Paper Reading on “Lethe: A Tunable Delete-Aware LSM Engine” (October 2020) \
  [[Video on Bilibili]](https://www.bilibili.com/video/BV1Yi4y1j74S) [[Original Paper]](https://arxiv.org/abs/2006.04777) [[Slides]](https://docs.google.com/presentation/d/1cDi_mHLuNcSkatck5R6wk1TAYV7tsTyaPkrv4-7M95Y)
* Paper Reading on “FPTree: A Hybrid SCM-DRAM Persistent and Concurrent B-Tree for Storage Class Memory” (May 2021) \
  [[Video on Bilibili]](https://www.bilibili.com/video/BV1wf4y1Y7eZ) [[Original Paper]](https://wwwdb.inf.tu-dresden.de/misc/papers/2016/Oukid_FPTree.pdf) [[Slides]](https://docs.google.com/presentation/d/1RHVP81jJHqHhzHACu98RZMNXxRMsa1pPllqjVkfIM7g)
* Sharing of “The SJTUG Mirror Service” (July 2021, at [Tunight](https://tuna.moe/event/2021/summer-salon/)) \
  [[Slides]](https://github.com/skyzh/skyzh.github.io/files/6757800/The.SJTUG.Mirror.Service.pdf)

### Projects

See [Build things for fun, for all](/pages/projects).

### Skills

#### Programming Languages

Rust (proficient), C++ (novice), Golang (able to read), Python and Node.js

#### Tech Skills

* Local Storage Systems (RocksDB, TitanDB, TerarkDB, BadgerDB)
* Linux I/O and File Systems (io_uring, ZenFS, Ext4, XFS)
* Database Systems (TiDB)
* Stream-Processing Systems (Flink)

## Honors and Awards

National Scholarship (Ministry of Education of P.R. China), 2019

Fun fact: I was also qualified for National Scholarship in 2020, but I gave that chance to
my classmates. It's boring to get the same award every year.
