+++
title = "Build things for fun, for all"
subtitle = "The Stories Behind My Projects"
hidden = true
date = "2021-06-08"
+++

## Early Days

The fun of programming was rooted in my heart from an early age. When I was ten years old, I began my journey in computer programming. At that time, I learned the basics of BASIC and the C programming language in Children's Palace of CWI. With this knowledge in mind, our mentors taught us how to make classic games in ASCII-character-based consoles, such as the Tetris game. Later I did some Ruby programming in RPG Maker, experimented with Visual Basic to build even more exciting GUI games, and learned the basics of game engines and graphics pipelines. Those first tastes of what computer programming could bring us motivated my curiosity and interest.

Another track in parallel is competitive programming. The highlighting moment came when I was in 9th grade, and I got first prize in NOIP among high school students. However, I quickly lost interest in memorizing and understanding those tricky algorithms, and that's the turning point.

Months later, I got into high school and shifted my focus to build real-world applications, which opened up a whole new world for me. By composing and reusing components built by developers worldwide, I could easily make my ideas come alive. These attempts include [CloudOJ](https://github.com/skyzh/CloudOJ) and [BlueSense](https://github.com/skyzh/BlueSense). Another thing worth mention is the [ddcm-protocol](https://github.com/skyzh/ddcm-protocol), a P2P distributed computing framework based on Kademlia.

Building things with computer programs is fun, and it is even more exciting if what I've built could be used by others. These early experiences laid a solid foundation for me and ultimately led me onto the track of studying Computer Science.

## Code for Fun

Being a university student means a lot of free time for exploration. By self-studying CS online courses, reading textbooks in the field of my interest, and getting hands-on experience of doing labs and building systems, I got a deeper understanding of how computer systems work. The most notable works include:

* [core-os-riscv](https://github.com/skyzh/core-os-riscv), an operating system made with the Rust programming language, featuring multi-core kernel thread scheduling, user processes, and xv6-like syscalls. After studying MIT 6.S081, I decided to "fork" yet another xv6 in Rust.
* [RISCV-Simulator](https://github.com/skyzh/RISCV-Simulator), a dynamic scheduling RISC-V CPU simulator. It supports out-of-order execution with the Tomasulo algorithm and Speculation, which is derived from architecture described in CA:AQA.
* [raft-kvs](https://github.com/skyzh/raft-kvs), a distributed key-value store based on Raft. This is a Rust-version of MIT 6.824 course project. This work is based on labs designed by people at PingCAP.

There are also some other interesting works.

* [A simple ray-tracer](https://github.com/skyzh/raytracer.rs), which is later used in [PPCA Ray-Tracing Project](https://github.com/skyzh/raytracer-tutorial).
* [uring-positioned-io](https://github.com/skyzh/uring-positioned-io), an asynchronized positioned-I/O library based on io-uring, built with the Rust programming language.

And some web, mobile and desktop applications.

* [tenitsu](https://github.com/skyzh/tenitsu), a robot collecting tennis balls.
* [Kanbasu](https://github.com/untitled-group/kanbasu), a third-party Canvas LMS client.
* [make-a-fortune](https://github.com/skyzh/make-a-fortune), an anonymous forum frontend.
* [libook](https://github.com/sjtu-libook/libook), a library seat-booking system.
* [canvas_grab](https://github.com/skyzh/canvas_grab), one-click script to synchronize files from Canvas LMS.
* and many more on my [GitHub Profile](https://github.com/skyzh).

Course projects could be found in [Curriculum Vitae](/pages/cv) by expanding the "GPA" part.

This “learn by doing” process is so much fun, and I enjoy making these toy projects. After all, I *code for fun*.

## Into the Open-Source Community

Build systems that could be used by thousands or millions of users, collaborate with developers worldwide anytime, and improve my understanding of technology and software. That is how the open-source community influenced me.

Although there are quite a lot of open-source projects on my GitHub profile, I have never thought of what an open-source community could be like. My journey into a real-world open-source community began when I joined [the TiKV community](https://github.com/tikv) as a Community Bridge mentee. After completing the [Full Chunk-based Computing project](https://github.com/tikv/tikv/issues/7724), I became a committer of the TiKV project. Then I mentored on other LFX Mentorship programs such as [Enum/Set Support in TiKV](https://github.com/tikv/tikv/issues/9066) and [Coprocessor Plugin project](https://github.com/tikv/tikv/issues/9747) (co-mentor).

In the meantime, I led the development of [SJTUG mirror service](https://mirror.sjtu.edu.cn) infrastructure leveraging cloud service, including [mirror-docker-unified](https://github.com/sjtug/mirror-docker-unified), [mirror-intel](https://github.com/sjtug/mirror-intel), and [mirror-clone](https://github.com/sjtug/mirror-clone). SJTUG mirror now serves 3TB of data per day, which is 3 times more than it was 2 years ago. Also, I am a maintainer of [SJTUThesis](https://github.com/sjtug/SJTUThesis), the LaTeX thesis template used by SJTU students. Tens of thousands of users are using infrastructure and services provided by the SJTUG community, which is exciting and inspiring. We are building things used by users all around the world, together in the open-source community.

Now you may have a better idea of the motivation behind what I have done: for fun, for all.
