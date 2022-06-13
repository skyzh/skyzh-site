+++
title = "在 Rust 中用 GAT 手动实现零开销 async trait"
date = "2022-01-31T23:00:00+17:00"
toc = true
tags = ["Rust", "GAT", "async", "异步", "零开销"]
categories = ["Tech"]
+++

在这篇文章中，我们将以实现类似 RocksDB 的一系列 iterator 为例，讲解如何在 Rust 中用 GAT 实现零开销 async trait。本文中的代码需要 nightly Rust 才能编译。

我们将会实现两个 iterator：
* TestIterator：产生一个有序的 KV 序列。
* ConcatIterator：将多个 iterator 的序列拼接起来。

举例：`TestIterator::new(0, 5)` 会产生下面的序列：

```plain
key_00000 -> value_00000
key_00001 -> value_00001
key_00002 -> value_00002
key_00003 -> value_00003
key_00004 -> value_00004
```

`ConcatIterator::new(vec![TestIterator::new(0, 5), TestIterator::new(5, 7)])` 会产生：

```plain
key_00000 -> value_00000
key_00001 -> value_00001
key_00002 -> value_00002
key_00003 -> value_00003
key_00004 -> value_00004
key_00005 -> value_00005
key_00006 -> value_00006
```

## 定义 async trait

`KvIterator` 是将会给所有 iterator 实现的一个 trait。用户可以调用 `.next()` 来将迭代器移动到下一个位置。

```rust
pub trait KvIterator {
    /// Get the next item from the iterator.
    async fn next(&mut self) -> Option<(&[u8], &[u8])>;
}
```

随手一编译，报错：

```plain
error[E0706]: functions in traits cannot be declared `async`
 --> src/kv_iterator.rs:5:5
  |
5 |     async fn next(&mut self) -> Option<(&[u8], &[u8])>;
  |     -----^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  |     |
  |     `async` because of this
  |
  = note: `async` trait functions are not currently supported
  = note: consider using the `async-trait` crate: https://crates.io/crates/async-trait
```

Rust 编译器默认不支持 `async` trait function。编译器提示说使用 `async-trait` 这个 crate。可惜的是，这个 crate 不是零开销的。使用 `async-trait` 之后，这个 trait 会被改写成下面的形式：

```rust
#[async_trait]
pub trait KvIterator {
    /// Get the next item from the iterator.
    async fn next(&mut self) -> Option<(&[u8], &[u8])>;
}

/// ... will be rewritten to

pub trait KvIterator {
    /// Get the next item from the iterator.
    fn next(&mut self) -> Box<dyn Future<Output = Option<(&[u8], &[u8])>>>;
}
```

这里就有两层开销了：
* 动态调度的开销 `dyn Future`。这意味着所有迭代器的 next 函数都比较难做一些编译器的优化。
* 内存分配的开销 `Box`。在 KV 存储里，`next` 应该是一个会被经常调用的函数。trait 被 async-trait 改写成新的形式之后，每次调用 `.next` 都需要在堆上新建一个对象。这会对程序的性能造成比较大的影响。

如何零开销地实现 async trait 呢？这就需要 GAT 了。

## 使用 GAT 写 async trait

编译器没有支持 async trait，本质上是因为不同的 impl `KvIterator` 的 `.next` 函数返回的 `Future` 类型是不同的。这个问题可以用 associated type 简单地解决：

```rust
pub trait KvIterator {
    type NextFuture: Future<Output = Option<(&[u8], &[u8])>>;

    /// Get the next item from the iterator.
    fn next(&mut self) -> Self::NextFuture;
}
```

这里就引入了一个问题：`&'lifetime [u8]` 需要有一个生命周期，这个生命周期应该怎么写？从道理上来讲，`'lifetime` 和 `next` 的 `&mut self` 生命周期一致，所以它应该是 `NextFuture` 本身的一个泛型。在 Rust 里怎么表达这件事情？显然这就需要 generic associated type 了。开启 GAT 的编译选项后：

```rust
pub trait KvIterator {
    type NextFuture<'a>: Future<Output = Option<(&'a [u8], &'a [u8])>>;

    /// Get the next item from the iterator.
    fn next(&mut self) -> Self::NextFuture<'_>;
}
```

编译器又报了一个错：

```rust
error: missing required bound on `NextFuture`
 --> src/kv_iterator.rs:4:5
  |
4 |     type NextFuture<'a>: Future<Output = Option<(&'a [u8], &'a [u8])>>;
  |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^-
  |                                                                       |
  |                                                                       help: add the required where clause: `where Self: 'a`
  |
  = note: this bound is currently required to ensure that impls have maximum flexibility
  = note: we are soliciting feedback, see issue #87479 <https://github.com/rust-lang/rust/issues/87479> for more information
```

这是为什么捏？

`NextFuture` 是由 `next` 函数返回的，而一个正常实现的 `next` 函数，只能返回和 `&mut self` 生命周期相同的引用。Rust 的 trait 可以实现在一个引用上 (e.g., `impl <'a> Iterator for &'a mut SomeIterator`)。如果 `Self` (在上面的例子里，`&'a mut SomeIterator`) 本身的生命周期比这个引用还要短，就不可能返回这样一个 `NextFuture` 了。

所以在这里，我们需要加一个 `where Self: 'a`，保证 `Self` 的生命周期至少和 `NextFuture` 的 `'a` 一样长。

在老版本的 Rust 编译器里，这个地方不加 `Self: 'a` 并不会这样报错，而是会报在一些奇奇怪怪的地方。编译器能直接在这里指出这个问题，是件好事情。

```rust
pub trait KvIterator {
    type NextFuture<'a>: Future<Output = Option<(&'a [u8], &'a [u8])>>
    where
        Self: 'a;

    /// Get the next item from the iterator.
    fn next(&mut self) -> Self::NextFuture<'_>;
}
```

这样就能通过编译了！

## 实现 TestIterator

首先快速地写出 `TestIterator` 的框架：

```rust
pub struct TestIterator {
    idx: usize
}

impl KvIterator for TestIterator {
    type NextFuture = /* */;
    fn next(&mut self) -> Self::NextFuture<'_> {
        
    }
}
```

这里碰到了两个问题：

* `next` 里面应该怎么写逻辑？`next` 返回的是一个 Future，并不是常见的 `async fn`。
	* 答案很简单，用 `async move` 返回一个闭包。
* 既然 `next` 返回一个函数，`NextFuture` 的类型怎么写？众所周知，Rust 的函数是写不出类型的。
	* 这里就要开启一个 feature，让编译器自动推导 `Future` 的具体类型。

```rust
#![feature(generic_associated_types)]
#![feature(type_alias_impl_trait)]

pub struct TestIterator {
    idx: usize,
}

impl KvIterator for TestIterator {
    type NextFuture<'a> = impl Future<Output = Option<(&'a [u8], &'a [u8])>>;
    fn next(&mut self) -> Self::NextFuture<'_> {
        async move { Some((b"key".as_slice(), b"value".as_slice())) }
    }
}
```

这样一来，就可以通过编译了！随手实现一下 `TestIterator` 内部的逻辑：

```rust
pub struct TestIterator {
    idx: usize,
    to_idx: usize,
    key: Vec<u8>,
    value: Vec<u8>,
}

impl TestIterator {
    pub fn new(from_idx: usize, to_idx: usize) -> Self {
        Self {
            idx: from_idx,
            to_idx,
            key: Vec::new(),
            value: Vec::new(),
        }
    }
}
impl KvIterator for TestIterator {
    type NextFuture<'a>
    where
        Self: 'a,
    = impl Future<Output = Option<(&'a [u8], &'a [u8])>>;

    fn next(&mut self) -> Self::NextFuture<'_> {
        async move {
            if self.idx >= self.to_idx {
                return None;
            }

            // Zero-allocation key value manipulation

            self.key.clear();
            write!(&mut self.key, "key_{:05}", self.idx).unwrap();

            self.value.clear();
            write!(&mut self.value, "value_{:05}", self.idx).unwrap();

            self.idx += 1;
            Some((&self.key[..], &self.value[..]))
        }
    }
}
```

测试一下 `TestIterator` 能不能正常工作：

```rust
#[tokio::test]
async fn test_iterator() {
    let mut iter = TestIterator::new(0, 10);
    while let Some((key, value)) = iter.next().await {
        println!(
            "{:?} {:?}",
            Bytes::copy_from_slice(key),
            Bytes::copy_from_slice(value)
        );
    }
}
```

跑一下测试，符合预期，成功！

```plain
running 1 test
b"key_00000" b"value_00000"
b"key_00001" b"value_00001"
b"key_00002" b"value_00002"
b"key_00003" b"value_00003"
b"key_00004" b"value_00004"
b"key_00005" b"value_00005"
b"key_00006" b"value_00006"
b"key_00007" b"value_00007"
b"key_00008" b"value_00008"
b"key_00009" b"value_00009"
test test_iterator::tests::test_iterator ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

## 实现 ConcatIterator

`ConcatIterator` 的逻辑也非常简单：记录一下现在在访问哪个迭代器，直接把子迭代器的内容返回就行了：

```rust
pub struct ConcatIterator<Iter: KvIterator> {
    iters: Vec<Iter>,
    current_idx: usize,
}

impl<Iter: KvIterator> ConcatIterator<Iter> {
    pub fn new(iters: Vec<Iter>) -> Self {
        Self {
            iters,
            current_idx: 0,
        }
    }
}

impl<Iter: KvIterator> KvIterator for ConcatIterator<Iter> {
    type NextFuture<'a>
    where
        Self: 'a,
    = impl Future<Output = Option<(&'a [u8], &'a [u8])>>;

    fn next(&mut self) -> Self::NextFuture<'_> {
        async move {
            loop {
                if self.current_idx >= self.iters.len() {
                    return None;
                }
                let iter = &mut self.iters[self.current_idx];
                match iter.next().await {
                    Some(item) => {
                        return Some(item);
                    }
                    None => {
                        self.current_idx += 1;
                    }
                }
            }
        }
    }
}
```

然而，事情没那么简单。编译器报了一个错：

```plain
error[E0502]: cannot borrow `self.iters` as immutable because it is also borrowed as mutable
  --> src/concat_iterator.rs:28:40
   |
28 |                 if self.current_idx >= self.iters.len() {
   |                                        ^^^^^^^^^^^^^^^^ immutable borrow occurs here
...
31 |                 let iter = &mut self.iters[self.current_idx];
   |                                 ---------- mutable borrow occurs here
32 |                 match iter.next().await {
33 |                     Some(item) => return Some(item),
   |                                          ---------- returning this value requires that `self.iters` is borrowed for `'1`
...
37 |         }
   |         - return type of async block is Option<(&'1 [u8], &[u8])>

error[E0499]: cannot borrow `self.iters` as mutable more than once at a time
  --> src/concat_iterator.rs:31:33
   |
31 |                 let iter = &mut self.iters[self.current_idx];
   |                                 ^^^^^^^^^^ `self.iters` was mutably borrowed here in the previous iteration of the loop
32 |                 match iter.next().await {
33 |                     Some(item) => return Some(item),
   |                                          ---------- returning this value requires that `self.iters` is borrowed for `'1`
...
37 |         }
   |         - return type of async block is Option<(&'1 [u8], &[u8])>
```

这是怎么回事捏？很可惜，这是 Rust 目前 borrow checker NLL 的一个缺陷。即使这段代码在逻辑上是说得通的，但 borrow checker 不认为它成立。

这该怎么办呢？我们尝试用两种方法绕过一下。

### 方案一：换个 Borrow Checker

[Polonius](https://rust-lang.github.io/polonius/) 是一个全新的 borrow checker。直接使用 flag 启用它：

```rust
RUSTFLAGS="-Z polonius" cargo build
```

编译通过！Polonius 使用和现在 Rust borrow checker NLL 不同的算法，可以处理更多实际上不会发生 race condition，但目前无法编译的 case。可以说，NLL 可能会报一些 false positive，而 Polonius 可以编译的 Rust 程序是 NLL 的超集。

### 方案二：在结构体内暂存 key value

我们在 `ConcatIterator` 里面缓存一下下层迭代器返回的 kv pair，这样也可以通过编译。可惜的是，这样 `.next()` 的就多了一个拷贝，有点不太“零开销”了。

```rust
pub struct ConcatIterator<Iter: KvIterator> {
    iters: Vec<Iter>,
    key: Vec<u8>,
    value: Vec<u8>,
    current_idx: usize,
}

impl<Iter: KvIterator> ConcatIterator<Iter> {
    pub fn new(iters: Vec<Iter>) -> Self {
        Self {
            iters,
            current_idx: 0,
            key: Vec::new(),
            value: Vec::new(),
        }
    }
}

impl<Iter: KvIterator> KvIterator for ConcatIterator<Iter> {
    type NextFuture<'a>
    where
        Self: 'a,
    = impl Future<Output = Option<(&'a [u8], &'a [u8])>>;

    fn next(&mut self) -> Self::NextFuture<'_> {
        async move {
            loop {
                if self.current_idx >= self.iters.len() {
                    return None;
                }
                let iter = &mut self.iters[self.current_idx];
                match iter.next().await {
                    Some((key, value)) => {
                        self.key.clear();
                        self.key.extend_from_slice(key);
                        self.value.clear();
                        self.value.extend_from_slice(value);

                        break Some((self.key.as_slice(), self.value.as_slice()));
                    }
                    None => {
                        self.current_idx += 1;
                    }
                }
            }
        }
    }
}
```

### 方案三：重构 `KvIterator` trait

```rust
pub trait KvIterator {
    /// The return type of `next`.
    type KvIteratorNextFuture<'a>: Future<Output = ()>
    where
        Self: 'a;

    /// Move the iterator to the position of the next key.
    fn next(&mut self) -> Self::KvIteratorNextFuture<'_>;

    /// Get the current key.
    fn key(&self) -> &[u8];

    /// Get the current value.
    fn value(&self) -> &[u8];

    /// Check if the iterator is exhausted.
    fn is_valid(&self) -> bool;
}
```

我们不使用 Rust-style 的迭代器实现：`.next` 只移动迭代器位置；`key`, `value` 返回内容；`is_valid` 确认是否到头。这样也可以绕过生命周期的问题。

为了实现简单，我们使用方案二跑一下单元测试：

```rust
#[tokio::test]
async fn test_iterator() {
    let iter1 = TestIterator::new(0, 5);
    let iter2 = TestIterator::new(5, 10);
    let mut concat_iter = ConcatIterator::new(vec![iter1, iter2]);

    while let Some((key, value)) = concat_iter.next().await {
        println!(
            "{:?} {:?}",
            Bytes::copy_from_slice(key),
            Bytes::copy_from_slice(value)
        );
    }
}
```

结果正确！

```plain
running 1 test
b"key_00000" b"value_00000"
b"key_00001" b"value_00001"
b"key_00002" b"value_00002"
b"key_00003" b"value_00003"
b"key_00004" b"value_00004"
b"key_00005" b"value_00005"
b"key_00006" b"value_00006"
b"key_00007" b"value_00007"
b"key_00008" b"value_00008"
b"key_00009" b"value_00009"
test concat_iterator::tests::test_iterator ... ok
```

## 总结

使用 generic_associated_types 和 type_alias_impl_trait 这两个 trait，我们就可以轻松手动实现 async trait，避免 `async-trait` crate 带来的内存分配和动态调度开销。不过这么操作有几个问题：

* 需要 nightly Rust
* 不能 recursive (可以考虑用 async-recursion crate)
* 不能直接做成 dyn type (可以用类型体操的技巧手动实现)

您可以在这篇文章对应的 [GitHub Issue](https://github.com/skyzh/skyzh.github.io/issues/13) 下使用 GitHub 账号评论、交流你的想法。
