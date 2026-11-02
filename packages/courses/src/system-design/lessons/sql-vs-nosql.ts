import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'sql-vs-nosql',
  title: 'SQL vs NoSQL',
  summary:
    'Relational, document, key-value and graph stores organise data differently and promise different things. Choose by your access patterns and the guarantees you need, not by the label.',
  minutes: 15,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-sql-vs-nosql-1',
      text: 'describe how relational, document, key-value and graph databases store data and the relationships between records.',
    },
    {
      id: 'sd-sql-vs-nosql-2',
      text: 'compare what a relational database and a document or key-value store guarantee about schemas, transactions and query flexibility.',
    },
    {
      id: 'sd-sql-vs-nosql-3',
      text: 'choose a data store for a workload by starting from its access patterns and consistency needs, and justify the trade-off.',
    },
  ],
  concept: [
    {
      heading: 'Why the choice matters',
      blocks: [
        {
          type: 'text',
          md: 'Every app you have built stores data somewhere, and the shape of that store quietly decides a lot: which queries are easy, which are slow, what happens when two updates must succeed together, and how painful it is to add a field next month.\n\n"SQL vs NoSQL" sounds like a two-way choice, but it is a poor label. **SQL** usually means a **relational database** such as PostgreSQL or MySQL. **NoSQL** is not one thing: it is an umbrella over several different data models (document, key-value, graph, wide-column and more), each built for different access patterns. The lines also blur: PostgreSQL can store and index JSON documents, and MongoDB supports multi-document transactions.\n\nSo the useful question is not "SQL or NoSQL?" but **"How will this data be read and written, and which guarantees does it need?"** This lesson gives you the vocabulary to answer that.',
        },
      ],
    },
    {
      heading: 'The data models, precisely',
      blocks: [
        {
          type: 'text',
          md: '**Relational.** Data lives in **tables** of rows and columns with a declared **schema**. Each kind of thing gets its own table, and records point at each other through keys. A **foreign key** makes the database itself reject a row that references something that does not exist, which keeps **referential integrity** without extra application code. Splitting data into separate tables so each fact is stored once is called **normalization**; you put it back together at read time with **joins**. Because the data is not shaped around any single query, SQL lets you ask new, ad hoc questions later.\n\nRelational databases also offer **transactions**: a group of statements that is **atomic**, meaning it either happens completely or not at all. Other sessions cannot see a transaction\'s changes until it commits, and once a commit is reported the changes have been written to durable storage.\n\n**Document.** Data lives in **documents**, JSON-like objects that can nest arrays and sub-objects. Documents in the same collection do not have to share the same fields, so the schema is flexible (MongoDB can still enforce a structure with schema validation if you ask it to). Related data can be **embedded** in one document or **referenced** by id. MongoDB\'s guidance is that data accessed together should be stored together. A write to a single document is atomic; when you need atomicity across several documents, MongoDB supports multi-document transactions, though its docs note they generally cost more than single-document writes and are not a substitute for good schema design.\n\n**Key-value.** The simplest model: store a value under a unique key, then get or put it by that key. Lookups by key are the whole point; asking "which values have field X?" is usually not something the store is built for.\n\n**Graph.** Entities are **nodes** and relationships are **edges**, which suits data where the relationships themselves are what you query, such as "friends of friends".',
        },
        {
          type: 'example',
          title: 'One order, two shapes',
          md: 'An online shop stores an order for two items.\n\n**Relational:** a row in `orders` (id, customer_id, created_at), two rows in `order_items` (order_id, product_id, quantity), and a row in `customers`. A foreign key from `orders.customer_id` to `customers.id` stops an order pointing at a missing customer. To show the order page you join the three tables.\n\n**Document:** one `orders` document holding the customer\'s name and an embedded `items` array. The order page reads one document, with no join. The trade-off: if a customer renames themselves, older order documents still carry the old name unless you update them too, and a question like "total quantity sold per product across all orders" means scanning inside every order document.\n\nNeither is wrong. The relational shape is better for asking many different questions of the data; the document shape is better when you almost always read an order as one unit.',
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Schema',
              definition:
                'The structure records are expected to have. Relational databases enforce it on write; document stores let documents in one collection differ unless you add validation.',
            },
            {
              term: 'Foreign key',
              definition:
                'A column whose values must match a key in another table; the database rejects writes that would break the link.',
            },
            {
              term: 'Normalization',
              definition:
                'Storing each fact once, in its own table, and joining tables at read time.',
            },
            {
              term: 'Denormalization / embedding',
              definition:
                'Storing related data together, even if it is duplicated, so a common read needs one lookup instead of a join.',
            },
            {
              term: 'Transaction',
              definition:
                'A group of operations that commits all together or not at all, with uncommitted changes hidden from other sessions.',
            },
            {
              term: 'Access pattern',
              definition:
                'A specific way the application reads or writes data, such as "get a cart by its id" or "list a user\'s last 20 orders".',
            },
          ],
        },
      ],
    },
    {
      heading: 'One app, several stores',
      blocks: [
        {
          type: 'text',
          md: 'Many production systems use more than one store, each picked for the access pattern it serves. The diagram shows a common layout: transactional data in a relational database, a product catalog in a document store because products of different types have different fields, and sessions in a key-value store because they are only ever fetched by session id.',
        },
        {
          type: 'diagram',
          caption:
            'An API server using three stores, each chosen for one access pattern.',
          nodes: [
            {
              id: 'client',
              label: 'Web client',
              kind: 'client',
              col: 0,
              row: 2,
            },
            { id: 'api', label: 'API server', kind: 'service', col: 1, row: 2 },
            {
              id: 'orders',
              label: 'Orders DB (relational)',
              kind: 'store',
              col: 3,
              row: 1,
            },
            {
              id: 'catalog',
              label: 'Catalog (document DB)',
              kind: 'store',
              col: 3,
              row: 2,
            },
            {
              id: 'sessions',
              label: 'Sessions (key-value)',
              kind: 'store',
              col: 3,
              row: 3,
            },
          ],
          edges: [
            { from: 'client', to: 'api', label: 'HTTPS' },
            { from: 'api', to: 'orders', label: 'transactions, joins' },
            { from: 'api', to: 'catalog', label: 'read product doc' },
            { from: 'api', to: 'sessions', label: 'get by session id' },
          ],
        },
        {
          type: 'note',
          md: 'Every extra store is another system to run, back up and monitor, and writes that span two stores are not covered by one transaction. Start with one database and add another only when an access pattern clearly needs it.',
        },
      ],
    },
    {
      heading: 'Choosing from access patterns',
      blocks: [
        {
          type: 'text',
          md: 'The two families are designed in opposite directions. AWS\'s DynamoDB guide puts it plainly: with a relational database you can build a normalized model without knowing every query up front and extend it as new questions arise; with a NoSQL store like DynamoDB you should not start designing until you know the questions it must answer, because data is shaped so the important queries are fast, and queries outside those patterns can be expensive and slow.\n\nThat gives a practical checklist:\n\n- **List the access patterns.** Which reads and writes happen on every request? By which key?\n- **Find what must change together.** If two updates must never happen one without the other, you need a transaction or both pieces in one record.\n- **Ask how often new questions appear.** Reporting and admin screens that change every week favour a model that supports ad hoc queries and joins.\n- **Check the shape.** Records whose fields vary a lot by type, and that are read as one unit, fit documents well.\n\nScaling is a later concern and is covered in Level 2. Relational databases are often scaled by bigger machines and read replicas, while many NoSQL stores are built to spread data across many machines, but "NoSQL scales, SQL doesn\'t" is too simple to base a decision on.',
        },
      ],
    },
  ],
  application: {
    heading: 'How real products split their data',
    blocks: [
      {
        type: 'text',
        md: "A typical web product keeps money, inventory and user accounts in a relational database because those records are tightly related and must stay consistent: an order must not reference a missing customer, and a payment and its order status must change together. PostgreSQL's `jsonb` type lets the same database hold flexible attributes and index them, which often delays the need for a separate document store.\n\nTeams then add specialised stores for specific patterns: a key-value store for sessions or feature flags read by id on every request, a document store for content whose structure varies, a search engine for full-text search.\n\nLimits to keep in mind:\n\n- **No transaction spans two stores.** If an order is written to PostgreSQL and its summary to a document store, one write can succeed while the other fails. You need retries or reconciliation.\n- **Duplicated data drifts.** Embedding a customer's name in every order is fast to read, but updating it means updating many documents.\n- **A store shaped for today's queries resists tomorrow's.** New questions against a key-value or access-pattern-driven model may need a new index or a data migration.",
      },
    ],
  },
  misconceptions: [
    {
      claim: 'NoSQL databases have no schema, so you never need to design one.',
      correction:
        'The schema moves from the database into your application code: your code still expects certain fields. Document stores make the schema flexible, and MongoDB can enforce one with schema validation. NoSQL design usually needs more up-front thought about access patterns, not less.',
    },
    {
      claim: 'NoSQL databases cannot do transactions.',
      correction:
        'It depends on the store. In MongoDB a single-document write is atomic, and multi-document ACID transactions are supported, though they cost more than single-document writes. Check the specific database rather than the label.',
    },
    {
      claim: 'Switching to NoSQL makes an app faster and more scalable.',
      correction:
        'A NoSQL store is fast for the access patterns its data was shaped for. Queries outside those patterns can be slow or impossible without reshaping data, and relational databases scale reads with replicas. Speed comes from matching the model to the workload.',
    },
  ],
  questions: [
    {
      id: 'sd-sql-vs-nosql-q1',
      objective: 'sd-sql-vs-nosql-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'In a relational database, what makes the database itself reject an order row whose `customer_id` does not match any customer?',
      options: [
        {
          id: 'a',
          text: 'A secondary index on the `orders.customer_id` column',
          explanation:
            'An index speeds up lookups on the column but does not check that the value exists in another table.',
        },
        {
          id: 'b',
          text: 'A foreign key constraint referencing `customers`',
          explanation:
            'Correct. A foreign key makes the database refuse inserts or updates that would reference a missing customer, maintaining referential integrity.',
        },
        {
          id: 'c',
          text: 'A JOIN between orders and customers in each query',
          explanation:
            'A join combines rows at read time. It does not stop a bad row from being written in the first place.',
        },
        {
          id: 'd',
          text: 'A time-to-live setting on the orders table',
          explanation:
            'A TTL expires data after some time; it has nothing to do with checking references between tables.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-sql-vs-nosql-q2',
      objective: 'sd-sql-vs-nosql-2',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        "According to MongoDB's documentation, which operation is atomic without starting a multi-document transaction?",
      options: [
        {
          id: 'a',
          text: 'Any group of writes made to the same collection',
          explanation:
            'Writes to several documents are not atomic as a group just because they share a collection; that needs a transaction.',
        },
        {
          id: 'b',
          text: 'All writes sent over one client connection',
          explanation:
            'Sharing a connection does not group writes into one atomic unit.',
        },
        {
          id: 'c',
          text: 'Writes that arrive within the same second',
          explanation:
            'Timing does not create atomicity. Two writes a millisecond apart can still have one succeed and the other fail.',
        },
        {
          id: 'd',
          text: 'A single write operation on one document',
          explanation:
            'Correct. MongoDB states that an operation on a single document is atomic, which is why embedding related data reduces the need for transactions.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-sql-vs-nosql-q3',
      objective: 'sd-sql-vs-nosql-1',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'A store sells shirts (size, colour), laptops (CPU, RAM, screen) and books (ISBN, author). Each product page reads one product with all of its attributes. Which data model fits this most naturally?',
      options: [
        {
          id: 'a',
          text: 'Documents, one per product, each with only the fields its type needs',
          explanation:
            "Correct. Documents in one collection can have different fields, and the page reads one product as a unit, which is the document model's strength.",
        },
        {
          id: 'b',
          text: 'Key-value pairs, with each attribute of each product under its own key',
          explanation:
            'This turns one page view into many separate lookups and gives the store no idea which keys belong to one product.',
        },
        {
          id: 'c',
          text: 'A graph, with each attribute value stored as a node linked to its product',
          explanation:
            'A graph suits data where relationships are the main thing queried. Attribute lookups for one product gain nothing from it.',
        },
        {
          id: 'd',
          text: 'One relational table with a nullable column for every attribute of every type',
          explanation:
            'This works but most columns are empty for any row, and every new product type needs a schema change. It is the least natural fit here.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-sql-vs-nosql-q4',
      objective: 'sd-sql-vs-nosql-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        "Per AWS's DynamoDB design guidance, how does designing a schema for a NoSQL store like DynamoDB differ from designing a relational one?",
      options: [
        {
          id: 'a',
          text: 'NoSQL needs no schema design at all, because it accepts any data',
          explanation:
            'The guidance says the opposite: NoSQL design needs the access patterns known before you start.',
        },
        {
          id: 'b',
          text: 'Relational needs every query known up front; NoSQL supports any query later',
          explanation:
            'This reverses the two. Relational models can be normalized first and queried flexibly later.',
        },
        {
          id: 'c',
          text: 'NoSQL starts from the known queries; relational can be normalized first',
          explanation:
            'Correct. In DynamoDB you shape data for the most important queries, while a relational model can be designed without knowing every question in advance.',
        },
        {
          id: 'd',
          text: 'Both are designed the same way and differ only in their query language',
          explanation:
            'The design approach differs fundamentally: access-pattern-first versus normalize-first.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-sql-vs-nosql-q5',
      objective: 'sd-sql-vs-nosql-2',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'A transfer must subtract 100 from account A and add 100 to account B, and must never apply only one of the two. Which statement is accurate?',
      options: [
        {
          id: 'a',
          text: 'Only relational databases can do this; document stores cannot',
          explanation:
            'MongoDB can do this too, either by keeping both balances in one document or with a multi-document transaction.',
        },
        {
          id: 'b',
          text: 'Any database does this automatically if both updates are sent back to back',
          explanation:
            'Sending updates one after another does not make them atomic. A crash between them leaves only one applied.',
        },
        {
          id: 'c',
          text: 'Wrap both in a transaction, or in MongoDB keep both in one document',
          explanation:
            'Correct. A relational transaction is all-or-nothing, and in MongoDB a single-document write is atomic, with multi-document transactions available when the data lives in separate documents.',
        },
        {
          id: 'd',
          text: 'Keep both balances in a cache so they are always updated together',
          explanation:
            'A cache holds copies of data and gives no atomicity across two keys by default. It does not solve the problem.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-sql-vs-nosql-q6',
      objective: 'sd-sql-vs-nosql-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'Login sessions are read and updated on every request by session id, are never queried by any other field, and expire after inactivity. Which store fits this access pattern best?',
      options: [
        {
          id: 'a',
          text: 'A key-value store keyed by session id',
          explanation:
            'Correct. The only access pattern is get and put by one key, which is exactly what a key-value store is built for.',
        },
        {
          id: 'b',
          text: 'A graph database linking sessions to users',
          explanation:
            'Nothing here queries relationships between sessions, so a graph model adds complexity without benefit.',
        },
        {
          id: 'c',
          text: 'A relational table joined to users on every request',
          explanation:
            'A table would work, but a join on every request does work the access pattern never needs. It is not the best fit.',
        },
        {
          id: 'd',
          text: 'A document store using multi-document transactions',
          explanation:
            'Each session is one record updated on its own, so multi-document transactions add cost for no gain.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-sql-vs-nosql-q7',
      objective: 'sd-sql-vs-nosql-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'A team stores orders in a store whose data was shaped for two queries: "get order by id" and "list a customer\'s orders". Product managers now want new reports every week that filter and group orders by many different fields and combine them with product data. What is the main risk?',
      options: [
        {
          id: 'a',
          text: 'The store cannot hold numeric fields such as prices and quantities',
          explanation:
            'Document and key-value stores hold numbers fine. Data types are not the issue.',
        },
        {
          id: 'b',
          text: 'The store will start rejecting writes once new reports are added',
          explanation:
            'Running new queries does not stop writes. The problem is how those queries perform.',
        },
        {
          id: 'c',
          text: 'Orders become immutable and cannot be updated after they are stored',
          explanation:
            'These stores allow updates. Mutability is not related to the reporting problem.',
        },
        {
          id: 'd',
          text: 'Queries outside the designed patterns may be slow or need data reshaping',
          explanation:
            'Correct. A model shaped for specific access patterns is efficient for them, but frequent ad hoc questions favour a model built for flexible queries, such as a relational database.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-sql-vs-nosql-q8',
      objective: 'sd-sql-vs-nosql-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'You are picking a store for a new feature. Which question should drive the decision first?',
      options: [
        {
          id: 'a',
          text: 'Which database is the most popular with developers this year?',
          explanation:
            "Popularity says nothing about whether the store fits this feature's reads, writes and guarantees.",
        },
        {
          id: 'b',
          text: 'What are the main reads and writes, and which must happen together?',
          explanation:
            'Correct. Access patterns and atomicity needs decide which model fits; both the MongoDB and DynamoDB guidance start from how the application accesses data.',
        },
        {
          id: 'c',
          text: 'Which database posted the fastest result in a published benchmark?',
          explanation:
            "A benchmark measures someone else's workload. It does not tell you how the store handles yours.",
        },
        {
          id: 'd',
          text: 'Does the database use SQL syntax that the team already knows?',
          explanation:
            'Familiarity matters, but it comes after confirming the data model and guarantees fit the workload.',
        },
      ],
      answer: 'b',
    },
  ],
  scenario: {
    prompt:
      'You are building a recipe-sharing app. Users publish recipes (title, a list of ingredients with amounts, numbered steps, tags). Others can comment on a recipe and save recipes to their own collections. The main screens are: a recipe page (the recipe plus its latest comments), a user profile (their recipes and collections), and a search "recipes that use ingredient X". Login sessions are checked on every request.\n\nChoose the data store or stores you would use and how you would model recipes, comments and sessions. Justify each choice from the access patterns, and name one thing your design makes harder.',
    modelAnswer:
      "Start from the access patterns: (1) read one recipe with its ingredients and steps, (2) read the latest comments for a recipe, (3) list a user's recipes and collections, (4) find recipes by ingredient, (5) check a session by id on every request.\n\n**Main store: a relational database such as PostgreSQL.** Users, recipes, comments and collections are related to each other, and foreign keys keep a comment from pointing at a deleted recipe. Patterns 2 and 3 are simple indexed queries. Pattern 4 works well with a `recipe_ingredients` table (recipe_id, ingredient, amount) indexed on ingredient. Steps are always read in full with the recipe and never queried alone, so they can sit in a `jsonb` column or an ordered child table; either is defensible.\n\n**Sessions: a key-value store** (or a sessions table to start with). The only access is get by session id, so a key-value store fits; at small scale, keeping them in PostgreSQL avoids running a second system.\n\n**What this makes harder:** reading a recipe page needs a few queries or joins rather than one document read, and adding a second store for sessions means two systems to operate.\n\n**Other valid answers:** a document store with one document per recipe (ingredients and steps embedded) is reasonable, because recipes are read as a unit and vary in shape. That design should keep comments in their own collection, since they grow without bound, and needs an index on ingredient names for search. What matters is that the choice is justified by these access patterns.",
    checklist: [
      'Lists the access patterns before naming a database',
      'Explains how related records (users, recipes, comments) are linked and kept consistent',
      'Handles "search by ingredient" with a concrete structure or index',
      'Picks a store for sessions based on their get-by-id access pattern',
      'Names at least one cost or limitation of the chosen design',
    ],
  },
  takeaways: [
    '"NoSQL" covers several data models (document, key-value, graph, wide-column), not a single alternative to relational databases.',
    'Relational databases normalize data into tables, enforce schemas and foreign keys, and support ad hoc queries and transactions.',
    'Document stores keep data that is read together in one document, and a single-document write is atomic.',
    'NoSQL designs start from known access patterns; queries outside those patterns can be slow or need reshaping.',
    'Choose a store by listing reads, writes and what must change together, and add extra stores only when a pattern clearly needs one.',
  ],
  references: [
    {
      title: 'Transactions (PostgreSQL tutorial)',
      publisher: 'PostgreSQL Global Development Group',
      url: 'https://www.postgresql.org/docs/current/tutorial-transactions.html',
      kind: 'source',
    },
    {
      title: 'Foreign Keys (PostgreSQL tutorial)',
      publisher: 'PostgreSQL Global Development Group',
      url: 'https://www.postgresql.org/docs/current/tutorial-fk.html',
      kind: 'source',
    },
    {
      title: 'JSON Types',
      publisher: 'PostgreSQL Global Development Group',
      url: 'https://www.postgresql.org/docs/current/datatype-json.html',
      kind: 'source',
    },
    {
      title: 'Data Modeling',
      publisher: 'MongoDB',
      url: 'https://www.mongodb.com/docs/manual/data-modeling/',
      kind: 'source',
    },
    {
      title: 'Transactions',
      publisher: 'MongoDB',
      url: 'https://www.mongodb.com/docs/manual/core/transactions/',
      kind: 'source',
    },
    {
      title: 'NoSQL design for DynamoDB',
      publisher: 'Amazon Web Services',
      url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-general-nosql-design.html',
      kind: 'source',
    },
    {
      title: 'What is NoSQL?',
      publisher: 'Amazon Web Services',
      url: 'https://aws.amazon.com/nosql/',
      kind: 'source',
    },
    {
      title: 'Designing Data-Intensive Applications',
      publisher: 'Martin Kleppmann, O’Reilly',
      url: 'https://dataintensive.net/',
      kind: 'further',
    },
  ],
  reviewedAt: '2026-11-02',
}
