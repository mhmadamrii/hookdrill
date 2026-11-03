import type { Submodule } from '../../types'

/** Paragraphs and code blocks of one markdown field, separated by blank lines. */
const md = (...parts: string[]) => parts.join('\n\n')
/** A fenced Python code block. */
const py = (...lines: string[]) => ['```python', ...lines, '```'].join('\n')

export const pythonForData: Submodule = {
  slug: 'python-for-data',
  title: 'Python for data work',
  summary:
    'The parts of Python that data code leans on every day: the built-in containers, functions and loops, generators for data too big for memory, and loading tables from CSV and JSON into pandas.',
  lessons: [
    // ------------------------------------------------------------------
    // Lesson 1
    // ------------------------------------------------------------------
    {
      slug: 'python-data-structures',
      title: 'Lists, dicts and comprehensions for data',
      summary:
        'Python has four everyday containers: lists, tuples, dicts and sets. Each fits a different job. Comprehensions build them in one line, and knowing which objects are mutable saves you from bugs where two names share one object.',
      minutes: 13,
      label: 'foundational',
      objectives: [
        {
          id: 'm02-python-data-structures-1',
          text: 'choose between a list, tuple, dict and set for a data task, based on order, mutability, lookup by key and uniqueness.',
        },
        {
          id: 'm02-python-data-structures-2',
          text: 'read and write list, set and dict comprehensions, including ones with a filter condition.',
        },
        {
          id: 'm02-python-data-structures-3',
          text: 'predict when two names refer to the same mutable object, and avoid the bugs that sharing causes.',
        },
      ],
      concept: [
        {
          heading: 'Four containers, four jobs',
          blocks: [
            {
              type: 'text',
              md: md(
                'If you come from JavaScript, Java or Go, you already know most of these ideas under other names. Python builds four of them into the language:',
                '- A **list** is an ordered, growable sequence, like a JavaScript array. Use it for rows you will append to, sort or walk through in order.\n- A **tuple** is an ordered sequence you cannot change after creating it. Use it for a fixed group of values that belong together, such as an `(x, y)` point or a `(name, size)` pair.\n- A **dict** maps keys to values, like a JavaScript object or a hash map. Use it to look things up by name: a label to its id, a column name to its values.\n- A **set** holds unique items with no order and no positions. Use it to remove duplicates or to ask "have I seen this before?"',
                py(
                  'scores = [0.91, 0.78, 0.85]          # list',
                  'point = (3, 4)                       # tuple',
                  'label_to_id = {"cat": 0, "dog": 1}   # dict',
                  'seen = {"cat", "dog", "cat"}         # set',
                  'print(len(seen))  # 2',
                  'print(label_to_id["dog"])  # 1',
                ),
                'Dict keys and set items must be **hashable**: strings, numbers and tuples of those work; lists and dicts do not, because they can change. A dict keeps keys in the order you inserted them. A set has no order you can rely on, so sort it if you need a stable order.',
                'Two facts drive most choices. Checking `x in some_set` or `key in some_dict` uses a hash lookup, so on average it takes about the same time however big the collection gets. Checking `x in some_list` scans the list from the front, so it gets slower as the list grows.',
              ),
            },
            {
              type: 'terms',
              terms: [
                {
                  term: 'Mutable',
                  definition:
                    'Can be changed in place after it is created. Lists, dicts and sets are mutable; tuples, strings and numbers are not.',
                },
                {
                  term: 'Hashable',
                  definition:
                    'Has a hash value that never changes, so it can be a dict key or a set item. Immutable built-ins such as `str`, `int` and tuples of hashable items are hashable.',
                },
                {
                  term: 'Comprehension',
                  definition:
                    'An expression that builds a list, set or dict from an iterable, such as `[len(w) for w in words]`.',
                },
                {
                  term: 'Alias',
                  definition:
                    'A second name for the same object. Changing the object through one name is visible through the other.',
                },
                {
                  term: 'Shallow copy',
                  definition:
                    'A new outer container that holds the same inner objects as the original, made by `list.copy()`, `dict.copy()` or `list(x)`.',
                },
              ],
            },
          ],
        },
        {
          heading: 'Comprehensions: build a collection in one expression',
          blocks: [
            {
              type: 'text',
              md: md(
                'A comprehension reads like a sentence: *give me this expression, for each item in that collection, if this condition holds*. The brackets decide what you get back: `[...]` gives a list, `{...}` with one expression gives a set, and `{key: value ...}` gives a dict.',
                py(
                  'words = ["the", "cat", "sat", "on", "the", "mat"]',
                  '',
                  '[len(w) for w in words]          # [3, 3, 3, 2, 3, 3]',
                  "[w for w in words if len(w) > 2]  # ['the', 'cat', 'sat', 'the', 'mat']",
                  "sorted({w for w in words})       # ['cat', 'mat', 'on', 'sat', 'the']",
                  '{w: len(w) for w in ["on", "mat"]}  # {\'on\': 2, \'mat\': 3}',
                ),
                'The filter `if ...` goes at the end and drops items. That is different from a conditional expression `a if cond else b` at the front, which keeps every item but changes its value: `[w if len(w) > 2 else "?" for w in words]`.',
                'Comprehensions are the idiomatic way to transform and filter small and medium collections. When the logic needs several steps or error handling, a plain `for` loop is easier to read.',
              ),
            },
            {
              type: 'example',
              title: 'A tiny vocabulary for a text model',
              md: md(
                'Text models turn words into integer ids before doing any math. With the structures above, a first version takes three lines:',
                py(
                  'docs = ["the cat sat", "the dog sat"]',
                  'vocab = sorted({w for d in docs for w in d.split()})',
                  "print(vocab)  # ['cat', 'dog', 'sat', 'the']",
                  'word_to_id = {w: vocab.index(w) for w in vocab}',
                  "print(word_to_id)  # {'cat': 0, 'dog': 1, 'sat': 2, 'the': 3}",
                  'print([word_to_id[w] for w in "the cat sat".split()])  # [3, 0, 2]',
                ),
                'The **set** removes duplicate words, `sorted` gives a stable order, the **dict** gives fast lookup from word to id, and the final **list** keeps the word order of the sentence. The comprehension with two `for` clauses reads left to right, like nested loops. (`vocab.index(w)` scans the list, which is fine for four words; the next lesson shows `enumerate`, the usual way.)',
              ),
            },
          ],
        },
        {
          heading: 'Names point to objects: mutability and sharing',
          blocks: [
            {
              type: 'text',
              md: md(
                'In Python, `b = a` does not copy anything. It makes `b` a second name for the same object. With an immutable object such as a number or tuple that never matters. With a mutable list or dict, a change through one name shows up through the other.',
                py(
                  'a = [1, 2, 3]',
                  'b = a',
                  'b.append(4)',
                  'print(a)  # [1, 2, 3, 4]',
                ),
                'The same trap hides in list repetition. `[[0] * 3] * 2` does not build two rows; it builds one row and puts it in the outer list twice. The Python docs warn about exactly this: repeating a sequence references the same items several times, it does not copy them.',
                py(
                  'grid = [[0] * 3] * 2',
                  'grid[0][0] = 9',
                  'print(grid)  # [[9, 0, 0], [9, 0, 0]]',
                  '',
                  'grid = [[0] * 3 for _ in range(2)]  # a new row each time',
                  'grid[0][0] = 9',
                  'print(grid)  # [[9, 0, 0], [0, 0, 0]]',
                ),
                '`list.copy()` and `dict.copy()` make a **shallow** copy: a new outer container that still holds the same inner objects. If the items are themselves lists or dicts, use `copy.deepcopy` when you need fully independent data.',
                py(
                  'nested = [[1], [2]]',
                  'shallow = nested.copy()',
                  'shallow[0].append(99)',
                  'print(nested)  # [[1, 99], [2]]',
                ),
              ),
            },
            {
              type: 'note',
              md: 'A tuple cannot be changed, but a list inside a tuple still can: after `t = ([1, 2], 3)`, `t[0].append(5)` works and `t` becomes `([1, 2, 5], 3)`. Immutability applies to the tuple itself, not to the objects it holds. Such a tuple is not hashable either, so it cannot be a dict key.',
            },
          ],
        },
      ],
      application: {
        heading: 'Where these show up in ML code',
        blocks: [
          {
            type: 'text',
            md: md(
              'Most ML projects start with plain Python before any array library appears:',
              '- **Dicts** hold configuration (`{"lr": 3e-4, "epochs": 10}`), map labels to ids and back, and store a record per example when you read JSON.\n- **Sets** deduplicate examples, collect a vocabulary, and check that no test id leaks into the training split: `train_ids & test_ids` should be empty.\n- **Tuples** hold fixed shapes and pairs, such as `(height, width)` or `(features, label)`, and can be dict keys.\n- **Comprehensions** clean and filter records before you hand them to pandas or NumPy.',
              'Limits: lists of Python numbers are slow and memory-hungry for numeric work, because each number is a separate object. Once data is numeric and large, it belongs in a NumPy array or a pandas DataFrame, which the next lessons cover. And sharing bugs get worse in data code, because a shared row or a reused config dict can silently change results far from where the change happened.',
            ),
          },
        ],
      },
      misconceptions: [
        {
          claim: '`b = a` makes a copy of the list, so changing `b` is safe.',
          correction:
            'Assignment binds a second name to the same object. Use `a.copy()` or `list(a)` for a shallow copy, or `copy.deepcopy(a)` when the list holds other mutable objects.',
        },
        {
          claim:
            'Checking whether an item is in a list is as fast as checking a set.',
          correction:
            'A list check scans the items one by one, so it slows down as the list grows. A set or dict uses a hash lookup, which on average takes about the same time at any size.',
        },
        {
          claim: '`[[0] * 3] * 2` creates a 2×3 grid of independent zeros.',
          correction:
            'It creates one inner list and references it twice, so writing to one row changes both. Build each row separately with `[[0] * 3 for _ in range(2)]`.',
        },
      ],
      questions: [
        {
          id: 'm02-python-data-structures-q1',
          objective: 'm02-python-data-structures-1',
          kind: 'recall',
          difficulty: 'easy',
          prompt:
            'Which built-in type stores only unique items and has no index positions?',
          options: [
            {
              id: 'a',
              text: 'A list, such as `[1, 2, 3]`',
              explanation:
                'Lists keep duplicates and are indexed by position, so `[1, 1]` is a valid two-item list.',
            },
            {
              id: 'b',
              text: 'A set, such as `{1, 2, 3}`',
              explanation:
                'Correct. A set keeps each item once and has no positions, so `s[0]` is an error.',
            },
            {
              id: 'c',
              text: 'A tuple, such as `(1, 2, 3)`',
              explanation:
                'Tuples are ordered, indexed by position and can hold duplicates. They just cannot be changed.',
            },
            {
              id: 'd',
              text: 'A dict, such as `{"a": 1, "b": 2}`',
              explanation:
                'Dict keys are unique, but a dict stores key-value pairs and is looked up by key. The type for a plain collection of unique items is the set.',
            },
          ],
          answer: 'b',
        },
        {
          id: 'm02-python-data-structures-q2',
          objective: 'm02-python-data-structures-1',
          kind: 'recall',
          difficulty: 'easy',
          prompt:
            'Which of these built-in types is immutable, so its items cannot be replaced after it is created?',
          options: [
            {
              id: 'a',
              text: '`list`',
              explanation:
                'Lists are mutable: you can assign `x[0] = 5`, append and remove items.',
            },
            {
              id: 'b',
              text: '`dict`',
              explanation:
                'Dicts are mutable: you can add, change and delete keys in place.',
            },
            {
              id: 'c',
              text: '`tuple`',
              explanation:
                'Correct. `t[0] = 5` on a tuple raises `TypeError`, because tuples do not support item assignment.',
            },
            {
              id: 'd',
              text: '`set`',
              explanation:
                'Sets are mutable: `add` and `remove` change them in place. (`frozenset` is the immutable variant.)',
            },
          ],
          answer: 'c',
        },
        {
          id: 'm02-python-data-structures-q3',
          objective: 'm02-python-data-structures-2',
          kind: 'concept',
          difficulty: 'medium',
          prompt:
            'What does `[x * 2 for x in range(5) if x % 2 == 0]` evaluate to?',
          options: [
            {
              id: 'a',
              text: '`[0, 2, 4]`',
              explanation:
                'These are the items that pass the filter, but the comprehension then doubles each one.',
            },
            {
              id: 'b',
              text: '`[2, 6]`',
              explanation:
                'This doubles the odd numbers 1 and 3. The filter `x % 2 == 0` keeps the even ones.',
            },
            {
              id: 'c',
              text: '`[0, 2, 4, 6, 8]`',
              explanation:
                'This doubles every number from 0 to 4 and ignores the filter.',
            },
            {
              id: 'd',
              text: '`[0, 4, 8]`',
              explanation:
                'Correct. The filter keeps 0, 2 and 4, and the expression doubles each one.',
            },
          ],
          answer: 'd',
        },
        {
          id: 'm02-python-data-structures-q4',
          objective: 'm02-python-data-structures-3',
          kind: 'concept',
          difficulty: 'medium',
          prompt:
            'What does this print? `a = [1, 2]; b = a; b.append(3); print(a)`',
          options: [
            {
              id: 'a',
              text: '`[1, 2, 3]`',
              explanation:
                'Correct. `b = a` makes `b` another name for the same list, so the append is visible through `a`.',
            },
            {
              id: 'b',
              text: '`[1, 2]`',
              explanation:
                'This would be true if `b = a` copied the list. Assignment never copies; it binds a second name to the same object.',
            },
            {
              id: 'c',
              text: '`[1, 2, [3]]`',
              explanation:
                '`append(3)` adds the number 3 as one item. It does not wrap it in a list.',
            },
            {
              id: 'd',
              text: 'It raises an error because `a` and `b` share data',
              explanation:
                'Sharing an object between names is normal and allowed in Python. It is just easy to forget.',
            },
          ],
          answer: 'a',
        },
        {
          id: 'm02-python-data-structures-q5',
          objective: 'm02-python-data-structures-1',
          kind: 'application',
          difficulty: 'medium',
          prompt:
            'A job must check each of 10 million incoming user ids against 50,000 banned ids. Which structure should hold the banned ids?',
          options: [
            {
              id: 'a',
              text: 'A list, because it keeps the ids in the order they were banned',
              explanation:
                'Order does not matter for this check, and `id in some_list` scans the list, so each of the 10 million checks walks up to 50,000 items.',
            },
            {
              id: 'b',
              text: 'A tuple, because the banned ids will not change during the job',
              explanation:
                'Immutability does not speed up membership checks. A tuple is scanned item by item just like a list.',
            },
            {
              id: 'c',
              text: 'A set, because membership checks use a hash lookup',
              explanation:
                'Correct. `id in banned` on a set takes about the same time on average whatever its size, so 10 million checks stay fast.',
            },
            {
              id: 'd',
              text: 'A list sorted once, then checked with the `in` operator',
              explanation:
                'The `in` operator does not know the list is sorted. It still scans from the front.',
            },
          ],
          answer: 'c',
        },
        {
          id: 'm02-python-data-structures-q6',
          objective: 'm02-python-data-structures-3',
          kind: 'concept',
          difficulty: 'hard',
          prompt:
            'What does this print? `grid = [[0] * 2] * 3; grid[1][0] = 5; print(grid)`',
          options: [
            {
              id: 'a',
              text: '`[[0, 0], [5, 0], [0, 0]]`',
              explanation:
                'This is what you would get with three separate rows. `* 3` repeats a reference to one row instead of copying it.',
            },
            {
              id: 'b',
              text: '`[[5, 0], [5, 0], [5, 0]]`',
              explanation:
                'Correct. All three entries of `grid` are the same inner list, so changing it through `grid[1]` shows in every row.',
            },
            {
              id: 'c',
              text: '`[[0, 5], [0, 5], [0, 5]]`',
              explanation:
                '`grid[1][0]` sets the first item of a row, not the second. The sharing is right but the position is wrong.',
            },
            {
              id: 'd',
              text: 'It raises an error because the rows are shared',
              explanation:
                'Python allows writing to a shared list. The surprise is in the result, not an error.',
            },
          ],
          answer: 'b',
        },
        {
          id: 'm02-python-data-structures-q7',
          objective: 'm02-python-data-structures-2',
          kind: 'application',
          difficulty: 'medium',
          prompt:
            '`files` is a list of `(name, size)` tuples. Which expression builds a dict from file name to size for only the `.csv` files?',
          options: [
            {
              id: 'a',
              text: '`{name for name, size in files if name.endswith(".csv")}`',
              explanation:
                'With a single expression the braces build a set of names. The sizes are lost.',
            },
            {
              id: 'b',
              text: '`[(name, size) for name, size in files if name.endswith(".csv")]`',
              explanation:
                'This builds a list of pairs. It has the right data but you cannot look a size up by name.',
            },
            {
              id: 'c',
              text: '`{name: size if name.endswith(".csv") for name, size in files}`',
              explanation:
                'A condition before `for` must be a full `a if cond else b` expression, so this is a `SyntaxError`. Filters go at the end.',
            },
            {
              id: 'd',
              text: '`{name: size for name, size in files if name.endswith(".csv")}`',
              explanation:
                'Correct. `key: value` makes it a dict comprehension, the tuple unpacks into `name, size`, and the trailing `if` filters.',
            },
          ],
          answer: 'd',
        },
        {
          id: 'm02-python-data-structures-q8',
          objective: 'm02-python-data-structures-1',
          kind: 'application',
          difficulty: 'hard',
          prompt:
            'You want to cache a weather lookup by latitude and longitude, as in `cache[key] = result`. Which key works?',
          options: [
            {
              id: 'a',
              text: 'A list such as `[59.9, 10.7]`, since it holds both numbers in order',
              explanation:
                'Lists are mutable and therefore not hashable. Using one as a dict key raises `TypeError` (unhashable type).',
            },
            {
              id: 'b',
              text: 'A tuple such as `(59.9, 10.7)`, since it is immutable and hashable',
              explanation:
                'Correct. A tuple of numbers is hashable, so it works as a dict key, and it keeps latitude and longitude in order.',
            },
            {
              id: 'c',
              text: 'A set such as `{59.9, 10.7}`, since it holds both numbers once',
              explanation:
                'Sets are mutable and not hashable, so they cannot be keys. They also lose order, so latitude and longitude could not be told apart.',
            },
            {
              id: 'd',
              text: 'A dict such as `{"lat": 59.9, "lon": 10.7}`, since its fields are named',
              explanation:
                'Dicts are mutable and not hashable, so a dict cannot be a key of another dict.',
            },
          ],
          answer: 'b',
        },
      ],
      takeaways: [
        'List for ordered rows, tuple for fixed groups, dict for lookup by key, set for uniqueness and fast membership.',
        'Dict keys and set items must be hashable: tuples and strings work, lists and dicts do not.',
        'Comprehensions build lists, sets and dicts in one expression; the filter `if` goes at the end.',
        'Assignment never copies. Two names can share one mutable object, and `[[0] * n] * m` shares its rows.',
        '`.copy()` is shallow; use `copy.deepcopy` for nested data you need to change independently.',
      ],
      references: [
        {
          title: 'The Python Tutorial: Data Structures',
          publisher: 'Python Software Foundation',
          url: 'https://docs.python.org/3/tutorial/datastructures.html',
          kind: 'source',
        },
        {
          title: 'Built-in Types (sequence operations, sets, mappings)',
          publisher: 'Python Software Foundation',
          url: 'https://docs.python.org/3/library/stdtypes.html',
          kind: 'source',
        },
      ],
      reviewedAt: '2026-11-03',
    },

    // ------------------------------------------------------------------
    // Lesson 2
    // ------------------------------------------------------------------
    {
      slug: 'functions-and-iteration',
      title: 'Functions, iteration and generators',
      summary:
        'Functions with default and keyword arguments keep data code configurable, `enumerate` and `zip` replace index bookkeeping, and generators process data one item at a time so it never has to fit in memory.',
      minutes: 14,
      label: 'foundational',
      objectives: [
        {
          id: 'm02-functions-and-iteration-1',
          text: 'define and call functions with default values and keyword arguments, and avoid the mutable-default-argument pitfall.',
        },
        {
          id: 'm02-functions-and-iteration-2',
          text: 'loop with `for`, `enumerate` and `zip` instead of index arithmetic, and predict what `zip` does with inputs of different lengths.',
        },
        {
          id: 'm02-functions-and-iteration-3',
          text: 'use generator functions and generator expressions to process large data lazily, knowing that a generator can be consumed only once.',
        },
      ],
      concept: [
        {
          heading: 'Functions with defaults and keyword arguments',
          blocks: [
            {
              type: 'text',
              md: md(
                'Data code is full of functions with many settings, most of which you leave alone. Python handles this with **default values** and **keyword arguments**: give a parameter a default in the definition, and callers can skip it or set it by name.',
                py(
                  'def normalize(values, low=0.0, high=1.0):',
                  '    lo, hi = min(values), max(values)',
                  '    return [low + (v - lo) * (high - low) / (hi - lo) for v in values]',
                  '',
                  'print(normalize([10, 20, 30]))            # [0.0, 0.5, 1.0]',
                  'print(normalize([10, 20, 30], high=100))  # [0.0, 50.0, 100.0]',
                ),
                'Keyword arguments can come in any order, but they must follow the positional ones: `normalize(values, high=100)` is fine, `normalize(high=100, values)` is a `SyntaxError`. Library functions such as `pandas.read_csv` take dozens of keyword arguments, and some accept *only* keywords after the first parameter, so reading calls like `read_csv(path, usecols=["a"], nrows=100)` becomes routine.',
              ),
            },
            {
              type: 'text',
              md: md(
                'One rule surprises almost everyone once. **A default value is evaluated once, when the function is defined**, not on each call. If the default is a mutable object such as a list or dict, every call that relies on the default shares that one object.',
                py(
                  'def add_tag(tag, tags=[]):',
                  '    tags.append(tag)',
                  '    return tags',
                  '',
                  'print(add_tag("a"))  # [\'a\']',
                  "print(add_tag(\"b\"))  # ['a', 'b']  -- the same list again",
                ),
                'The standard fix is to default to `None` and create a fresh object inside the function:',
                py(
                  'def add_tag(tag, tags=None):',
                  '    if tags is None:',
                  '        tags = []',
                  '    tags.append(tag)',
                  '    return tags',
                ),
              ),
            },
          ],
        },
        {
          heading: 'Iterating without index bookkeeping',
          blocks: [
            {
              type: 'text',
              md: md(
                'A Python `for` loop walks over the items of any **iterable** directly: a list, a string, a dict (its keys), a file (its lines). You rarely need `range(len(x))`. Two built-ins cover the cases where you would reach for an index:',
                '- `enumerate(items, start=0)` gives `(index, item)` pairs.\n- `zip(a, b, ...)` walks several iterables side by side and gives tuples of matching items.',
                py(
                  'names = ["ada", "alan", "grace"]',
                  'scores = [0.9, 0.7, 0.8]',
                  '',
                  'for i, name in enumerate(names, start=1):',
                  '    print(i, name)       # 1 ada / 2 alan / 3 grace',
                  '',
                  'for name, score in zip(names, scores):',
                  '    print(f"{name}: {score}")  # ada: 0.9 / alan: 0.7 / grace: 0.8',
                  '',
                  'config = {"lr": 0.001, "epochs": 5}',
                  'for key, value in config.items():',
                  '    print(key, value)    # lr 0.001 / epochs 5',
                ),
                'By default `zip` **stops at the shortest input** and silently drops the rest. In data code that can hide a real bug, such as 1,000 features paired with 999 labels. Since Python 3.10, `zip(..., strict=True)` raises `ValueError` instead.',
                py(
                  'print(list(zip([1, 2, 3], ["a", "b"])))  # [(1, \'a\'), (2, \'b\')]',
                  'list(zip([1, 2, 3], ["a", "b"], strict=True))',
                  '# ValueError: zip() argument 2 is shorter than argument 1',
                ),
              ),
            },
            {
              type: 'terms',
              terms: [
                {
                  term: 'Iterable',
                  definition:
                    'Anything a `for` loop can walk over: lists, tuples, strings, dicts, sets, files, generators.',
                },
                {
                  term: 'Iterator',
                  definition:
                    'An object that produces items one at a time with `next()` and remembers where it is. Once it runs out, it stays empty.',
                },
                {
                  term: 'Generator function',
                  definition:
                    'A function containing `yield`. Calling it does not run the body; it returns a generator, an iterator that runs the body step by step as items are requested.',
                },
                {
                  term: 'Generator expression',
                  definition:
                    'A comprehension in parentheses, such as `(x * x for x in data)`, that produces items lazily instead of building a list.',
                },
                {
                  term: 'Keyword argument',
                  definition:
                    'An argument passed by parameter name, as in `f(x, high=100)`. Its position in the call does not matter.',
                },
              ],
            },
          ],
        },
        {
          heading: 'Generators: one item at a time',
          blocks: [
            {
              type: 'text',
              md: md(
                'A list comprehension builds every item before you can use the first one. For a 40 GB log file that will not fit in memory. A **generator** produces items on demand: when it reaches `yield`, it hands back a value and pauses, keeping its local variables, and it resumes from there when the next item is requested.',
                py(
                  'def read_batches(rows, size):',
                  '    batch = []',
                  '    for row in rows:',
                  '        batch.append(row)',
                  '        if len(batch) == size:',
                  '            yield batch',
                  '            batch = []',
                  '    if batch:',
                  '        yield batch',
                  '',
                  'print(list(read_batches(range(7), 3)))  # [[0, 1, 2], [3, 4, 5], [6]]',
                ),
                'A **generator expression** is the lazy twin of a list comprehension. Swap the brackets for parentheses, and functions like `sum`, `max` and `any` consume it without ever holding all the values:',
                py(
                  'with open("server.log") as f:',
                  '    errors = sum(1 for line in f if "ERROR" in line)',
                ),
                'The file object itself yields one line at a time, so memory use stays small however big the file is.',
                'The price of laziness: **a generator can be consumed only once.** After it is exhausted it yields nothing, without raising an error.',
                py(
                  'squares = (x * x for x in range(3))',
                  'print(list(squares))  # [0, 1, 4]',
                  'print(list(squares))  # []',
                ),
                'If you need the values twice, build a list, or call the generator function again to get a new generator.',
              ),
            },
            {
              type: 'example',
              title: 'Feeding a training loop in batches',
              md: md(
                'Training code rarely looks at a whole dataset at once; it takes a batch, updates the model, then takes the next. A generator fits this shape:',
                py(
                  'def batches(examples, size=32):',
                  '    for start in range(0, len(examples), size):',
                  '        yield examples[start:start + size]',
                  '',
                  'for batch in batches(list(range(100))):',
                  '    print(len(batch), end=" ")  # 32 32 32 4',
                ),
                'Real frameworks wrap this idea in their own classes (PyTorch has `DataLoader`, covered later in the course), but underneath they hand out batches one at a time, just like this.',
              ),
            },
          ],
        },
      ],
      application: {
        heading: 'Where this shows up in ML code',
        blocks: [
          {
            type: 'text',
            md: md(
              '- **Keyword arguments** are how you configure nearly every library call: `train_test_split(X, y, test_size=0.2, random_state=0)`, `pd.read_csv(path, usecols=[...])`. Reading them fluently is most of reading ML code.\n- **`zip`** pairs inputs with labels and predictions with targets. Use `strict=True` when the lengths must match; a silently truncated evaluation set gives you a wrong score with no warning.\n- **Generators** stream files, database rows and API pages that are too large to load at once, and they let you start processing before everything has arrived.',
              'Limits: generators save memory, not time. A Python loop over a generator still runs the interpreter once per item, which is slow for heavy numeric work. Streaming gets data in; NumPy and pandas, next, do the math fast. Generators also make debugging harder, because an exhausted generator looks like empty data rather than an error.',
            ),
          },
        ],
      },
      misconceptions: [
        {
          claim:
            'A default like `tags=[]` gives each call its own fresh empty list.',
          correction:
            'Defaults are evaluated once, when the function is defined, so every call that uses the default shares one list. Default to `None` and create the list inside the function.',
        },
        {
          claim:
            '`zip` raises an error when its inputs have different lengths.',
          correction:
            'By default it stops at the shortest input and silently drops the extra items. Pass `strict=True` (Python 3.10 and later) to get a `ValueError` instead.',
        },
        {
          claim:
            'A generator is like a list: you can loop over it as many times as you want.',
          correction:
            'A generator is an iterator. It produces each item once and is then exhausted, so a second loop sees nothing. Rebuild it, or store the items in a list if you need them again.',
        },
      ],
      questions: [
        {
          id: 'm02-functions-and-iteration-q1',
          objective: 'm02-functions-and-iteration-2',
          kind: 'recall',
          difficulty: 'easy',
          prompt: 'What does `list(enumerate(["x", "y"]))` evaluate to?',
          options: [
            {
              id: 'a',
              text: "`[(1, 'x'), (2, 'y')]`",
              explanation: 'Counting starts at 0 unless you pass `start=1`.',
            },
            {
              id: 'b',
              text: "`[('x', 0), ('y', 1)]`",
              explanation:
                'The order is reversed: `enumerate` puts the index first, then the item.',
            },
            {
              id: 'c',
              text: "`[(0, 'x'), (1, 'y')]`",
              explanation:
                'Correct. `enumerate` yields `(index, item)` pairs, counting from 0 by default.',
            },
            {
              id: 'd',
              text: '`[0, 1]`',
              explanation:
                'That is just the indexes. `enumerate` pairs each index with its item.',
            },
          ],
          answer: 'c',
        },
        {
          id: 'm02-functions-and-iteration-q2',
          objective: 'm02-functions-and-iteration-3',
          kind: 'recall',
          difficulty: 'easy',
          prompt: 'Which keyword turns a function into a generator function?',
          options: [
            {
              id: 'a',
              text: '`yield`',
              explanation:
                'Correct. A function containing `yield` returns a generator when called, and pauses at each `yield`.',
            },
            {
              id: 'b',
              text: '`return`',
              explanation:
                'Every ordinary function can `return`. It ends the call; it does not make the function lazy.',
            },
            {
              id: 'c',
              text: '`lambda`',
              explanation:
                '`lambda` creates a small anonymous function. It has nothing to do with generators.',
            },
            {
              id: 'd',
              text: '`async`',
              explanation:
                '`async def` defines a coroutine for asynchronous code, which is a different mechanism from a generator.',
            },
          ],
          answer: 'a',
        },
        {
          id: 'm02-functions-and-iteration-q3',
          objective: 'm02-functions-and-iteration-1',
          kind: 'concept',
          difficulty: 'medium',
          prompt:
            'Given `def scale(x, factor=2, offset=0): return x * factor + offset`, what does `scale(3, offset=1)` return?',
          options: [
            {
              id: 'a',
              text: '`3`',
              explanation:
                'This treats `offset=1` as if it set `factor` to 1. Keyword arguments set the parameter they name.',
            },
            {
              id: 'b',
              text: '`7`',
              explanation:
                'Correct. `factor` keeps its default of 2 and `offset` is 1, so the result is 3 * 2 + 1.',
            },
            {
              id: 'c',
              text: '`6`',
              explanation:
                'This ignores the `offset=1` argument and uses the default 0.',
            },
            {
              id: 'd',
              text: 'It raises an error because `factor` was not passed',
              explanation:
                'Parameters with defaults can be skipped. Only parameters without defaults must be passed.',
            },
          ],
          answer: 'b',
        },
        {
          id: 'm02-functions-and-iteration-q4',
          objective: 'm02-functions-and-iteration-2',
          kind: 'concept',
          difficulty: 'medium',
          prompt: 'What does `list(zip([1, 2, 3], "ab"))` evaluate to?',
          options: [
            {
              id: 'a',
              text: "`[(1, 'a'), (2, 'b'), (3, None)]`",
              explanation:
                '`zip` does not pad the shorter input. (`itertools.zip_longest` does.)',
            },
            {
              id: 'b',
              text: 'It raises `ValueError` because the lengths differ',
              explanation:
                'Only `zip(..., strict=True)` raises on unequal lengths. The default silently stops.',
            },
            {
              id: 'c',
              text: "`[(1, 2, 3), ('a', 'b')]`",
              explanation:
                'That keeps each input as its own tuple. `zip` pairs items across inputs by position.',
            },
            {
              id: 'd',
              text: "`[(1, 'a'), (2, 'b')]`",
              explanation:
                'Correct. A string is iterable, and `zip` stops when the shortest input, `"ab"`, runs out.',
            },
          ],
          answer: 'd',
        },
        {
          id: 'm02-functions-and-iteration-q5',
          objective: 'm02-functions-and-iteration-1',
          kind: 'concept',
          difficulty: 'hard',
          prompt:
            'Given `def log(msg, seen=[]): seen.append(msg); return len(seen)`, you call `log("a")` and then `log("b")`. What does the second call return?',
          options: [
            {
              id: 'a',
              text: '`1`, because each call starts with an empty `seen` list',
              explanation:
                'This is the common expectation, but the default list is created once, when the function is defined.',
            },
            {
              id: 'b',
              text: 'It raises an error because a default cannot be a list',
              explanation:
                'Python allows any object as a default. The problem is that a mutable default is shared, not that it is forbidden.',
            },
            {
              id: 'c',
              text: '`2`, because both calls append to the same default list',
              explanation:
                'Correct. The default is evaluated once, so the second call sees `["a"]` and appends `"b"`.',
            },
            {
              id: 'd',
              text: '`0`, because `append` returns `None` before the length is taken',
              explanation:
                '`append` does return `None`, but the function returns `len(seen)` on the next statement, after the append happened.',
            },
          ],
          answer: 'c',
        },
        {
          id: 'm02-functions-and-iteration-q6',
          objective: 'm02-functions-and-iteration-3',
          kind: 'concept',
          difficulty: 'medium',
          prompt:
            'What does this print? `g = (x * x for x in range(3)); print(sum(g), sum(g))`',
          options: [
            {
              id: 'a',
              text: '`5 5`',
              explanation:
                'This would be true for a list. A generator is used up by the first `sum`.',
            },
            {
              id: 'b',
              text: '`5 0`',
              explanation:
                'Correct. The first `sum` consumes 0 + 1 + 4. The generator is then exhausted, so the second `sum` adds nothing and returns 0.',
            },
            {
              id: 'c',
              text: '`3 3`',
              explanation:
                'This sums 0 + 1 + 2 without squaring, and also assumes the generator can be reused.',
            },
            {
              id: 'd',
              text: 'It raises `StopIteration` on the second `sum`',
              explanation:
                '`sum` handles the end of an iterator itself. An exhausted generator just looks empty.',
            },
          ],
          answer: 'b',
        },
        {
          id: 'm02-functions-and-iteration-q7',
          objective: 'm02-functions-and-iteration-3',
          kind: 'application',
          difficulty: 'medium',
          prompt:
            'You need to count the lines containing "ERROR" in a 40 GB log file on a machine with 16 GB of RAM. Which approach works?',
          options: [
            {
              id: 'a',
              text: '`sum(1 for line in f if "ERROR" in line)`',
              explanation:
                'Correct. The file yields one line at a time and the generator expression counts without storing lines, so memory stays small.',
            },
            {
              id: 'b',
              text: '`len([line for line in f.readlines() if "ERROR" in line])`',
              explanation:
                '`readlines()` loads every line into a list first, which needs more memory than the machine has.',
            },
            {
              id: 'c',
              text: '`f.read().count("ERROR")`',
              explanation:
                '`read()` loads all 40 GB into one string. It also counts occurrences, not lines, so a line with two errors counts twice.',
            },
            {
              id: 'd',
              text: '`len(f.read().splitlines())` with a filter applied afterwards',
              explanation:
                'This loads the whole file into memory before filtering, which is what has to be avoided.',
            },
          ],
          answer: 'a',
        },
        {
          id: 'm02-functions-and-iteration-q8',
          objective: 'm02-functions-and-iteration-2',
          kind: 'application',
          difficulty: 'hard',
          prompt:
            'Your evaluation pairs `predictions` with `labels`. A bug upstream sometimes drops a prediction. How should the pairing loop be written so the bug cannot go unnoticed?',
          options: [
            {
              id: 'a',
              text: '`for p, y in zip(predictions, labels):`',
              explanation:
                'Plain `zip` stops at the shorter list, so a missing prediction quietly drops a label and the score looks normal.',
            },
            {
              id: 'b',
              text: '`for i in range(len(labels)):` reading `predictions[i]` and `labels[i]`',
              explanation:
                'This does raise `IndexError` when a prediction is missing, but it is index bookkeeping, and it stays silent if there are extra predictions instead.',
            },
            {
              id: 'c',
              text: '`for p, y in zip(predictions, labels, strict=True):`',
              explanation:
                'Correct. `strict=True` raises `ValueError` whenever the lengths differ, in either direction, while keeping the clear pairing loop.',
            },
            {
              id: 'd',
              text: '`for i, p in enumerate(predictions):` reading `labels[i]`',
              explanation:
                'When a prediction is missing, this loop is simply shorter and the last label is never checked. No error is raised.',
            },
          ],
          answer: 'c',
        },
      ],
      takeaways: [
        'Defaults and keyword arguments let callers set only what they need, by name.',
        'Defaults are evaluated once: never use a mutable default; use `None` and create the object inside.',
        'Use `enumerate` for an index and `zip` to walk inputs together; plain `zip` silently stops at the shortest, `strict=True` raises.',
        'Generators yield one item at a time, so they handle data larger than memory, but they can be consumed only once.',
      ],
      references: [
        {
          title:
            'The Python Tutorial: More Control Flow Tools (defining functions)',
          publisher: 'Python Software Foundation',
          url: 'https://docs.python.org/3/tutorial/controlflow.html',
          kind: 'source',
        },
        {
          title: 'Built-in Functions (enumerate, zip)',
          publisher: 'Python Software Foundation',
          url: 'https://docs.python.org/3/library/functions.html',
          kind: 'source',
        },
        {
          title: 'Functional Programming HOWTO (iterators and generators)',
          publisher: 'Python Software Foundation',
          url: 'https://docs.python.org/3/howto/functional.html',
          kind: 'source',
        },
      ],
      reviewedAt: '2026-11-03',
    },

    // ------------------------------------------------------------------
    // Lesson 3
    // ------------------------------------------------------------------
    {
      slug: 'loading-data',
      title: 'Loading and inspecting data',
      summary:
        'Read CSV and JSON with the standard library, then load tables into pandas, look at them with `head`, `info` and `describe`, select columns and rows, and handle missing values.',
      minutes: 16,
      label: 'foundational',
      objectives: [
        {
          id: 'm02-loading-data-1',
          text: 'read CSV and JSON files with the standard library, and explain why CSV values arrive as strings while JSON keeps numbers and nulls.',
        },
        {
          id: 'm02-loading-data-2',
          text: 'load a table with `pandas.read_csv`, inspect it with `head`, `info`, `describe` and `shape`, and select columns and rows.',
        },
        {
          id: 'm02-loading-data-3',
          text: "find missing values and handle them with `isna`, `dropna` and `fillna`, knowing how they change a column's dtype and its statistics.",
        },
      ],
      concept: [
        {
          heading: 'CSV and JSON with the standard library',
          blocks: [
            {
              type: 'text',
              md: md(
                'Most data arrives as one of two text formats. **CSV** is a table: one row per line, values separated by commas. **JSON** is nested data: objects, arrays, strings, numbers, `true`/`false` and `null`. Python reads both without any extra packages.',
                py(
                  'import csv, io, json',
                  '',
                  'text = "name,age\\nada,36\\ngrace,\\n"',
                  'rows = list(csv.DictReader(io.StringIO(text)))',
                  'print(rows)',
                  "# [{'name': 'ada', 'age': '36'}, {'name': 'grace', 'age': ''}]",
                  '',
                  'print(json.loads(\'{"model": "m1", "scores": [0.9, null], "ok": true}\'))',
                  "# {'model': 'm1', 'scores': [0.9, None], 'ok': True}",
                ),
                "(`io.StringIO` wraps a string so it behaves like an open file, which keeps the example self-contained.) Notice the difference. A CSV file has no types, so the `csv` module gives you **every value as a string**: the age is `'36'`, not `36`, and the missing age is an empty string. Converting is your job. JSON does carry types, so `json` maps numbers to `int` or `float`, `null` to `None`, `true` to `True`, objects to dicts and arrays to lists.",
                'With real files, open CSV with `newline=""`, as the `csv` docs require, and use `json.load(f)` for a file or `json.loads(s)` for a string:',
                py(
                  'with open("people.csv", newline="") as f:',
                  '    rows = list(csv.DictReader(f))',
                  '',
                  'with open("config.json") as f:',
                  '    config = json.load(f)',
                ),
              ),
            },
          ],
        },
        {
          heading: 'pandas: tables with types',
          blocks: [
            {
              type: 'text',
              md: md(
                'For tabular data, **pandas** does the tedious parts for you. `pd.read_csv` parses the file, guesses a type for each column and returns a **DataFrame**: a table with labelled columns and an index of row labels. Each column is a **Series**: a one-dimensional labelled array with one dtype.',
                py(
                  'import io',
                  'import pandas as pd',
                  '',
                  'csv_text = "city,temp,rain\\nOslo,4.5,yes\\nLima,19.0,no\\nCairo,,no\\nPune,27.5,yes\\n"',
                  'df = pd.read_csv(io.StringIO(csv_text))  # usually pd.read_csv("weather.csv")',
                  '',
                  'print(df.shape)    # (4, 3): 4 rows, 3 columns',
                  'print(df.head(2))',
                  '#    city  temp rain',
                  '# 0  Oslo   4.5  yes',
                  '# 1  Lima  19.0   no',
                ),
                'Three calls give you a first look at any new table:',
                '- `df.head(n)` shows the first rows (5 by default), so you see what the values look like.\n- `df.info()` lists every column with its **non-null count** and **dtype**. Here it reports `temp` as `float64` with 3 non-null values out of 4, which tells you one is missing.\n- `df.describe()` gives count, mean, standard deviation, min, quartiles and max. By default it only covers numeric columns, so on this table it summarises `temp` alone, with `count` 3 and `mean` 17.0.',
                'Selecting data uses square brackets. One column name gives a **Series**; a list of names gives a **DataFrame**; a boolean Series keeps the rows where it is `True`.',
                py(
                  'df["temp"]              # Series',
                  'df[["city", "temp"]]    # DataFrame with two columns',
                  'df[df["temp"] > 10]     # rows where temp > 10: Lima and Pune',
                  'df.loc[df["temp"] > 10, "city"].tolist()  # [\'Lima\', \'Pune\']',
                ),
                '`loc` selects by labels and conditions, `iloc` by integer position: `df.iloc[0:2, 0:2]` is the first two rows of the first two columns.',
              ),
            },
            {
              type: 'note',
              md: 'Text columns show the dtype `object` in pandas 2. pandas 3 gives them a dedicated string dtype, shown as `str`. Numeric columns behave the same in both.',
            },
            {
              type: 'terms',
              terms: [
                {
                  term: 'DataFrame',
                  definition:
                    'A pandas table: labelled columns that can each have a different dtype, sharing one row index.',
                },
                {
                  term: 'Series',
                  definition:
                    'A one-dimensional labelled array with a single dtype. Each DataFrame column is a Series.',
                },
                {
                  term: 'dtype',
                  definition:
                    "The data type of a column's values, such as `int64`, `float64`, `bool` or a text type.",
                },
                {
                  term: 'NaN',
                  definition:
                    '"Not a number", the floating-point value pandas uses by default to mark a missing number.',
                },
                {
                  term: 'Boolean mask',
                  definition:
                    'A Series of `True`/`False` values, such as `df["temp"] > 10`, used to keep only the matching rows.',
                },
              ],
            },
          ],
        },
        {
          heading: 'Missing values',
          blocks: [
            {
              type: 'text',
              md: md(
                'Real data has holes. By default `read_csv` turns empty fields and common markers such as `NA`, `N/A`, `NULL` and `NaN` into a missing value. In a numeric column that value is **NaN**, which is a float, so **an integer column with even one gap is read as `float64`**:',
                py(
                  'pd.read_csv(io.StringIO("id,n\\n1,5\\n2,7\\n"))["n"].dtype  # int64',
                  'pd.read_csv(io.StringIO("id,n\\n1,5\\n2,\\n"))["n"].dtype   # float64',
                ),
                'NaN is never equal to anything, even itself (`np.nan == np.nan` is `False`), so do not test for it with `==`. Use `isna`:',
                py(
                  'df.isna().sum()   # missing values per column: city 0, temp 1, rain 0',
                  'df["temp"].mean() # 17.0 -- NaN is skipped',
                  'df.dropna()       # drop rows with any missing value: 3 rows left',
                  'df.dropna(subset=["temp"])  # only look at the columns you need',
                  'df["temp"] = df["temp"].fillna(df["temp"].mean())  # fill with a value',
                ),
                'pandas statistics such as `mean`, `sum` and `count` **skip missing values by default**, so the mean above is (4.5 + 19.0 + 27.5) / 3. That is usually what you want, but it means a summary can look healthy while a third of a column is empty. Check `info()` or `isna().sum()` before trusting it. Comparisons with NaN are `False`, so a filter like `df["temp"] > 10` quietly leaves out rows with no temperature.',
              ),
            },
            {
              type: 'example',
              title: 'Dropping too much',
              md: md(
                'A table has `age`, `income` and a free-text `notes` column that is blank in most rows. A model only needs `age` and `income`.',
                py(
                  'people = pd.read_csv(io.StringIO(',
                  '    "age,income,notes\\n30,100,\\n41,200,vip\\n,150,\\n25,,\\n"',
                  '))',
                  'print(len(people))                                # 4',
                  'print(len(people.dropna()))                       # 1',
                  'print(len(people.dropna(subset=["age", "income"])))  # 2',
                ),
                'Plain `dropna()` throws away every row with a blank note, keeping one row out of four. Restricting it to the columns you use keeps two. Whether to drop or fill is a modelling decision: filling with the mean keeps rows but invents values, and dropping can bias the data if gaps are not random.',
              ),
            },
          ],
        },
      ],
      application: {
        heading: 'The first ten minutes with a new dataset',
        blocks: [
          {
            type: 'text',
            md: md(
              'Almost every ML project starts the same way: load the file, then check that it is what you think it is before training anything.',
              '1. `df = pd.read_csv(path)` and `df.shape`: is the row count roughly right?\n2. `df.head()`: do the values look sensible, and did the header parse?\n3. `df.info()`: are numeric columns numeric? A price column read as text usually means a stray `"$"` or `"n/a"` in the file.\n4. `df.isna().sum()`: where are the gaps, and how big are they?\n5. `df.describe()`: are ranges plausible? A negative age or a maximum of 999 is often a placeholder for "unknown".',
              'The standard library is still useful: `json` for API responses and configs, `csv` when you want to stream rows one at a time without loading a table.',
              'Limits: `read_csv` loads the whole file into memory, and its type guesses can be wrong (zip codes losing leading zeros, ids read as floats). Pass `dtype=`, `usecols=` and `nrows=` to control what is read. Missing values have no universal fix; how you handle them changes what the model learns, and the same handling must be applied when the model is used later.',
            ),
          },
        ],
      },
      misconceptions: [
        {
          claim:
            'The `csv` module converts numbers in the file into ints and floats.',
          correction:
            'By default every value comes back as a string, including empty ones. You convert types yourself, or use pandas, which infers a dtype per column.',
        },
        {
          claim: '`df["age"] == np.nan` finds the missing ages.',
          correction:
            'NaN is not equal to anything, including itself, so that comparison is `False` everywhere. Use `df["age"].isna()`.',
        },
        {
          claim:
            'If `describe()` shows a sensible mean, the column has no missing data.',
          correction:
            'pandas statistics skip missing values by default. Compare `count` with the number of rows, or use `isna().sum()`, to see how much is missing.',
        },
      ],
      questions: [
        {
          id: 'm02-loading-data-q1',
          objective: 'm02-loading-data-1',
          kind: 'recall',
          difficulty: 'easy',
          prompt:
            'A file has the header `name,age` and the row `ada,36`. What is `row["age"]` for that row from `csv.DictReader`?',
          options: [
            {
              id: 'a',
              text: 'The integer `36`',
              explanation:
                'The `csv` module does no type conversion by default, so it cannot know the column is numeric.',
            },
            {
              id: 'b',
              text: 'The float `36.0`',
              explanation:
                'The reader produces floats only if you ask, for example with `quoting=csv.QUOTE_NONNUMERIC`. By default it returns strings.',
            },
            {
              id: 'c',
              text: "The string `'36'`",
              explanation:
                'Correct. CSV carries no types, so every value comes back as a string for you to convert.',
            },
            {
              id: 'd',
              text: "A one-item list `['36']`",
              explanation:
                '`DictReader` maps each column name to a single value. Lists appear only for extra fields beyond the header.',
            },
          ],
          answer: 'c',
        },
        {
          id: 'm02-loading-data-q2',
          objective: 'm02-loading-data-2',
          kind: 'recall',
          difficulty: 'easy',
          prompt:
            'For a pandas DataFrame `df` with a column named `temp`, what does `df["temp"]` return?',
          options: [
            {
              id: 'a',
              text: 'A one-column DataFrame',
              explanation:
                'That is what `df[["temp"]]`, with a list inside the brackets, returns.',
            },
            {
              id: 'b',
              text: 'A Series',
              explanation:
                'Correct. Selecting a single column label returns that column as a Series.',
            },
            {
              id: 'c',
              text: 'A Python list of the values',
              explanation:
                'pandas returns its own labelled type. Call `.tolist()` if you want a plain list.',
            },
            {
              id: 'd',
              text: 'The first row whose index is `temp`',
              explanation:
                'Plain brackets with a single label select a column. Rows by label use `df.loc[...]`.',
            },
          ],
          answer: 'b',
        },
        {
          id: 'm02-loading-data-q3',
          objective: 'm02-loading-data-1',
          kind: 'concept',
          difficulty: 'medium',
          prompt: 'What does `json.loads(\'{"a": [1, null, true]}\')` return?',
          options: [
            {
              id: 'a',
              text: "`{'a': ['1', 'null', 'true']}`",
              explanation:
                'This is how CSV would behave. JSON carries types, so values are converted.',
            },
            {
              id: 'b',
              text: "`{'a': [1, nan, 1]}`",
              explanation:
                '`json` does not use NaN for `null` or turn booleans into numbers. Those are pandas and NumPy habits.',
            },
            {
              id: 'c',
              text: "`{'a': (1, None, True)}`",
              explanation: 'JSON arrays decode to Python lists, not tuples.',
            },
            {
              id: 'd',
              text: "`{'a': [1, None, True]}`",
              explanation:
                'Correct. Objects become dicts, arrays become lists, `null` becomes `None` and `true` becomes `True`.',
            },
          ],
          answer: 'd',
        },
        {
          id: 'm02-loading-data-q4',
          objective: 'm02-loading-data-3',
          kind: 'concept',
          difficulty: 'medium',
          prompt:
            'A CSV column `n` holds `5` in one row and is empty in the next. With default settings, what dtype does `pd.read_csv` give `n`?',
          options: [
            {
              id: 'a',
              text: '`float64`, because the missing value is stored as NaN, which is a float',
              explanation:
                'Correct. The default missing marker for numbers is NaN, and an integer column cannot hold it, so the column becomes `float64`.',
            },
            {
              id: 'b',
              text: '`int64`, because the only value present is an integer',
              explanation:
                'That holds when there are no gaps. The default `int64` dtype has no way to store a missing value.',
            },
            {
              id: 'c',
              text: 'A text dtype, because an empty field is read as an empty string',
              explanation:
                'pandas reads empty fields as missing, not as empty strings, so the column stays numeric.',
            },
            {
              id: 'd',
              text: 'It raises an error until you pass `na_values`',
              explanation:
                'Empty fields are already in the default set of missing markers, so no option is needed.',
            },
          ],
          answer: 'a',
        },
        {
          id: 'm02-loading-data-q5',
          objective: 'm02-loading-data-2',
          kind: 'concept',
          difficulty: 'medium',
          prompt:
            'A DataFrame has a text column `city` and numeric columns `temp` and `rain_mm`. Which columns does `df.describe()` summarise by default?',
          options: [
            {
              id: 'a',
              text: 'All three, with counts and averages for each',
              explanation:
                'You would need `describe(include="all")`. There is no average of city names to report.',
            },
            {
              id: 'b',
              text: 'Only `city`, since text columns need the most checking',
              explanation:
                'Text columns are summarised only when a DataFrame has no numeric columns at all.',
            },
            {
              id: 'c',
              text: 'Only `temp` and `rain_mm`, the numeric columns',
              explanation:
                'Correct. With mixed columns, `describe()` covers numeric columns by default.',
            },
            {
              id: 'd',
              text: 'Only the first column, unless you name the others',
              explanation:
                '`describe()` covers every column of the selected kinds, not just the first.',
            },
          ],
          answer: 'c',
        },
        {
          id: 'm02-loading-data-q6',
          objective: 'm02-loading-data-3',
          kind: 'concept',
          difficulty: 'hard',
          prompt:
            'Column `temp` holds `4.5`, `19.0`, a missing value and `27.5`. What does `df["temp"].mean()` return?',
          options: [
            {
              id: 'a',
              text: '`nan`, because any missing value makes the mean undefined',
              explanation:
                "That is NumPy's behaviour on a raw array, and pandas with `skipna=False`. pandas skips missing values by default.",
            },
            {
              id: 'b',
              text: '`17.0`, the mean of the three values present',
              explanation:
                'Correct. (4.5 + 19.0 + 27.5) / 3 = 17.0. Missing values are left out of both the sum and the count.',
            },
            {
              id: 'c',
              text: '`12.75`, treating the missing value as zero',
              explanation:
                'This divides 51.0 by 4. pandas does not count missing values as zero when averaging.',
            },
            {
              id: 'd',
              text: 'It raises an error until missing values are filled',
              explanation:
                'pandas statistics handle missing values without an error.',
            },
          ],
          answer: 'b',
        },
        {
          id: 'm02-loading-data-q7',
          objective: 'm02-loading-data-2',
          kind: 'application',
          difficulty: 'medium',
          prompt:
            "You load an unfamiliar 2-million-row CSV and suspect some numeric columns were read as text. Which single call shows each column's dtype and non-null count?",
          options: [
            {
              id: 'a',
              text: '`print(df)`',
              explanation:
                'pandas prints a shortened view of the values. It shows neither dtypes nor how many values are missing.',
            },
            {
              id: 'b',
              text: '`df.describe()`',
              explanation:
                'By default `describe` skips non-numeric columns, so a numeric column read as text would simply be absent from the output.',
            },
            {
              id: 'c',
              text: '`df.head()`',
              explanation:
                'The first five rows show values but not dtypes, and they say nothing about gaps further down.',
            },
            {
              id: 'd',
              text: '`df.info()`',
              explanation:
                'Correct. `info()` lists every column with its non-null count and dtype, so a text-typed price column stands out.',
            },
          ],
          answer: 'd',
        },
        {
          id: 'm02-loading-data-q8',
          objective: 'm02-loading-data-3',
          kind: 'application',
          difficulty: 'hard',
          prompt:
            'Your model uses `age` and `income`. A free-text `notes` column is blank in 90% of rows. What happens with `df.dropna()`, and what is the better call?',
          options: [
            {
              id: 'a',
              text: 'It drops about 90% of rows over `notes`; use `df.dropna(subset=["age", "income"])`',
              explanation:
                'Correct. Plain `dropna()` drops a row if any column is missing. `subset` limits the check to the columns the model uses.',
            },
            {
              id: 'b',
              text: 'It drops only the rows missing `age` or `income`, so it is already the right call',
              explanation:
                'Without `subset`, `dropna()` checks every column, including `notes`.',
            },
            {
              id: 'c',
              text: 'It drops the `notes` column itself, so `dropna()` works here as is',
              explanation:
                'By default `dropna()` removes rows, not columns. Dropping columns needs `axis=1`.',
            },
            {
              id: 'd',
              text: 'It fills the blank notes with NaN; then use `df.fillna(0)` on the table',
              explanation:
                '`dropna` removes data; it never fills. Filling every column with 0 would also invent fake ages and incomes.',
            },
          ],
          answer: 'a',
        },
      ],
      takeaways: [
        '`csv` returns every value as a string; `json` keeps numbers, booleans and `null` as Python types.',
        '`pd.read_csv` gives a DataFrame with a dtype per column; `df["col"]` is a Series, `df[["a", "b"]]` a DataFrame.',
        'Start every dataset with `shape`, `head()`, `info()`, `isna().sum()` and `describe()`.',
        'A missing number is NaN, a float, so an integer column with a gap becomes `float64`.',
        'pandas statistics skip missing values by default; use `dropna(subset=...)` or `fillna` on purpose, not by reflex.',
      ],
      references: [
        {
          title: 'csv: CSV File Reading and Writing',
          publisher: 'Python Software Foundation',
          url: 'https://docs.python.org/3/library/csv.html',
          kind: 'source',
        },
        {
          title: 'json: JSON encoder and decoder',
          publisher: 'Python Software Foundation',
          url: 'https://docs.python.org/3/library/json.html',
          kind: 'source',
        },
        {
          title: 'pandas.read_csv',
          publisher: 'pandas',
          url: 'https://pandas.pydata.org/docs/reference/api/pandas.read_csv.html',
          kind: 'source',
        },
        {
          title: 'How do I select a subset of a DataFrame?',
          publisher: 'pandas',
          url: 'https://pandas.pydata.org/docs/getting_started/intro_tutorials/03_subset_data.html',
          kind: 'source',
        },
        {
          title: 'pandas.DataFrame.describe',
          publisher: 'pandas',
          url: 'https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.describe.html',
          kind: 'source',
        },
        {
          title: 'Working with missing data',
          publisher: 'pandas',
          url: 'https://pandas.pydata.org/docs/user_guide/missing_data.html',
          kind: 'source',
        },
        {
          title: '10 minutes to pandas',
          publisher: 'pandas',
          url: 'https://pandas.pydata.org/docs/user_guide/10min.html',
          kind: 'further',
        },
      ],
      reviewedAt: '2026-11-03',
    },
  ],

  // --------------------------------------------------------------------
  // Exam questions
  // --------------------------------------------------------------------
  examQuestions: [
    {
      id: 'm02-python-for-data-x1',
      objective: 'm02-loading-data-1',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        '`rows` is a `csv.DictReader` over `name,age` / `ada,36` / `grace,` (empty age) / `alan,41`. What does `[int(r["age"]) for r in rows if r["age"]]` give?',
      options: [
        {
          id: 'a',
          text: "`['36', '41']`",
          explanation:
            'The filter is right, but `int(...)` converts each string, so the result holds integers.',
        },
        {
          id: 'b',
          text: '`[36, 41]`',
          explanation:
            'Correct. The empty string is falsy, so the filter skips grace, and `int` converts the remaining strings.',
        },
        {
          id: 'c',
          text: '`[36, 0, 41]`',
          explanation:
            "The filter drops grace's row entirely; nothing turns the empty string into 0.",
        },
        {
          id: 'd',
          text: "It raises `ValueError` on grace's empty age",
          explanation:
            '`int("")` would raise, but the filter runs first and removes that row before `int` is called.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'm02-python-for-data-x2',
      objective: 'm02-functions-and-iteration-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'You must total the third column of a 30 GB numeric CSV with no header row, on a laptop with 8 GB of RAM. Which approach fits in memory?',
      options: [
        {
          id: 'a',
          text: '`pd.read_csv(path)` and then `df.iloc[:, 2].sum()`',
          explanation:
            '`read_csv` loads the whole table into memory by default, which the laptop cannot hold.',
        },
        {
          id: 'b',
          text: '`list(csv.reader(f))`, then a loop that sums the third field',
          explanation:
            'Wrapping the reader in `list` stores every row in memory before the loop starts.',
        },
        {
          id: 'c',
          text: '`sum(float(row[2]) for row in csv.reader(f))`',
          explanation:
            'Correct. `csv.reader` yields one row at a time and the generator expression consumes them as they come, so only one row is held at once.',
        },
        {
          id: 'd',
          text: '`sum([float(row[2]) for row in csv.reader(f)])`',
          explanation:
            'The square brackets build a list of every value before `sum` runs. With hundreds of millions of rows, a list of Python floats can itself need many gigabytes.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'm02-python-for-data-x3',
      objective: 'm02-functions-and-iteration-1',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'Given `def count(word, counts={}): counts[word] = counts.get(word, 0) + 1; return counts`, you call `count("a")` and then `count("b")`. What does the second call return?',
      options: [
        {
          id: 'a',
          text: "`{'b': 1}`",
          explanation:
            'This assumes a fresh dict per call. The default dict is created once and shared.',
        },
        {
          id: 'b',
          text: "`{'a': 1, 'b': 2}`",
          explanation:
            'Each word is counted once, so both counts are 1. The second call adds a new key; it does not bump the old one.',
        },
        {
          id: 'c',
          text: 'It raises `KeyError` because `"b"` is not in `counts`',
          explanation:
            '`counts.get(word, 0)` returns 0 for a missing key, so no `KeyError` is raised.',
        },
        {
          id: 'd',
          text: "`{'a': 1, 'b': 1}`",
          explanation:
            'Correct. Both calls use the same default dict, so the first call\'s `"a"` is still there when `"b"` is added.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'm02-python-for-data-x4',
      objective: 'm02-functions-and-iteration-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt: 'What does `dict(zip(["a", "b", "c"], [1, 2]))` return?',
      options: [
        {
          id: 'a',
          text: "`{'a': 1, 'b': 2}`",
          explanation:
            'Correct. `zip` makes the pairs `("a", 1)` and `("b", 2)`, stops when the shorter list runs out, and `dict` turns the pairs into keys and values.',
        },
        {
          id: 'b',
          text: "`{'a': 1, 'b': 2, 'c': None}`",
          explanation:
            '`zip` does not pad missing values with `None`, so `"c"` never appears.',
        },
        {
          id: 'c',
          text: 'It raises `ValueError` because the lists differ in length',
          explanation:
            'Only `zip(..., strict=True)` raises. Plain `zip` silently drops `"c"`.',
        },
        {
          id: 'd',
          text: "`{1: 'a', 2: 'b'}`",
          explanation:
            'The first list supplies the keys and the second the values, not the other way round.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'm02-python-for-data-x5',
      objective: 'm02-python-data-structures-1',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        '`records = json.load(f)` gives a list of event dicts, each with a `"user_id"`. Which expression counts the distinct users?',
      options: [
        {
          id: 'a',
          text: '`len(records)`',
          explanation:
            'This counts events. A user with several events would be counted several times.',
        },
        {
          id: 'b',
          text: '`len([r["user_id"] for r in records])`',
          explanation:
            'A list keeps duplicates, so this is the same as counting events.',
        },
        {
          id: 'c',
          text: '`len({r["user_id"] for r in records})`',
          explanation:
            'Correct. The set comprehension keeps each user id once, so its length is the number of distinct users.',
        },
        {
          id: 'd',
          text: '`len({r for r in records})`',
          explanation:
            'The records are dicts, which are not hashable, so putting them in a set raises `TypeError`.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'm02-python-for-data-x6',
      objective: 'm02-python-data-structures-3',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'What does this print? `rows = [{"x": 1}] * 3; rows[0]["x"] = 5; print([r["x"] for r in rows])`',
      options: [
        {
          id: 'a',
          text: '`[5, 1, 1]`',
          explanation:
            'This assumes `* 3` made three separate dicts. It made three references to one dict.',
        },
        {
          id: 'b',
          text: '`[5, 5, 5]`',
          explanation:
            'Correct. All three list entries are the same dict, so the change through `rows[0]` shows in every entry the comprehension reads.',
        },
        {
          id: 'c',
          text: '`[1, 1, 1]`',
          explanation:
            'The assignment does change the dict. It just happens to be the only dict in the list.',
        },
        {
          id: 'd',
          text: 'It raises `TypeError` because dicts cannot be repeated with `*`',
          explanation:
            'Repeating a list with `*` works whatever it holds. The surprise is that the items are shared, not copied.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'm02-python-for-data-x7',
      objective: 'm02-loading-data-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'You want a list of the columns of `df` that have at least one missing value. Which expression gives it?',
      options: [
        {
          id: 'a',
          text: '`[col for col in df if df[col] == np.nan]`',
          explanation:
            'NaN never equals anything, and comparing a whole column gives a Series, which cannot be used as a single `if` condition.',
        },
        {
          id: 'b',
          text: '`[col for col, n in df.isna().sum().items() if n > 0]`',
          explanation:
            'Correct. `isna().sum()` counts missing values per column as a Series, `.items()` yields `(column, count)` pairs, and the filter keeps columns with a count above 0.',
        },
        {
          id: 'c',
          text: '`[col for col, n in enumerate(df.isna().sum()) if n > 0]`',
          explanation:
            '`enumerate` pairs each count with its position, so this returns column positions such as `[1]`, not column names.',
        },
        {
          id: 'd',
          text: '`[col for col in df.dropna().columns]`',
          explanation:
            '`dropna()` removes rows, not columns, so this lists every column.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'm02-python-for-data-x8',
      objective: 'm02-functions-and-iteration-1',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'You want only columns `a` and `b`, and only the first 100 rows, from a CSV. Which call does that in current pandas?',
      options: [
        {
          id: 'a',
          text: '`pd.read_csv(path, ["a", "b"], 100)`',
          explanation:
            'In current pandas, every `read_csv` parameter after the path is keyword-only, so this call raises `TypeError`. Pass the options by name.',
        },
        {
          id: 'b',
          text: '`pd.read_csv(path, columns=["a", "b"], rows=100)`',
          explanation:
            '`read_csv` has no `columns` or `rows` parameters, so it rejects these keywords with a `TypeError`.',
        },
        {
          id: 'c',
          text: '`pd.read_csv(path)[["a", "b"]].head(100)`',
          explanation:
            'This gives the right table, but only after reading every row and column of the file into memory first.',
        },
        {
          id: 'd',
          text: '`pd.read_csv(path, usecols=["a", "b"], nrows=100)`',
          explanation:
            'Correct. `usecols` and `nrows` are keyword arguments that limit what is read: pandas stops after 100 rows and keeps only those two columns.',
        },
      ],
      answer: 'd',
    },
  ],
}
