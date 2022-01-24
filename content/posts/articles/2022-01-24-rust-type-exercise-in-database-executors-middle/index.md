+++
title = "用 Rust 做类型体操 (中篇)"
date = "2022-01-24T23:00:00+08:00"
toc = true
tags = ["Rust", "数据库", "执行器", "类型", "GAT"]
+++

TL;DR: 本人前两天刚写的 [type-exercise-in-rust (GitHub)](https://github.com/skyzh/type-exercise-in-rust) 中已经包含了一整套数据库执行器的类型设计，本文将详细介绍整个设计过程中的思考过程和解决方案。

## Day 3: 实现 `ArrayImpl` 等动态调度类型

在 Day 3-4 中，我们要考虑一件事情：数据库系统在编译期是不可能知道每个从存储、从网络上传过来的 Array 是什么类型的。我们需要给 Array 提供动态分发的功能。

```rust
fn eval_binary(i1: Box<dyn Array> i2: Box<dyn Array>) -> Box<dyn Array> {
  /* some black magic */
}
```

说到动态分发，同学们一定会立刻想到用 `Box<dyn Array>` 来表示 Array 的动态类型。可惜的是，`Array` trait 在历经 Day 0, 1, 2 的类型体操之后，已经不符合 object safety 了。

如果一个 trait 可以被包裹成一个动态分发的对象（如 `Box<dyn Array>`，编译器会给 `dyn Array` 实现 `Array` trait。我们看看现在的 `Array` trait 长啥样：

```rust
/// [`Array`] is a collection of data of the same type.
pub trait Array /* 省略一些 bound */ {
    /// Retrieve a reference to value.
    fn get(&self, idx: usize) -> Option<Self::RefItem<'_>>;

    /// Number of items of array.
    fn len(&self) -> usize;

    /// Indicates whether this array is empty
    fn is_empty(&self) -> bool {
        self.len() == 0
    }

    /// Get iterator of this array.
    fn iter(&self) -> ArrayIterator<Self>;
}
```

对于 `Int32Array`，`get` 接收 `Option<i32>` 参数；而对于 `StringArray`, `get` 接收 `Option<&str>` 参数。因此，这个 trait 是不可能给 `dyn Array` 实现的——根本没有统一的签名能够实现。

因此，我们考虑使用 `enum` 来做 dispatch：

```rust
pub enum ArrayImpl {
    Int32(I32Array),
    Float32(F32Array),
    String(StringArray),
}
```

这时同学们一定有想问：既然是 enum，为啥不用 [enum_dispatch](https://crates.io/crates/enum_dispatch) 这个库捏？

enum_dispatch 也会自动为 ArrayImpl 这个 enum 类型实现 `Array` trait，但上面的一通分析表明这是不可能的，所以我们要自己亲自动手实现。

### ArrayImpl 的函数签名

`ArrayImpl` 实现的 `get` 函数，究竟用什么签名比较好呢？

```rust
impl ArrayImpl {
  fn get(&self, idx: usize) -> Option</* ??? */>;
}
```

考虑到这里只能填单个类型，我们把 `Scalar`, `ScalarRef` 也做一整套 enum 出来：

```rust
/// Encapsules all variants of [`Scalar`]
pub enum ScalarImpl {
    Int32(i32),
    Float32(f32),
    String(String),
}

/// Encapsules all variants of [`ScalarRef`]
pub enum ScalarRefImpl<'a> {
    Int32(i32),
    Float32(f32),
    String(&'a str),
}
```

这样，`ArrayImpl` 就可以用这个签名了：

```rust
impl ArrayImpl {
  fn get(&self, idx: usize) -> Option<ScalarRefImpl<'_>>;
}
```

### 实现 `TryFrom` 和 `Into` trait

接下来的目标就是在泛型函数中将 `ArrayImpl` 转换成一个 generic 类型。

```rust
fn eval_binary<I1: Array, I2: Array>(i1: &ArrayImpl, i2: &ArrayImpl) -> Result<ArrayImpl> {
    let i1: &I1 = i1.try_into()?;
    let i2: &I2 = i2.try_into()?;
    /* some black magic */
}
```

这就要求我们给 `Array` 加上 `TryFrom` 和 `Into` 的 bound。

```rust
pub trait Array: Send + Sync + Sized + 'static + TryFrom<ArrayImpl> + Into<ArrayImpl>
where
    for<'a> Self::OwnedItem: Scalar<RefType<'a> = Self::RefItem<'a>>,
{
```

简单实现一下各个 `Array` 的 `TryFrom` 和 `ArrayImpl` 的 `From`，带上这个 bound 就可以编译通过了。实现的方式就是 match `ArrayImpl` 的 enum variant，然后分别做 dispatch。这里又会碰到 `PrimitiveArray` blanket implementation 导致的类型不匹配的坑，记得要给 `PrimitiveArray` 多加两个 bound: `Into<ArrayImpl>` 和 `TryFrom<ArrayImpl>`

```rust
impl<T> Array for PrimitiveArray<T>
where
    T: PrimitiveType,
    T: Scalar<ArrayType = Self>,
    for<'a> T: ScalarRef<'a, ScalarType = T, ArrayType = Self>,
    for<'a> T: Scalar<RefType<'a> = T>,
    Self: Into<ArrayImpl>,
    Self: TryFrom<ArrayImpl>,
{
```

### 表达 `ArrayImpl` 引用的 `TryFrom` bound

回顾一下之前 `eval_binary` 的签名：

```rust
fn eval_binary<I1: Array, I2: Array>(i1: &ArrayImpl, i2: &ArrayImpl) -> Result<ArrayImpl> {
    let i1: &I1 = i1.try_into()?;
    let i2: &I2 = i2.try_into()?;
    /* some black magic */
}
```

等等，好像有点不太对：这里要求的是 `&Array: TryFrom<&ArrayImpl>`，而不是 `Array: TryFrom<ArrayImpl>`。如何表达 `Array` 的引用有 `TryFrom` 的性质呢？

再次结合之前 Day 2 的经验，我们可以用 [HRTB](https://doc.rust-lang.org/nomicon/hrtb.html) 来表示这个性质：

```rust
pub trait Array: Send + Sync + Sized + 'static + TryFrom<ArrayImpl> + Into<ArrayImpl>
where
    for<'a> Self::OwnedItem: Scalar<RefType<'a> = Self::RefItem<'a>>,
    for<'a> &'a Self: TryFrom<&'a ArrayImpl>
{
```

加好以后，诶，为什么编译过不了了？编译器报了 15 个错，都是在使用 `Array` 的地方：

```plain
error[E0277]: the trait bound `for<'a> &'a A: From<&'a array::ArrayImpl>` is not satisfied
   --> archive/day3/src/array/iterator.rs:8:33
    |
8   | pub struct ArrayIterator<'a, A: Array> {
    |                                 ^^^^^ the trait `for<'a> From<&'a array::ArrayImpl>` is not implemented for `&'a A`
    |
    = note: required because of the requirements on the impl of `for<'a> Into<&'a A>` for `&'a array::ArrayImpl`
note: required because of the requirements on the impl of `for<'a> TryFrom<&'a array::ArrayImpl>` for `&'a A`
   --> archive/day3/src/scalar.rs:185:10
    |
185 | impl<'a> TryFrom<ScalarRefImpl<'a>> for &'a str {
    |          ^^^^^^^^^^^^^^^^^^^^^^^^^^     ^^^^^^^
note: required by a bound in `array::Array`
   --> archive/day3/src/array.rs:24:23
    |
21  | pub trait Array: Send + Sync + Sized + 'static + TryFrom<ArrayImpl> + Into<ArrayImpl>
    |           ----- required by a bound in this
...
24  |     for<'a> &'a Self: TryFrom<&'a ArrayImpl>
    |                       ^^^^^^^^^^^^^^^^^^^^^^ required by this bound in `array::Array`
help: consider introducing a `where` bound, but there might be an alternative better way to express this requirement
    |
8   | pub struct ArrayIterator<'a, A: Array> where &'a A: for<'a> From<&'a array::ArrayImpl> {
    |                                        +++++++++++++++++++++++++++++++++++++++++++++++
```

给 `Array` 加上这个 bound，会导致我们需要在所有用到 `Array` 的地方都写上 `where &'a A: for<'a> From<&'a array::ArrayImpl>`。这样就给使用者造成了很大的负担：开发者明明只想用 `Array` 来写一些泛型 SQL scalar 函数，结果每次写的时候都要带上一大堆 trait bound，这简直是徒增开发难度！

怎么办呢？考虑到几个点：
* 开发者一般只需要实现原始类型的泛型函数。
* 运行时的类型转换由向量化框架来做。

这么一想，那其实在我们表达式框架的内部要求这个 bound 是最好的解决方案了。

去掉 `Array` 上的 `TryFrom` bound，把它写在 `eval_binary` 上：

```rust
fn eval_binary<'a, I1: Array, I2: Array>(
    i1: &'a ArrayImpl,
    i2: &'a ArrayImpl,
) -> Result<ArrayImpl, ()>
where
    &'a I1: TryFrom<&'a ArrayImpl, Error = ()>,
    &'a I2: TryFrom<&'a ArrayImpl, Error = ()>,
{
    let i1: &'a I1 = i1.try_into()?;
    let i2: &'a I2 = i2.try_into()?;
    todo!()
}
```

然后，编译通过，Part 3 就结束了！

## Day 4: Macro 生成 boilerplate code

随着我们的 `Array` 类型越来越多，我们需要手写的代码也越来越多。比如 `ArrayImpl::get`：

```rust
impl ArrayImpl {
    pub fn get(&self, idx: usize) -> Option<ScalarRefImpl<'_>> {
        match self {
            Self::Int32(a) => a.get(idx).map(ScalarRefImpl::Int32),
            Self::Int64(a) => a.get(idx).map(ScalarRefImpl::Int64),
            Self::Float32(a) => a.get(idx).map(ScalarRefImpl::Float32),
            // 每添加一个类型就要多写一个 arm ...
        }
    }
}
```

包括 `TryFrom`, `len` 等等函数，也需要我们手动实现动态分发。

有没有什么办法可以写一次就自动给所有类型生成相关的动态分发代码呢？聪明的你一定想到了用宏展开来解决：

```rust
/// Implements dispatch functions for [`Array`]
macro_rules! impl_array_dispatch {
    ($( { $Abc:ident, $abc:ident, $AbcArray:ty, $AbcArrayBuilder:ty, $Owned:ty, $Ref:ty } ),*) => {
        impl ArrayImpl {
            /// Get the value at the given index.
            pub fn get(&self, idx: usize) -> Option<ScalarRefImpl<'_>> {
                match self {
                    $(
                        Self::$Abc(array) => array.get(idx).map(ScalarRefImpl::$Abc),
                    )*
                }
            }
        }
    }
}

impl_array_dispatch! {
    { Int32, int32, Int32Array, Int32ArrayBuilder, i32, i32 },
    { Int64, int64, Int64Array, Int64ArrayBuilder, i64, i64 },
    { String, string, StringArray, StringArrayBuilder, String, &'a str },
    // ...
}
```

问题来了：我们的 `impl_array_dispatch` macro 肯定是到处都有——有的用来 impl `TryFrom` for `ArrayImpl`, 有的用来 impl `ArrayImpl`。如果我们有多个这样的 macro，macro 展开的参数 `{ Int32, int32, Int32Array, Int32ArrayBuilder, i32, i32 }` 也要写很多份。

```rust
impl_array_dispatch! {
    { Int32, int32, Int32Array, Int32ArrayBuilder, i32, i32 },
    { Int64, int64, Int64Array, Int64ArrayBuilder, i64, i64 },
    { String, string, StringArray, StringArrayBuilder, String, &'a str },
    // ...
}

impl_array_try_from! {
    { Int32, int32, Int32Array, Int32ArrayBuilder, i32, i32 },
    { Int64, int64, Int64Array, Int64ArrayBuilder, i64, i64 },
    { String, string, StringArray, StringArrayBuilder, String, &'a str },
    // ...
}

// ...
```

有什么办法可以解决这个问题呢？试试 macro 能不能传 macro 参数进去：

```rust
macro_rules! list_all_variants! {
    () => {
        { Int16, int16, I16Array, I16ArrayBuilder, i16, i16 },
        { Int32, int32, I32Array, I32ArrayBuilder, i32, i32 },
        { Int64, int64, I64Array, I64ArrayBuilder, i64, i64 },
        { Float32, float32, F32Array, F32ArrayBuilder, f32, f32 },
        { Float64, float64, F64Array, F64ArrayBuilder, f64, f64 },
        { Bool, bool, BoolArray, BoolArrayBuilder, bool, bool },
        { String, string, StringArray, StringArrayBuilder, String, &'a str }
    }
}

impl_array_dispatch! { list_all_variants! {} }
```

紧接着编译器报了一堆错，五彩缤纷：

![类型体操的报错](type-exercise-3-errors.png)

这是为什么捏？

这就要从 Rust macro 的执行方式讲起了。我们用正常的 Rust 程序来打个比方：

```rust
fn list_all_variants() -> Vec<Variants>;
fn impl_array_dispatch(data: Vec<Variants>) -> GeneratedCode;

impl_array_dispatch(list_all_variants());
```

对于 Rust 程序来说，执行的方法是先调用 `list_all_variants()` 获得返回值，然后把这个返回值交给 `impl_array_dispatch` 来继续执行，由里到外展开。

对于 Rust macro 来说，情况就截然相反：

```rust
impl_array_dispatch! { list_all_variants! {} }
```

在这里，Rust 编译时先尝试展开 `impl_array_dispatch` 这个 macro。此时，`list_all_variants! {}` 这些 token 会作为 macro 的参数传进去。但我们需要的是符合 `$( { $Abc:ident, $abc:ident, $AbcArray:ty, $AbcArrayBuilder:ty, $Owned:ty, $Ref:ty } ),*` 的一个参数，`list_all_variants! {}` 这四个 token 显然不满足 `impl_array_dispatch` macro 需要的参数。

怎么在这种由外到里展开的顺序里面实现宏代码的复用呢？我拍脑袋想出了一种聪明的办法：

```rust
/// `for_all_variants` includes all variants of our array types. If you added a new array
/// type inside the project, be sure to add a variant here.
///
/// Every tuple has four elements, where
/// `{ enum variant name, function suffix name, array type, builder type, scalar type }`
macro_rules! for_all_variants {
    ($macro:tt) => {
        $macro! {
            { Int16, int16, I16Array, I16ArrayBuilder, i16, i16 },
            { Int32, int32, I32Array, I32ArrayBuilder, i32, i32 },
            { Int64, int64, I64Array, I64ArrayBuilder, i64, i64 },
            { Float32, float32, F32Array, F32ArrayBuilder, f32, f32 },
            { Float64, float64, F64Array, F64ArrayBuilder, f64, f64 },
            { Bool, bool, BoolArray, BoolArrayBuilder, bool, bool },
            { String, string, StringArray, StringArrayBuilder, String, &'a str }
        }
    };
}

for_all_variants! { impl_array_builder_dispatch }
```

这样一来，Rust 先展开 `for_all_variants`，得到：

```rust
impl_array_builder_dispatch! {
    { Int16, int16, I16Array, I16ArrayBuilder, i16, i16 },
    { Int32, int32, I32Array, I32ArrayBuilder, i32, i32 },
    { Int64, int64, I64Array, I64ArrayBuilder, i64, i64 },
    { Float32, float32, F32Array, F32ArrayBuilder, f32, f32 },
    { Float64, float64, F64Array, F64ArrayBuilder, f64, f64 },
    { Bool, bool, BoolArray, BoolArrayBuilder, bool, bool },
    { String, string, StringArray, StringArrayBuilder, String, &'a str }
}
```

这和我们在最开始手敲这些类型声明时的 macro 代码一摸一样。

所以，通过调换 `impl_array_builder_dispatch` 和模版 `for_all_variants` 的内外位置关系，我们就做到了 `for_all_variants` 内部信息的服用。这样以来，我们就可以到处实现动态分发的函数了：

```rust
for_all_variants! { impl_array_builder_dispatch }
for_all_variants! { impl_array_try_from }
for_all_variants! { impl_scalar_try_from }
// ...
```

于是乎，我们的 `ArrayImpl` 可以在修改少量代码（往 `for_all_variants` 里面加一条记录）的情况下支持越来越多的类型。Day 4 也结束了！

### 思考题

在本系列中，我们通过 `ArrayImpl` 来做动态分发。是否可以用 `pub struct BoxedArray(Box<dyn Any>)` 来做动态分发？

答案是可以，我们可以有很多种做法：
* 使用 `Any` 的 `TypeId` 替代 `ArrayImpl::XXX` 来判断应该 downcast 到什么类型，然后分发。
* 为 Array 实现一套新的 trait：`ArrayDispatch`，里面加一个 `array_type(&self) -> ArrayTypeEnum` 函数。定义 `pub struct BoxedArray(Box<dyn ArrayDispatch>)`，通过 `array_type` 来决定 downcast 到什么类型。

---

欢迎在这篇文章对应的 [Issue](https://github.com/skyzh/skyzh.github.io/issues/9) 下使用 GitHub 账号评论、交流你的想法。

*（未完待续）*
