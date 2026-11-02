import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'database-indexing',
  title: 'Database Indexing',
  summary:
    'An index is a separate, sorted structure that lets the database jump to matching rows instead of reading the whole table. It speeds up the reads it matches and makes every write a little more expensive.',
  minutes: 16,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-database-indexing-1',
      text: 'explain how an index lets a database find rows without scanning the whole table, and which kinds of conditions a B-tree index can serve.',
    },
    {
      id: 'sd-database-indexing-2',
      text: 'weigh the costs of an index, including slower writes and extra storage, and explain why the planner may still choose a full table scan.',
    },
    {
      id: 'sd-database-indexing-3',
      text: 'pick an index for a given query, including column order in a composite index, and confirm it is used with EXPLAIN.',
    },
  ],
  concept: [
    {
      heading: 'Why indexes matter',
      blocks: [
        {
          type: 'text',
          md: 'Picture a filing cabinet of customer forms in the order they arrived. To find the customer with a given email you would have to read every form. Now picture a separate card box, sorted by email, where each card says which drawer and folder that form lives in. Finding one email takes a few flips, no matter how many forms there are.\n\nThat card box is an **index**. Without one, a query like `SELECT * FROM users WHERE email = $1` makes the database read the table row by row, a **sequential scan**. On a small table you will never notice. As the table grows, the same query reads more and more rows, while an indexed lookup stays a short walk down a search tree.\n\nIndexing is often the single biggest lever on database performance, and also one of the easiest to misuse. This lesson covers what an index is, what it costs, and how to pick the right one.',
        },
      ],
    },
    {
      heading: 'How an index works',
      blocks: [
        {
          type: 'text',
          md: "An index is a **separate data structure** that the database keeps alongside the table. In PostgreSQL every index is stored apart from the table's main data (the **heap**), so an ordinary index scan first finds matching entries in the index and then fetches each row from the heap.\n\n**B-tree** is the default index type in PostgreSQL. It keeps keys **sorted**, which is why it can serve:\n\n- equality and comparisons: `=`, `<`, `<=`, `>`, `>=`, plus `BETWEEN` and `IN`\n- `IS NULL` and `IS NOT NULL`\n- `ORDER BY` on the indexed column, by reading entries in order\n\nA **hash** index stores a hash of each value, so it can only answer equality (`=`).\n\nSome indexes you get for free: PostgreSQL automatically creates a unique index for every primary key and unique constraint, and that index is how the constraint is enforced. Creating another index on the same column just duplicates it.\n\nA **composite** (multicolumn) index sorts by its first column, then by the second within equal first values, like a phone book sorted by last name then first name. That is why column order matters. MySQL states the rule as the **leftmost prefix**: an index on `(last_name, first_name)` can look up rows by `last_name`, or by `last_name` and `first_name`, but not by `first_name` alone. PostgreSQL's docs say the same thing more precisely: a multicolumn B-tree is most efficient when the leading columns are constrained, and equality on leading columns plus a range on the next column is what narrows the part of the index scanned.\n\nIf an index contains every column a query needs, PostgreSQL may answer it with an **index-only scan** that skips the heap; the `INCLUDE` clause adds extra payload columns to make such a **covering index**.",
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Sequential scan',
              definition:
                'Reading every row of a table to find the ones that match a condition.',
            },
            {
              term: 'B-tree index',
              definition:
                'The default index type: a balanced search tree of sorted keys that supports equality, range conditions and sorted reads.',
            },
            {
              term: 'Composite index',
              definition:
                'An index on several columns, sorted by the first column, then the second, and so on.',
            },
            {
              term: 'Leftmost prefix',
              definition:
                'The leading columns of a composite index; lookups can use the index only when they constrain a leftmost prefix.',
            },
            {
              term: 'Selectivity',
              definition:
                'How small a fraction of rows a condition matches. Indexes help most for conditions that match few rows.',
            },
            {
              term: 'Query planner',
              definition:
                'The part of the database that estimates the cost of possible plans, using table statistics, and picks the cheapest.',
            },
          ],
        },
        {
          type: 'example',
          title: 'The account page query',
          md: "Every account page runs:\n\n`SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 20`\n\nWith no index, the database scans every order, keeps one customer's rows and sorts them. With an index on `(customer_id, created_at)`, the entries for one customer sit next to each other, already ordered by date. The database jumps to that customer, reads the last 20 entries in order and fetches those 20 rows.\n\nAn index on `(created_at, customer_id)` is much weaker here: the leading column has no equality condition, so the database cannot jump straight to one customer's entries.",
        },
      ],
    },
    {
      heading: 'Where the index sits in a query',
      blocks: [
        {
          type: 'text',
          md: 'The planner decides for each query whether to use an index or scan the table. The diagram traces both paths for a lookup by email.',
        },
        {
          type: 'diagram',
          caption:
            'The planner either walks the index and fetches matching rows, or scans the whole table.',
          nodes: [
            { id: 'app', label: 'App server', kind: 'client', col: 0, row: 2 },
            {
              id: 'planner',
              label: 'Query planner',
              kind: 'service',
              col: 1,
              row: 2,
            },
            {
              id: 'index',
              label: 'B-tree on email',
              kind: 'store',
              col: 2,
              row: 1,
            },
            {
              id: 'heap',
              label: 'users table (heap)',
              kind: 'store',
              col: 3,
              row: 2,
            },
          ],
          edges: [
            { from: 'app', to: 'planner', label: 'WHERE email = $1' },
            { from: 'planner', to: 'index', label: 'index scan' },
            { from: 'index', to: 'heap', label: 'fetch matching rows' },
            {
              from: 'planner',
              to: 'heap',
              label: 'seq scan (fallback)',
              dashed: true,
            },
          ],
        },
      ],
    },
    {
      heading: 'What an index costs',
      blocks: [
        {
          type: 'text',
          md: "Indexes are not free:\n\n- **Every write pays.** Once an index exists, the database keeps it in sync with the table, so `INSERT`, `UPDATE` and `DELETE` do extra work for each index on the table. PostgreSQL's docs advise removing indexes that are seldom or never used.\n- **Storage.** Each index takes disk space and memory, and covering indexes with wide columns take more.\n- **Building one blocks writes by default.** In PostgreSQL, a plain `CREATE INDEX` lets reads continue but blocks writes to the table until the build finishes; `CREATE INDEX CONCURRENTLY` avoids that, with caveats.\n\nAnd an index is only an option for the planner, never an order. The planner estimates costs from table statistics (refreshed by `ANALYZE`) and uses the index only when it expects that to be cheaper. When a condition matches a large share of the table, fetching rows through the index one by one can cost more than reading the table straight through, so a sequential scan is the right choice.\n\nIndexes also only help conditions they can match. A B-tree on `email` cannot serve `WHERE lower(email) = $1`, because the indexed values are not lowercased; PostgreSQL supports an **expression index** on `lower(email)` for exactly that case.",
        },
      ],
    },
  ],
  application: {
    heading: 'Indexing a real workload',
    blocks: [
      {
        type: 'text',
        md: "In practice, indexes follow queries. A sound routine:\n\n1. **Find the queries that matter:** the ones run on every request and the slow ones in your logs.\n2. **Read the plan.** `EXPLAIN` shows the plan the planner chose (for example `Seq Scan` or `Index Scan`) with estimated costs. `EXPLAIN ANALYZE` actually runs the query and adds real row counts and timings. Because it runs the query, an `EXPLAIN ANALYZE` of an `UPDATE` or `DELETE` really changes data; wrap it in `BEGIN` and `ROLLBACK`.\n3. **Index for the filter and sort.** Put columns with equality conditions first in a composite index, then a range or sort column.\n4. **Test with realistic data.** PostgreSQL warns that indexes chosen on small test data only tell you what the test data needs.\n5. **Remove what is unused**, especially on write-heavy tables.\n\nLimits: indexes do little for conditions that match most of the table, for patterns they cannot represent (a B-tree cannot help `LIKE '%son'`, because the match is not anchored at the start), or for write-heavy tables where every extra index slows ingestion. Very large tables eventually need other tools, such as partitioning and sharding, covered in Level 2.",
      },
    ],
  },
  misconceptions: [
    {
      claim: 'It is safest to index every column.',
      correction:
        "Each index must be updated on every insert, update and delete that touches it, and takes storage. Indexes that queries never use only slow writes down; PostgreSQL's docs recommend removing them.",
    },
    {
      claim:
        'If an index exists on the column, the database will always use it.',
      correction:
        'The planner picks the plan it estimates is cheapest. For conditions that match a large share of rows, or with stale statistics, it may choose a sequential scan, and for many-row matches that is often correct.',
    },
    {
      claim:
        'A composite index on (a, b) helps queries on b alone as much as queries on a.',
      correction:
        "A composite index is sorted by a first. MySQL cannot use it for lookups on b alone, and PostgreSQL's docs say it is most efficient when the leading columns are constrained. Order the columns to match your queries.",
    },
  ],
  questions: [
    {
      id: 'sd-database-indexing-q1',
      objective: 'sd-database-indexing-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        "With no usable index, how does the database find the rows for `WHERE email = 'ana@example.com'`?",
      options: [
        {
          id: 'a',
          text: 'It asks the application cache for the matching row first',
          explanation:
            "The database does not consult your application's cache; that lives outside it.",
        },
        {
          id: 'b',
          text: 'It binary-searches the table, which is kept sorted by email',
          explanation:
            'A table is not kept sorted by an arbitrary column. Sorted order is what an index provides.',
        },
        {
          id: 'c',
          text: 'It reads the table row by row and checks each one',
          explanation:
            'Correct. Without an index the database does a sequential scan, reading every row to test the condition.',
        },
        {
          id: 'd',
          text: 'It returns an error asking you to create an index',
          explanation:
            'The query still runs correctly; it is just slower because it reads the whole table.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-database-indexing-q2',
      objective: 'sd-database-indexing-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'In PostgreSQL, what kind of index does a plain `CREATE INDEX` statement build when you do not specify a type?',
      options: [
        {
          id: 'a',
          text: 'A B-tree index',
          explanation:
            "Correct. B-tree is PostgreSQL's default index type and fits the most common cases.",
        },
        {
          id: 'b',
          text: 'A hash index',
          explanation:
            'Hash indexes exist but must be requested with `USING HASH`, and they only support equality.',
        },
        {
          id: 'c',
          text: 'A GIN index',
          explanation:
            'GIN is used for values with many parts, such as `jsonb` documents, and must be requested with `USING GIN`.',
        },
        {
          id: 'd',
          text: 'A full sorted copy of the table',
          explanation:
            'An index stores keys and pointers to rows, not a full copy of the table.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-database-indexing-q3',
      objective: 'sd-database-indexing-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt: 'Why does adding more indexes to a table slow down writes?',
      options: [
        {
          id: 'a',
          text: 'Each index locks the table against all reads during every write',
          explanation:
            'Normal writes do not block all reads because of indexes. The cost is extra work, not a read lock.',
        },
        {
          id: 'b',
          text: 'The database rebuilds every index from scratch after each write',
          explanation:
            'Indexes are updated incrementally, entry by entry, not rebuilt on each write.',
        },
        {
          id: 'c',
          text: 'Each write has to wait for `ANALYZE` to refresh statistics',
          explanation:
            '`ANALYZE` runs separately to update planner statistics. Writes do not wait for it.',
        },
        {
          id: 'd',
          text: 'Every insert, update or delete must also update each affected index',
          explanation:
            'Correct. The database keeps every index in sync with the table, so each index adds work to data changes.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-database-indexing-q4',
      objective: 'sd-database-indexing-1',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'Why can a B-tree index on `created_at` serve `WHERE created_at BETWEEN $1 AND $2 ORDER BY created_at` efficiently?',
      options: [
        {
          id: 'a',
          text: 'It hashes each timestamp, so any range can be found in one step',
          explanation:
            'Hashing destroys order, which is why hash indexes only support equality, not ranges.',
        },
        {
          id: 'b',
          text: 'Its keys are sorted, so the range is one contiguous run already in order',
          explanation:
            'Correct. The database finds the start of the range and reads forward, and the entries come out already sorted.',
        },
        {
          id: 'c',
          text: 'It stores every column of each row, so no table access is needed',
          explanation:
            'A normal index stores the indexed key and a pointer; rows are still fetched from the table.',
        },
        {
          id: 'd',
          text: 'It caches each range after the first query, so repeats are instant',
          explanation:
            'An index is not a result cache. Its benefit comes from sorted structure, not remembered answers.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-database-indexing-q5',
      objective: 'sd-database-indexing-2',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        "An `orders` table has an index on `status`, and most rows have `status = 'delivered'`. `EXPLAIN` for `WHERE status = 'delivered'` shows a `Seq Scan`. What is the most likely reason?",
      options: [
        {
          id: 'a',
          text: 'The planner estimated a full scan is cheaper than fetching most rows via the index',
          explanation:
            'Correct. When a condition matches a large share of rows, visiting the index and then the table for each one costs more than reading the table straight through.',
        },
        {
          id: 'b',
          text: 'The index is corrupted and must be dropped and rebuilt',
          explanation:
            'Corruption is not the usual explanation. This is normal cost-based planning.',
        },
        {
          id: 'c',
          text: 'PostgreSQL never uses B-tree indexes on text columns',
          explanation:
            'B-tree indexes work on text columns. The type is not the reason.',
        },
        {
          id: 'd',
          text: 'Plain `EXPLAIN` always shows a sequential scan whatever the plan',
          explanation:
            '`EXPLAIN` shows the plan the planner actually chose, including index scans when it picks one.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-database-indexing-q6',
      objective: 'sd-database-indexing-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'Every account page runs `SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 20`. Which single index serves it best?',
      options: [
        {
          id: 'a',
          text: 'A composite index on `(created_at, customer_id)`',
          explanation:
            "The leading column has no equality condition here, so the database cannot jump straight to one customer's entries.",
        },
        {
          id: 'b',
          text: 'A single-column index on `created_at`',
          explanation:
            "This gives date order but still mixes all customers, so the database must skip past other customers' orders.",
        },
        {
          id: 'c',
          text: 'A single-column index on the `total` column',
          explanation:
            'The query neither filters nor sorts by `total`, so this index does not help it.',
        },
        {
          id: 'd',
          text: 'A composite index on `(customer_id, created_at)`',
          explanation:
            'Correct. Equality on the leading column jumps to one customer, and their entries are already ordered by date, so the newest 20 can be read directly.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-database-indexing-q7',
      objective: 'sd-database-indexing-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'A MySQL table has a composite index on `(last_name, first_name)`. Under the leftmost-prefix rule, which query can use it to look up rows?',
      options: [
        {
          id: 'a',
          text: "`WHERE first_name = 'John'`",
          explanation:
            '`first_name` alone is not a leftmost prefix of the index, so MySQL cannot use it for this lookup.',
        },
        {
          id: 'b',
          text: "`WHERE last_name = 'Jones'`",
          explanation:
            'Correct. `last_name` is the leftmost column, so the index can find all rows for that last name.',
        },
        {
          id: 'c',
          text: "`WHERE last_name = 'Jones' OR first_name = 'John'`",
          explanation:
            "The `OR` branch on `first_name` alone can match rows anywhere in the index, so MySQL's docs list this as not using the index for lookups.",
        },
        {
          id: 'd',
          text: "`WHERE first_name LIKE 'J%'`",
          explanation:
            'This still constrains only `first_name`, which is not a leftmost prefix of the index.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-database-indexing-q8',
      objective: 'sd-database-indexing-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'You added an index to speed up a `DELETE ... WHERE` statement. You want to see whether the index is used and the real timing, without actually deleting anything. What should you run in PostgreSQL?',
      options: [
        {
          id: 'a',
          text: '`EXPLAIN ANALYZE` on its own, since it never changes data',
          explanation:
            '`EXPLAIN ANALYZE` really runs the statement, so on its own it would delete the rows.',
        },
        {
          id: 'b',
          text: 'Plain `EXPLAIN`, which reports the real run time of each step',
          explanation:
            'Plain `EXPLAIN` shows the chosen plan with estimated costs only; it does not run the query or measure time.',
        },
        {
          id: 'c',
          text: '`EXPLAIN ANALYZE` inside `BEGIN` and then `ROLLBACK`',
          explanation:
            'Correct. You get the real plan and timings, and the rollback undoes the delete.',
        },
        {
          id: 'd',
          text: 'Nothing: if `CREATE INDEX` succeeded, the index is used',
          explanation:
            'A successful build only means the index exists. The planner decides per query whether to use it.',
        },
      ],
      answer: 'c',
    },
  ],
  scenario: {
    prompt:
      "A small SaaS app on PostgreSQL has these tables and queries:\n\n- `users(id PRIMARY KEY, email UNIQUE, name, created_at)`. Login runs `WHERE email = $1`. An admin screen runs `WHERE lower(name) = $1`.\n- `events(id, account_id, type, payload, created_at)`, which receives a row for every click (by far the most-written table). The only read is a dashboard: `WHERE account_id = $1 AND created_at >= $2 ORDER BY created_at`.\n- `invoices(id, account_id, status, due_date)`. A nightly job runs `WHERE status = 'overdue'`, and only a small share of invoices are ever overdue.\n\nA teammate proposes adding an index on every column of every table. Decide which indexes you would add, which you would not, and how you would check your choices.",
    modelAnswer:
      "Work from the queries, not the columns.\n\n**users.** Login on `email` needs nothing new: the `UNIQUE` constraint already created a unique index, and adding another would duplicate it. The admin query uses `lower(name)`, which a plain index on `name` cannot serve, so add an expression index on `lower(name)` if that screen is slow enough to matter. `id` is the primary key and is indexed already.\n\n**events.** This is the write-heavy table, so every index slows each click insert. Add exactly one composite index on `(account_id, created_at)`: equality on the leading column jumps to one account, and the range and sort on `created_at` read entries in order. Skip indexes on `type` and `payload`, which nothing queries.\n\n**invoices.** `status = 'overdue'` matches a small share of rows, so an index on `status` can help the nightly job. Because the job runs once a night, it is also reasonable to skip the index if the job is already fast enough. A partial index (`WHERE status = 'overdue'`) is another option that keeps the index small.\n\n**Checking.** Run `EXPLAIN ANALYZE` on each query against production-sized data (or a copy) to see whether the planner uses the index and how long it takes, wrapping any data-changing statement in `BEGIN`/`ROLLBACK`. Later, check index usage and drop indexes nothing uses.\n\n**Why not index everything:** it slows every write, especially on `events`, costs storage, and many of those indexes would never be chosen by the planner. Other answers can be valid, for example skipping the `invoices` index altogether, as long as the reasoning ties each decision to a query and its cost.",
    checklist: [
      'Ties each index to a specific query instead of indexing columns by default',
      'Notices that primary keys and unique constraints are already indexed',
      'Orders composite index columns with equality first, then the range or sort column',
      'Weighs extra index cost on the write-heavy events table',
      'Handles the `lower(name)` query with an expression index or explains why not',
      'Verifies choices with EXPLAIN ANALYZE on realistic data',
    ],
  },
  takeaways: [
    'An index is a separate sorted structure that lets the database find matching rows without a sequential scan of the whole table.',
    'B-tree, the default index type, serves equality, ranges and sorted reads; hash indexes serve only equality.',
    'In a composite index, column order matters: put equality columns first, then the range or sort column.',
    'Every index adds work to inserts, updates and deletes and takes storage, so remove indexes nothing uses.',
    'The planner may correctly skip an index when a condition matches many rows; use EXPLAIN and EXPLAIN ANALYZE on realistic data to check.',
  ],
  references: [
    {
      title: 'Indexes: Introduction',
      publisher: 'PostgreSQL Global Development Group',
      url: 'https://www.postgresql.org/docs/current/indexes-intro.html',
      kind: 'source',
    },
    {
      title: 'Index Types',
      publisher: 'PostgreSQL Global Development Group',
      url: 'https://www.postgresql.org/docs/current/indexes-types.html',
      kind: 'source',
    },
    {
      title: 'Multicolumn Indexes',
      publisher: 'PostgreSQL Global Development Group',
      url: 'https://www.postgresql.org/docs/current/indexes-multicolumn.html',
      kind: 'source',
    },
    {
      title: 'Unique Indexes',
      publisher: 'PostgreSQL Global Development Group',
      url: 'https://www.postgresql.org/docs/current/indexes-unique.html',
      kind: 'source',
    },
    {
      title: 'Indexes on Expressions',
      publisher: 'PostgreSQL Global Development Group',
      url: 'https://www.postgresql.org/docs/current/indexes-expressional.html',
      kind: 'source',
    },
    {
      title: 'Partial Indexes',
      publisher: 'PostgreSQL Global Development Group',
      url: 'https://www.postgresql.org/docs/current/indexes-partial.html',
      kind: 'source',
    },
    {
      title: 'Index-Only Scans and Covering Indexes',
      publisher: 'PostgreSQL Global Development Group',
      url: 'https://www.postgresql.org/docs/current/indexes-index-only-scans.html',
      kind: 'source',
    },
    {
      title: 'Examining Index Usage',
      publisher: 'PostgreSQL Global Development Group',
      url: 'https://www.postgresql.org/docs/current/indexes-examine.html',
      kind: 'source',
    },
    {
      title: 'Using EXPLAIN',
      publisher: 'PostgreSQL Global Development Group',
      url: 'https://www.postgresql.org/docs/current/using-explain.html',
      kind: 'source',
    },
    {
      title: 'Multiple-Column Indexes',
      publisher: 'Oracle (MySQL Reference Manual)',
      url: 'https://dev.mysql.com/doc/refman/8.4/en/multiple-column-indexes.html',
      kind: 'source',
    },
  ],
  reviewedAt: '2026-11-02',
}
