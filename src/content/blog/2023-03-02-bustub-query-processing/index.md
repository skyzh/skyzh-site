---
title: "Query Processing in BusTub"
pubDate: "2023-04-07T00:00:00-04:00"
tags: ["BusTub", "15-445", "CMU", "Database"]
description: "Query Processing in BusTub"
---

Before Fall 2022, the [BusTub](https://github.com/cmu-db/bustub) project (a course project for CMU 15-445/645 Database Systems) only covered certain aspects of database systems: memory management (Project 1 Buffer Pool Manager), storage engines (Project 2 Index), query execution (Project 3 Query Execution), and concurrency control (Project 4 Concurrency Control). In August 2022, I began writing the query processing layer for BusTub, which introduced a complete SQL layer and enabled BusTub to make the leap to a full-fledged SQL database. Starting Fall 2022, students will be able to use BusTub directly to run SQL queries and verify the correctness of their operator implementations.

![BusTub Overview](overview.png)

BusTub's SQL layer is similar in approach to the [RisingLight](https://github.com/risinglightdb/risinglight) project that I previously participated in, as well as to [DuckDB](https://github.com/duckdb/duckdb). The parser uses libpg_query packaged by DuckDB to parse SQL statements. After parsing, the binder binds identifiers to various entities, the planner generates a query plan, and the optimizer optimizes it into the final query plan. Currently, the entire SQL engine of BusTub supports simple join and aggregation queries, uncorrelated subqueries, and CTEs. It is worth mentioning that BusTub can now also be compiled into WASM and run directly [in the browser](https://15445.courses.cs.cmu.edu/spring2023/bustub/). We have distributed the compiled artifacts of the BusTub reference solution through a web page, so that students can get a rough idea of what they can achieve at the end of the semester before starting the project.

*Fun fact: All database systems with binders are more or less connected to CMU, where binder seems to first appear in the [Peloton](https://github.com/cmu-db/peloton) project.*

From a course design perspective, the code for BusTub's query processing layer is included in the starter code along with some basic operators. Students can run very simple queries (scanning mock tables, filtering, performing simple mathematical operations) at the beginning of the semester. After completing the buffer pool manager, they can create tables; after completing the Index, they can create indexes; and after completing the query execution project, they can run a lot more SQL queries.

Although there is not much room left for changes in the code of BusTub's query processing layer, we have left some room for students to optimize with their creativity. Students can implement new optimizer rules to make queries execute faster through simple transformations, which is an optional leaderboard task for the Query Execution project. At the same time, they can also implement new expressions, which is now part of [project 0 C++ Primer](https://15445.courses.cs.cmu.edu/spring2023/project0/) in Spring 2023.

This article mainly shares experiences, so most of the content is "facts" about the BusTub SQL layer. Not many people write binder, planner, and optimizer from scratch in the database industry. If someone really has the opportunity to do so, they can look back at the pitfalls that I have encountered and probably learn something from this article.

Below we will introduce the various modules of the BusTub SQL engine. The parser is just using libpg_query, so there isn't much to say in detail, and we will skip this part.

## Binder

After generating the Postgres AST through libpg_query, the Binder will rewrite this AST into a higher-level AST that BusTub can understand. In this process, we will resolve all identifiers to entities. Let's take the simplest example of `select *`:

```
bustub> explain (binder) select * from __mock_table_1;
=== BINDER ===
BoundSelect {
  table=BoundBaseTableRef { table=__mock_table_1, oid=0 },
  columns=[__mock_table_1.colA, __mock_table_1.colB],
  groupBy=[],
  having=,
  where=,
  limit=,
  offset=,
  order_by=[],
  is_distinct=false,
}
```

The Binder will look up the information of `__mock_table_1` in the catalog and bind it to a table `(table_oid=0)`. At the same time, the `*` in `select *` is expanded into all columns that can be queried. This completes the entire binding process.


Let's take a look at a more complex example:

```
bustub> explain (binder) select colC from (select * from __mock_table_2, __mock_table_3);
=== BINDER ===
BoundSelect {
  table=BoundSubqueryRef {
    alias=__subquery#0,
    subquery=BoundSelect {
      table=BoundCrossProductRef { left=BoundBaseTableRef { table=__mock_table_2, oid=1 }, right=BoundBaseTableRef { table=__mock_table_3, oid=2 } },
      columns=[__mock_table_2.colC, __mock_table_2.colD, __mock_table_3.colE, __mock_table_3.colF],
      groupBy=[],
      having=,
      where=,
      limit=,
      offset=,
      order_by=[],
      is_distinct=false,
    },
    columns=["__mock_table_2.colC", "__mock_table_2.colD", "__mock_table_3.colE", "__mock_table_3.colF"],
  },
  columns=[__subquery#0.__mock_table_2.colC],
  groupBy=[],
  having=,
  where=,
  limit=,
  offset=,
  order_by=[],
  is_distinct=false,
}
```

The cross join in the from clause is bound to `BoundCrossProductRef`, which contains two tables. The `*` in the subquery is expanded into the complete column names `__mock_table_2.colC`, `__mock_table_2.colD`, `__mock_table_3.colE`, `__mock_table_3.colF`. The outermost colC is resolved as `__subquery#0.__mock_table_2.colC`. After the entire process, an unambiguous BusTub AST is generated. This is what the binder does.


The previous discussion was based on the the fact that only tables exist in the from clause. Expression binding occurs after the from binding. Therefore, expressions can always find columns in their corresponding tables. However, there is a slightly more complex special case where some expression binding needs to be done in the middle of the from binding process.

```
explain select * from (
	a inner join b on a.cola = b.cola
) inner join c on a.cola = c.cola;
```

During the binding process of `a inner join b on a.cola = b.cola`, we need to map `a.cola` and `b.colb` to entities. Therefore, we first bind `a inner join b` to a `BoundJoinRef` without join conditions, then use this `BoundJoinRef` as a scope to bind expressions, and finally put the expressions back into `BoundJoinRef`. This process is a bit hacky, but overall it is easy to understand and implement.

In addition, there are some non-standard expressions supported by many databases that are not supported in BusTub as I don't want to make this part more hacky. For example, consider the following example:

```
explain select max(x) as max_x from table group by c having max_x > 10
```

`max_x` is an alias in the select list. In binder, we treat the select list as a whole for binding, and the scope of identifier binding is only within the tables in the from clause. Therefore, during the binding of the having clause, there is no way to find the identifier `max_x`. As a result, this query can only be written in BusTub as below:

```
explain select max(x) as max_x from table group by c having max(x) > 10
```

Later, I checked the SQL standard and found that it also does not support using aliases in the having clause 🤣.

## Planner

Planner recursively traverses the BusTub AST generated by Binder to generate a preliminary query plan. To make implementation easier and more understandable, BusTub has a few design points:

* **It uses two sets of expressions in planner and binder.** The biggest difference between the two is the way columns are referenced. In Binder, to use a column, the full column name must be used, such as `__subquery#0.__mock_table_2.colC`. In the planner, expressions can only use the position of the column, such as `#0.1`, which means the first child's second column. I learned this lesson from the RisingLight project, where the mixing of the two representations in the old v1 planner has caused headaches in planning. Anyways, BusTub's expression design solves this problem well.
* **There is no distinction between logical plan nodes and physical plan nodes.** BusTub's SQL layer has a planner and an optimizer. Typically, in this design, the planner generates logical plan nodes, which are then optimized through a series of steps to produce physical plan nodes. However, BusTub is just a teaching project, so we only have physical plan nodes. The planner will directly generate a NestedLoopJoin join plan, and then the optimizer will rewrite it as a HashJoin or NestedIndexJoin.
* **We added filter, projection, and values plan nodes.** Previously, projections and filters need to be supported by every executor, where every executor will need to filter or project their output before returning a tuple to the parent executor. These are now separate operators. Also, the values plan node is used for the `insert into values ...` statement.

Currently, the most complex part of the planner is planning the aggregation operator. I decided that the aggregation operator only does aggregation and does not handle having clauses or post-aggregation projection. For example:

```
select x, max(y) + min(z) from t1 group by x having max(y) > 10;
```

Previously, BusTub processed the entire query with a single aggregation operator. Under the new SQL layer design, we choose to split it up so that each operator is responsible for only one thing. Now, this query will generate the following execution plan in the planner stage:

```
bustub> explain (p) select x, max(y) + min(z) from t1 group by x having max(y) > 10;
=== PLANNER ===
Projection { exprs=[#0.0, #0.2+#0.3] }
  Filter { predicate=#0.1>10 }
    Agg { types=[max, max, min], aggregates=[#0.1, #0.1, #0.2], group_by=[#0.0] }
      SeqScan { table=t1 }
```


A simple aggregation is split into three operators:

* The Aggregation operator calculates `max(y) (in having), max(y), min(z)`.
* The Filter operator processes the having clause.
* The Projection operator performs `max(y) + min(z)`.

This way, the responsibilities of each operator become quite clear. But how exactly is this planning process done? When the planner sees the expression `max(y) + min(z)`, at first it only sees it as a binary operation `+`. Only by delving one level deeper and looking at what's on the left and right hand sides, can it be understood that this addition is not a simple addition, but rather one that must be performed after the aggregation.

This is where planning expressions can be tricky. In the planner, there is a Context used to indicate whether the current plan involves an aggregation operator. If so, when planning expressions and encountering an aggregate function, it is replaced with a concrete column (e.g., `#0.x`) and the aggregate function is added to the Context's aggregate list. Now move back to the example above:

* Plan the having clause first. We see a `>` binary operation and the left-hand side is a max function call. So we add `max(y)` to the context's aggregate list and replace the expression at this position with `#0.1` (the first column is group by). The right-hand side is a normal constant.
* Plan the select list. x is a group column, so we rewrite it as `#0.0`. `max(y) + min(z)` is a binary operation. We see that `max(y)` on the left-hand side is an aggregate function, so we add it to the aggregate list and replace the expression at this position with `#0.2`. The right-hand side `min(z)` is added to the list and replaced with `#0.3`.

Once this process is complete, we can complete the planning of the entire aggregation based on the aggregate list and the rewritten select list/having clause.

## Optimizer

Initially, I didn't plan to add an optimizer to BusTub, hoping to do everything in the planning phase. But later, I realized that adding an optimizer could simplify some things and give students more room to optimize, so I added it.

The BusTub optimizer is a rule-based optimizer. We apply different rules to the current execution plan in order, resulting in the final execution plan. Each rule is manually implemented by the developer, and we do not provide a general rewriting framework. Currently, most rules are implemented in a "bottom-up" way, where we rewrite the entire query plan from bottom to top.

In the starter code, the optimizer provides the following basic functionalities:

* Merge the filter condition into NestedLoopJoin. For example, in the cross join `select * from a, b where a.x = b.y`, an NLJ with `true` predicate and a `a.x = b.y` filter will be generated in the planner phase. In the optimizer, we will merge the filter into the NLJ.
* If there is an equi-join condition and the right table's equi-join column has an index, it is directly optimized into NestedIndexJoin.
* If there is an equi-join condition but no index, it is optimized into HashJoin.

I have come up with three leaderboard test SQLs that cover three common optimizations (join reordering, predicate push-down, column pruning). Students can use their imagination to rewrite these three SQLs in the optimizer to achieve higher execution efficiency.

## Executor

Due to the addition of Projection and Filter operators, significant modifications have been made to the executor layer. Most of the executor's predicate attributes have been removed. For example, aggregation no longer has a predicate.

At the same time, DistinctExecutor has been removed and replaced by group aggregation generated by the planner.

Since the having clause of aggregation is handled by the filter and the computation after aggregation is handled by projection in the planner, the operations that need to be performed for aggregation have also become simpler.

Previously, the most peculiar thing about BusTub was that an expression was saved for each column in the schema. This has been removed. Now, the schema describes the type of each output column of the operator, and there is no longer a requirement to perform projection for each operator after computation.

We also added Sort and TopN executors, where the sort executor is the first executor that performs sorting since BusTub's development.

## Conclusion

The query execution project ran well in Fall 2022. The writeup was completely written. Test cases were redesigned to use SQL. Few students came to office hours. Piazza was quiet. We received feedbacks from students that it is too easy compared with project 2 (B+ tree index) and project 4 (lock manager / concurrency control), probably because using SQL is more intuitive than other projects where students will need to debug for concurrent issue. Therefore, in Spring 2023, we added more optimizer stuff to the project, where students will need to implement hash join with composite join key support and the rule to convert NLJ to hash join.
