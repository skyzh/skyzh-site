+++
title = "用 Rust 做类型体操 (下篇)"
date = "2022-02-01T14:00:00+08:00"
toc = true
tags = ["Rust", "数据库", "执行器", "类型", "GAT"]
categories = ["Tech"]
+++

TL;DR: 本人前两周刚写的 [type-exercise-in-rust (GitHub)][github] 中已经包含了一整套数据库执行器的类型设计，本文将详细介绍整个设计过程中的思考过程和解决方案。

[github]: https://github.com/skyzh/type-exercise-in-rust

## Day 7: 用宏关联逻辑类型和实际类型

在数据库系统中，逻辑类型和实际存储的类型往往不会是一一对应的关系。举例，`CHAR` 和 `VARCHAR` 是两种不同的逻辑类型，但大多数数据库系统对于这两种类型都会用同一种内存表示。在前几天的类型体操中，我们实现的类型都是实际类型 (Physical Type)。在今天，我们将会把逻辑类型和实际类型关联起来，并批量生成表达式。

### 目标

之前我们实现了 `cmp_ge` 这个函数，可以将两个输入 cast 成一个指定类型后进行比较。如何生成所有支持类型的 `cmp_ge` 函数呢？正常来说，我们可能需要：

```rust
pub fn build_binary_expression(
    f: ExpressionFunc,
    i1: DataType,
    i2: DataType,
) -> Box<dyn Expression> {
    use ExpressionFunc::*;

    use crate::expr::cmp::*;
    use crate::expr::string::*;

    match f {
        CmpLe => match (i1, i2) {
            (DataType::BigInt, DataType::Integer) => Box::new(
                BinaryExpression::<i64, i32, bool, _>::new(cmp_le::<i64, i32, i64>),
            ),
            (DataType::Integer, DataType::BigInt) => Box::new(
                BinaryExpression::<i32, i64, bool, _>::new(cmp_le::<i32, i64, i64>),
            ),
            _ => unimplemented!(),
        },
        _ => unimplemented!(),
    }
}
```

如此枚举所有的可能。想想我们的系统里面，现在一共有 8 种类型，于是乎这里可能要写 8 * 8 = 64 个 arm。每个 arm 都要将逻辑类型 `DataType` 和实际类型 `i32` 匹配起来，并指定 cast 的目标，很容易写错。

大家可能立刻可以想到，能不能用 associated type 来表示这些类型之间的关系呢？显然不行。其一，`DataType` 是一个 enum，里面的每个 variant 没有自己的类型，不能直接关联。其二，像 `CHAR`, `Decimal` 这种逻辑类型，往往会带上一些附加信息。比如 `CHAR` 的长度、`Decimal` 的精度等等。这样一来，根本没有办法使用 generic 提供的工具来进行逻辑类型和实际类型之间的关联。

```rust
/// Encapsules all supported (logical) data types in the system.
#[derive(Debug)]
pub enum DataType {
    /// Corresponding to Int16 physical type
    SmallInt,
    /// Corresponding to Int32 physical type
    Integer,
    /// Corresponding to Int64 physical type
    BigInt,
    /// Corresponding to String physical type
    Varchar,
    /// Corresponding to String physical type
    Char { width: u16 },
    /// Corresponding to Bool physical type
    Boolean,
    /// Corresponding to Float32 physical type
    Real,
    /// Corresponding to Float64 physical type
    Double,
    /// Corresponding to Decimal physical type
    Decimal { scale: u16, precision: u16 },
}
```

而我们的目标，是将 `build_expression` 写成这种形式：

```rust
/// Build expression with runtime information.
pub fn build_binary_expression(
    f: ExpressionFunc,
    i1: DataType,
    i2: DataType,
) -> Box<dyn Expression> {
    use ExpressionFunc::*;

    use crate::expr::cmp::*;
    use crate::expr::string::*;

    match f {
        CmpLe => for_all_cmp_combinations! { impl_cmp_expression_of, i1, i2, cmp_le },
        CmpGe => for_all_cmp_combinations! { impl_cmp_expression_of, i1, i2, cmp_ge },
        CmpEq => for_all_cmp_combinations! { impl_cmp_expression_of, i1, i2, cmp_eq },
        CmpNe => for_all_cmp_combinations! { impl_cmp_expression_of, i1, i2, cmp_ne },
        StrContains => Box::new(BinaryExpression::<String, String, bool, _>::new(
            str_contains,
        )),
    }
}
```

怎么办捏？

### 用 macro 关联逻辑类型和实际类型

在 Day 3 中我们已经讲过 Rust 声明宏的特殊性：它的展开顺序是由外到里的。在这种情况下，我们如何定义 `DataType` 到实际类型的映射呢？

一种办法就是用类似于下面这种回调的方式：

```rust
/// Association information for `Boolean` logical type.
macro_rules! boolean {
    ($macro:ident) => {
        $macro! {
            DataType::Boolean,
            BoolArray,
            bool
        }
    };
}

pub(crate) use boolean;
```

`boolean` 这个 macro 包含了 `DataType::Boolean` 的所有信息——它的逻辑类型是 Boolean，对应的 Array 类型是 `BoolArray`，标量类型是 `bool`。

再看一个例子：

```rust
/// Association information for `Char` logical type.
macro_rules! fwchar {
    ($macro:ident) => {
        $macro! {
            DataType::Char { .. },
            StringArray,
            String
        }
    };
}

pub(crate) use fwchar;
```

`fwchar` 这个逻辑类型对应的 match pattern 是 `DataType::Char { .. }`，它可以出现在 match arm 里面。对应的 Array 类型是 `StringArray`，标量类型是 `String`。

接下来，使用者如何把里面的内容提出来捏？我们定义三个宏，分别 extract 里面的每一个元素：

```rust
/// Get the type match pattern out of the type macro. e.g., `DataTypeKind::Decimal { .. }`.
macro_rules! datatype_match_pattern {
    ($match_pattern:pat, $array:ty, $scalar:ty) => {
        $match_pattern
    };
}

pub(crate) use datatype_match_pattern;

/// Get the array type out of the type macro. e.g., `Int32Array`.
macro_rules! datatype_array {
    ($match_pattern:pat, $array:ty, $scalar:ty) => {
        $array
    };
}

pub(crate) use datatype_array;

/// Get the scalar type out of the type macro. e.g., `i32`.
macro_rules! datatype_scalar {
    ($match_pattern:pat, $array:ty, $scalar:ty) => {
        $scalar
    };
}

pub(crate) use datatype_scalar;
```

这样一来，我们就可以用 `fwchar! { datatype_match_pattern };` 来得到定义在 `fwchar` 宏里面的 `DataType::Char { .. }` 了。

用 `trace_macro` 看一下结果：

```rust
fn test_macro_expand() {
    trace_macros!(true);
    fwchar! { datatype_match_pattern };
    boolean! { datatype_array };
    decimal! { datatype_scalar };
    trace_macros!(false);
}
```

```
note: trace_macro
   --> src/datatype/macros.rs:164:5
    |
164 |     boolean! { datatype_array };
    |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^
    |
    = note: expanding `boolean! { datatype_array }`
    = note: to `datatype_array! { DataType :: Boolean, BoolArray, bool }`
    = note: expanding `datatype_array! { DataType :: Boolean, BoolArray, bool }`
    = note: to `BoolArray`

note: trace_macro
   --> src/datatype/macros.rs:163:5
    |
163 |     fwchar! { datatype_match_pattern };
    |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    |
    = note: expanding `fwchar! { datatype_match_pattern }`
    = note: to `datatype_match_pattern! { DataType :: Char { .. }, StringArray, String }`
    = note: expanding `datatype_match_pattern! { DataType :: Char { .. }, StringArray, String }`
    = note: to `DataType::Char { .. }`

note: trace_macro
   --> src/datatype/macros.rs:165:5
    |
165 |     decimal! { datatype_scalar };
    |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    |
    = note: expanding `decimal! { datatype_scalar }`
    = note: to `datatype_scalar!
            { DataType :: Decimal { .. }, DecimalArray, rust_decimal :: Decimal }`
    = note: expanding `datatype_scalar! { DataType :: Decimal { .. }, DecimalArray, rust_decimal :: Decimal }`
    = note: to `rust_decimal::Decimal`
```

可以看到三句话分别展开成了 `BoolArray`, `DataType::Char { .. }`, `Decimal`, 正好可以用在 `build_expression` 里面。

### 展开所有比较函数

接下来我们借助类型体操 Day 3, 4 里面的技巧，用 `for_all_cmp_combinations` 和 `impl_cmp_expression_of` 这一对 macro 来展开所有的比较函数。

```rust
/// Composes all combinations of possible comparisons
///
/// Each item in the list `{ a, b, c }` represents:
/// * 1st position: left input type.
/// * 2nd position: right input type.
/// * 3rd position: cast type. For example, we need to cast the left i32 to i64 before comparing i32
///   and i64.
macro_rules! for_all_cmp_combinations {
    ($macro:tt $(, $x:tt)*) => {
        $macro! {
            [$($x),*],
            // comparison for the same type
            { int16, int16, int16 },
            { int32, int32, int32 },
            { int64, int64, int64 },
            { float32, float32, float32 },
            { float64, float64, float64 },
            { decimal, decimal, decimal },
            { fwchar, fwchar, fwchar },
            { varchar, varchar, varchar },
            // comparison across integer types
            { int16, int32, int32 },
            { int32, int16, int32 },
            { int16, int64, int64 },
            { int32, int64, int64 },
            { int64, int16, int64 },
            { int64, int32, int64 },
            // comparison across float types
            { float32, float64, float64 },
            { float64, float32, float64 },
            // comparison across integer and float32 types
            { int16, float32, float32 },
            { float32, int16, float32 },
            { int32, float32, float64 },
            { float32, int32, float64 },
            // comparison across integer and float64 types
            { int32, float64, float64 },
            { float64, int32, float64 },
            { int16, float64, float64 },
            { float64, int16, float64 },
            // comparison with decimal types
            { int16, decimal, decimal },
            { decimal, int16, decimal },
            { int32, decimal, decimal },
            { decimal, int32, decimal },
            { int64, decimal, decimal },
            { decimal, int64, decimal }
        }
    };
}
```

我们使用 `for_all_cmp_combinations` 这个 macro 来声明所有可以比较的数据类型。以 `{ int16, float32, float32 }` 这一行为例，它的意思就是 int16 和 float32 可以进行比较，比较前 cast 到 float32 类型。

然后我们考虑一下 `impl_cmp_expression_of` 这个 macro 怎么实现。回到最开始写的一段代码：

```rust
(DataType::BigInt, DataType::Integer) => Box::new(
    BinaryExpression::<i64, i32, bool, _>::new(cmp_le::<i64, i32, i64>),
),
```

一拍脑袋，所有用到类型的地方都可以用 macro 来改写。假设输入的两个类型分别是 `$i1` 和 `$i2`，需要 cast 成 `$convert` 类型。先看 match arm：

```rust
(DataType::BigInt, DataType::Integer) =>
// ... can be rewritten to
($i1! { datatype_match_pattern }, $i2! { datatype_match_pattern }) =>
```

然后看看 BinaryExpression 这一段：

```rust
Box::new(
    BinaryExpression::<i64, i32, bool, _>::new(cmp_le::<i64, i32, i64>),
)
// ... can be rewritten to
Box::new(BinaryExpression::<
    $i1! { datatype_scalar },
    $i2! { datatype_scalar },
    bool,
    _
>::new(
    $cmp_func::<
        $i1! { datatype_scalar },
        $i2! { datatype_scalar },
        $convert! { datatype_scalar }
    >,
))
```

这样就得到了 `impl_cmp_expression_of` 的实现：

```rust
macro_rules! impl_cmp_expression_of {
    ([$i1t:ident, $i2t:ident, $cmp_func:tt], $({ $i1:tt, $i2:tt, $convert:tt }),*) => {
        match ($i1t, $i2t) {
            $(
                ($i1! { datatype_match_pattern }, $i2! { datatype_match_pattern }) => {
                    Box::new(BinaryExpression::<
                        $i1! { datatype_scalar },
                        $i2! { datatype_scalar },
                        bool,
                        _
                    >::new(
                        $cmp_func::<
                            $i1! { datatype_scalar },
                            $i2! { datatype_scalar },
                            $convert! { datatype_scalar }
                        >,
                    ))
                }
            )*
            (other_dt1, other_dt2) => unimplemented!("unsupported comparison: {:?} <{}> {:?}",
                other_dt1,
                stringify!($cmp_func),
                other_dt2)
        }
    };
}
```

最后，在 `build_expression` 里面用宏展开：

```rust
/// Build expression with runtime information.
pub fn build_binary_expression(
    f: ExpressionFunc,
    i1: DataType,
    i2: DataType,
) -> Box<dyn Expression> {
    use ExpressionFunc::*;

    use crate::expr::cmp::*;
    use crate::expr::string::*;

    match f {
        CmpLe => for_all_cmp_combinations! { impl_cmp_expression_of, i1, i2, cmp_le },
        CmpGe => for_all_cmp_combinations! { impl_cmp_expression_of, i1, i2, cmp_ge },
        CmpEq => for_all_cmp_combinations! { impl_cmp_expression_of, i1, i2, cmp_eq },
        CmpNe => for_all_cmp_combinations! { impl_cmp_expression_of, i1, i2, cmp_ne },
        StrContains => Box::new(BinaryExpression::<String, String, bool, _>::new(
            str_contains,
        )),
    }
}
```

由此，我们用简单的代码，实现了任何两种类型比较函数的向量化。Day 7 结束了！

---

欢迎在这篇文章对应的 [Issue](https://github.com/skyzh/skyzh.github.io/issues/9) 下使用 GitHub 账号评论、交流你的想法。

*（未完待续）*
