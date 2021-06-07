+++
title = "Academic Profile"
hidden = true
+++

## Introduction

I’m a junior undergraduate student studying Computer Science at
[Shanghai Jiao Tong University](http://en.sjtu.edu.cn/) (SJTU).
I’m expected to graduate in 2022.

My real name is Chi Zhang. As the name is too common in Chinese culture, I’m generally
referred to as **Alex Chi**.

In my second year at SJTU, I applied for a research internship.
It turned out that the whole experience was a disaster for me. For half a year
I had nothing to do, except attending weekly lab meetups. I had no idea of what
the team was doing, and what I could do. I suffered a lot, questioning myself,
"Am I qualified for this position?" The next semester I quit that team.
Only then did I find myself more of **an engineer** than a researcher.

My past experience focuses on building system software with the Rust programming
language, especially storage systems. I built [AgateDB][agatedb] during my
internship in PingCAP. Also, I love becoming part of the open-source
community. Currently, I'm a contributor of [the TiKV project](https://tikv.org)
and a maintainer at [SJTUG mirror](https://mirrors.sjtug.sjtu.edu.cn).
In a nutshell, **I build things that interest me, excite me, and impact people**.

## Experience

### Intern at PingCAP, Inc. &nbsp;<small>(2020/08 - 2021/01)</small>

I built a key-value storage engine [AgateDB][agatedb].
Inspired by WiscKey paper, AgateDB separates large values from the
LSM tree into a value log. This design leads to a 10x write speedup
on large values, compared with the current storage engine used by TiKV.
AgateDB is a Rust port of [BadgerDB][badger].

[badger]: https://github.com/dgraph-io/badger
[agatedb]: https://github.com/tikv/agatedb

### Contributor in TiKV Community &nbsp;<small>(2020/05 - 2021/05)</small>

I became part of the TiKV community as a [Community Bridge][7] mentee. In
[Full Chunk-based Computing][1] project, I migrated the TiKV coprocessor
to use the TiDB Chunk format during the computation process and added some
new features. Then, as community co-leader of the TiKV coprocessor, I
mentored on [Enum/Set support in TiKV][6] Project and
co-mentored on [Coprocessor Plugin][8] Project.

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
[6]: https://github.com/tikv/tikv/issues/9066
[7]: https://mentorship.lfx.linuxfoundation.org
[8]: https://github.com/tikv/tikv/issues/9747


### TA in PPCA Ray-Tracing Project &nbsp;<small>(2020/07 - 2020/08)</small>

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

### Maintainer of SJTUG Mirror &nbsp;<small>(2019/05 - Now)</small>

Shanghai Jiao Tong University Linux User Group ([SJTUG][sjtug_3])
sets up a public mirror of open-source software in China, which
serves 70k users and 1.5 million requests per day. I built
infrastructure for the new [Siyuan][sjtug_2] mirror server, which
enables on-demand mirroring with [mirror-intel][sjtug_1], enables
rsync to simple object storage with [mirror-clone][sjtug_4], and hosts
the first Flathub mirror in China.

[sjtug_1]: https://github.com/sjtug/mirror-intel
[sjtug_2]: https://github.com/sjtug/mirror-docker-siyuan
[sjtug_3]: https://github.com/sjtug/
[sjtug_4]: https://github.com/sjtug/mirror-clone

## Projects
I enjoy making toy projects. They are fun to play with,
and I learned a lot from them. Currently, I'm rethinking how
to present my projects. There are so many of them, and I want
to exhibit the most exciting and interesting ones, which best
summarize what I've done previously.
It may take some time for me to re-organize this part. Therefore,
if you are interested in my previous projects, you may
take a look at my [my GitHub Profile](https://github.com/skyzh).

<p>&nbsp;</p>
<p>&nbsp;</p>

---

The following things are necessary parts of an academic profile, but I don't think they are meaningful
to me. From my perspective, what I've done is more important than those scores and awards.

## Academic Status

* First 2.5 years GPA: 93.99/100 (Rank: 1/156)

I enjoy studying courses in Computer Science, and I did well in most of them.

<details>

<summary>A+ courses</summary>

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
* Other A+ courses
  * (95/100) CS359: Computer Architecture (Spring 2020)
  * (96/100) EI209: Computer Organization (Spring 2020)
  * (96/100) CS339: Computer Networks (Fall 2020)
  * (95/100) CS236: Cloud Computing (Fall 2020)
  * (99/100) CS410: Artificial Intelligence (Fall 2020)
  * (99/100) CS467: Theory of Computation (Fall 2020)
  * etc.

</details>

## Honors and Awards

National Scholarship (Ministry of Education of P.R. China), 2019

I was also qualified for National Scholarship in 2020, but I gave that chance to
my classmates. It's boring to get the same award every year.

</details>
