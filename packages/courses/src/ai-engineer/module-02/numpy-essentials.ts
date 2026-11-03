import type { Submodule } from '../../types'

/** Paragraphs and code blocks of one markdown field, separated by blank lines. */
const md = (...parts: string[]) => parts.join('\n\n')
/** A fenced Python code block. */
const py = (...lines: string[]) => ['```python', ...lines, '```'].join('\n')

export const numpyEssentials: Submodule = {
  slug: 'numpy-essentials',
  title: 'NumPy essentials',
  summary:
    'The array library under almost every Python ML tool: how arrays store data, how vectorized operations and broadcasting replace loops, and how to slice, mask and aggregate along an axis.',
  lessons: [
    // ------------------------------------------------------------------
    // Lesson 1
    // ------------------------------------------------------------------
    {
      slug: 'numpy-arrays',
      title: 'NumPy arrays: shape, dtype and memory',
      summary:
        'A NumPy array is one block of memory holding values of a single type, described by a shape. That design makes it fast and compact, and it explains why some operations share memory with the original array instead of copying it.',
      minutes: 14,
      label: 'foundational',
      objectives: [
        {
          id: 'm02-numpy-arrays-1',
          text: 'explain how an ndarray differs from a Python list (one dtype, fixed size, one block of memory) and estimate how much memory an array needs.',
        },
        {
          id: 'm02-numpy-arrays-2',
          text: 'create arrays and read their `shape`, `ndim`, `size` and `dtype`, and change shape with `reshape`, including `-1`.',
        },
        {
          id: 'm02-numpy-arrays-3',
          text: 'tell whether an operation returns a view or a copy, and predict when changing one array changes another.',
        },
      ],
      concept: [
        {
          heading: 'Why not just use lists?',
          blocks: [
            {
              type: 'text',
              md: md(
                'A Python list holds references to separate Python objects. Each number in it is a full object with its own type information, stored wherever the interpreter put it. That flexibility costs memory and speed when you have millions of numbers.',
                'A NumPy **ndarray** ("n-dimensional array") makes three restrictions instead:',
                '- **One dtype.** Every element has the same type, such as 64-bit float, so each takes the same number of bytes.\n- **Fixed size.** The number of elements is set when the array is created. "Resizing" builds a new array.\n- **One block of memory.** The raw values sit side by side, and the array\'s **shape** says how to read them as rows, columns and so on.',
                'Those restrictions are what let NumPy run whole-array operations in compiled code (the next lesson) and make memory easy to predict: **bytes = number of elements × bytes per element**.',
                py(
                  'import numpy as np',
                  '',
                  'print([1, 2] * 2)            # [1, 2, 1, 2]  -- list repetition',
                  'print(np.array([1, 2]) * 2)  # [2 4]         -- elementwise math',
                  '',
                  'print(np.zeros(1000).nbytes)                    # 8000 (float64: 8 bytes each)',
                  'print(np.zeros(1000, dtype=np.float32).nbytes)  # 4000 (float32: 4 bytes each)',
                ),
              ),
            },
          ],
        },
        {
          heading: 'Shape, ndim, size and dtype',
          blocks: [
            {
              type: 'text',
              md: md(
                'Every array carries a few attributes that you will read constantly:',
                py(
                  'a = np.array([[1, 2, 3], [4, 5, 6]])',
                  'print(a.shape, a.ndim, a.size, a.dtype)  # (2, 3) 2 6 int64',
                ),
                '`shape` is a tuple with the length of each dimension (here 2 rows, 3 columns), `ndim` is the number of dimensions, `size` the total element count, and `dtype` the element type. NumPy picks a dtype that can hold every input, so mixing ints and floats gives floats: `np.array([1, 2.5]).dtype` is `float64`. Python ints become `int64` by default on 64-bit systems.',
                'Common ways to create arrays:',
                py(
                  'np.zeros((2, 3))         # 2x3 of 0.0, dtype float64',
                  'np.ones(4)               # [1. 1. 1. 1.]',
                  'np.full((2, 2), 7)       # [[7 7] [7 7]]',
                  'np.arange(6)             # [0 1 2 3 4 5], like range()',
                  'np.linspace(0, 1, 5)     # [0.   0.25 0.5  0.75 1.  ], 5 evenly spaced points',
                  'a.astype(np.float32)     # a new array converted to float32',
                ),
                '`reshape` reads the same values with a new shape. The total number of elements must stay the same, and one dimension may be `-1`, meaning "work this one out".',
                py(
                  'x = np.arange(12)',
                  'x.reshape(3, 4)          # 3 rows of 4',
                  'x.reshape(2, -1).shape   # (2, 6)',
                  'x.reshape(5, 2)',
                  '# ValueError: cannot reshape array of size 12 into shape (5,2)',
                ),
              ),
            },
            {
              type: 'note',
              md: "A Python float does not raise a float array's precision in NumPy 2: `np.zeros(3, dtype=np.float32) * 2.0` stays `float32`. A Python float does still turn an integer array into floats (`np.arange(3) * 2.0` is `float64`), and combining two arrays promotes: a `float32` array plus a `float64` array gives `float64`.",
            },
            {
              type: 'terms',
              terms: [
                {
                  term: 'ndarray',
                  definition:
                    "NumPy's array type: a fixed-size block of same-typed values plus a shape that says how to index them.",
                },
                {
                  term: 'shape',
                  definition:
                    'A tuple giving the length of each dimension, such as `(2, 3)` for 2 rows and 3 columns.',
                },
                {
                  term: 'dtype',
                  definition:
                    'The type of every element, such as `int64`, `float64` or `float32`. It sets how many bytes each element uses.',
                },
                {
                  term: 'View',
                  definition:
                    "An array that looks at another array's memory. Writing to a view changes the original.",
                },
                {
                  term: 'Copy',
                  definition:
                    'An array with its own memory. Changing it never affects the array it came from.',
                },
              ],
            },
          ],
        },
        {
          heading: 'Views and copies',
          blocks: [
            {
              type: 'text',
              md: md(
                'Because an array is just memory plus a description, NumPy can make a new array that **describes the same memory differently** without copying anything. That is a **view**. Slicing and `reshape` (when possible) return views; that is part of why they are fast, even on huge arrays.',
                py(
                  'x = np.arange(6)',
                  'v = x[1:4]       # a view of three elements',
                  'v[0] = 100',
                  'print(x)         # [  0 100   2   3   4   5]',
                  '',
                  'r = x.reshape(2, 3)',
                  'r[0, 0] = -1',
                  'print(x[0])      # -1, reshape returned a view too',
                  '',
                  'c = x[1:4].copy()  # its own memory',
                  'c[0] = 7           # x is unchanged',
                ),
                'This is the opposite of Python lists, where a slice is a new list:',
                py(
                  'lst = [0, 1, 2]',
                  's = lst[0:2]',
                  's[0] = 99',
                  'print(lst)  # [0, 1, 2]',
                ),
                'Other operations do copy: `astype`, `.copy()`, arithmetic that builds a new result (`x * 2`), and indexing with a list of positions or a boolean mask (lesson 3). When you are unsure, `np.shares_memory(a, b)` tells you whether two arrays overlap.',
              ),
            },
            {
              type: 'example',
              title: 'A preprocessing bug that corrupts the source',
              md: md(
                'A notebook takes the first 1,000 rows as a validation set and centres them:',
                py(
                  'data = np.arange(4000, dtype=float).reshape(2000, 2)',
                  'val = data[:1000]       # a view, not a copy',
                  'val -= val.mean(axis=0) # in-place: writes into data',
                ),
                'Because `val` is a view and `-=` writes in place, the first half of `data` has been changed too. Any later step that reads `data`, such as building the training set or saving it, now sees altered values. Writing `val = data[:1000].copy()` keeps the two independent.',
              ),
            },
          ],
        },
      ],
      application: {
        heading: 'Arrays in ML code',
        blocks: [
          {
            type: 'text',
            md: md(
              'Nearly all numeric data in Python ML ends up as arrays: a batch of images is a 4-D array such as `(32, 3, 224, 224)`, a table of features is `(rows, columns)`, word embeddings are `(vocab_size, dim)`. pandas stores numeric columns in NumPy arrays, and PyTorch tensors follow the same ideas of shape, dtype and views, and convert to and from NumPy cheaply.',
              'Shape and dtype are the first things to check when something goes wrong, and dtype is a real budget decision: an embedding table of 1,000,000 × 768 values takes about 3.1 GB as `float32` and twice that as `float64`. ML code often uses `float32` (or smaller types) for exactly this reason.',
              'Limits: arrays need one dtype, so mixed tables with text and numbers fit pandas better. Arrays cannot grow cheaply, so appending in a loop (`np.append`) copies everything each time; collect values in a list and convert once. And views save memory but make in-place changes reach further than you may expect.',
            ),
          },
        ],
      },
      misconceptions: [
        {
          claim: 'Slicing a NumPy array gives you a new, independent array.',
          correction:
            'Basic slicing returns a view of the same memory, so writing to the slice changes the original. Call `.copy()` when you need independence. (Python list slices, by contrast, are copies.)',
        },
        {
          claim: '`reshape` rearranges or copies the data into a new order.',
          correction:
            '`reshape` keeps the same elements in the same order and only changes how they are indexed. It returns a view whenever it can, and it fails if the new shape has a different number of elements.',
        },
        {
          claim:
            'A NumPy array can hold a mix of ints and floats like a list does.',
          correction:
            'An array has one dtype. `np.array([1, 2.5])` converts everything to `float64`. (An `object` dtype exists, but it gives up the speed and memory benefits.)',
        },
      ],
      questions: [
        {
          id: 'm02-numpy-arrays-q1',
          objective: 'm02-numpy-arrays-2',
          kind: 'recall',
          difficulty: 'easy',
          prompt: 'What are the shape and dtype of `np.zeros((3, 4))`?',
          options: [
            {
              id: 'a',
              text: 'Shape `(4, 3)`, dtype `int64`',
              explanation:
                'The tuple is read as (rows, columns), so the shape is `(3, 4)`. And `zeros` defaults to floats.',
            },
            {
              id: 'b',
              text: 'Shape `(12,)`, dtype `float64`',
              explanation:
                'The tuple gives a 2-D shape. You would get `(12,)` from `np.zeros(12)`.',
            },
            {
              id: 'c',
              text: 'Shape `(3, 4)`, dtype `int64`',
              explanation:
                'The shape is right, but `np.zeros` creates `float64` values unless you pass `dtype`.',
            },
            {
              id: 'd',
              text: 'Shape `(3, 4)`, dtype `float64`',
              explanation:
                'Correct. The tuple is the shape, and creation functions like `zeros` default to `float64`.',
            },
          ],
          answer: 'd',
        },
        {
          id: 'm02-numpy-arrays-q2',
          objective: 'm02-numpy-arrays-1',
          kind: 'recall',
          difficulty: 'easy',
          prompt:
            'Which property do all elements of a standard NumPy array share, unlike the items of a Python list?',
          options: [
            {
              id: 'a',
              text: 'They all have the same dtype, so each uses the same number of bytes',
              explanation:
                'Correct. One dtype per array is what lets NumPy store values side by side and compute on them in compiled code.',
            },
            {
              id: 'b',
              text: 'They are all separate Python objects that the array points to',
              explanation:
                'That describes a list. An array stores raw values in one block of memory.',
            },
            {
              id: 'c',
              text: 'They can be appended to cheaply without copying the array',
              explanation:
                'Arrays have a fixed size. Appending builds a new array and copies the old values.',
            },
            {
              id: 'd',
              text: 'They are always stored as 64-bit floats, whatever the input',
              explanation:
                'Arrays can hold many dtypes, including ints, bools and `float32`. They just all share one.',
            },
          ],
          answer: 'a',
        },
        {
          id: 'm02-numpy-arrays-q3',
          objective: 'm02-numpy-arrays-2',
          kind: 'concept',
          difficulty: 'medium',
          prompt: 'What is `np.arange(12).reshape(2, -1).shape`?',
          options: [
            {
              id: 'a',
              text: '`(2, 12)`',
              explanation:
                'That would need 24 elements. `reshape` must keep the element count at 12.',
            },
            {
              id: 'b',
              text: '`(2, -1)`',
              explanation:
                '`-1` is not stored. NumPy replaces it with whatever length makes the element count work.',
            },
            {
              id: 'c',
              text: '`(2, 6)`',
              explanation:
                'Correct. 12 elements with 2 rows leaves 6 per row, which NumPy fills in for `-1`.',
            },
            {
              id: 'd',
              text: '`(6, 2)`',
              explanation:
                'The known dimension stays where you put it: 2 is the first axis, so the inferred 6 is the second.',
            },
          ],
          answer: 'c',
        },
        {
          id: 'm02-numpy-arrays-q4',
          objective: 'm02-numpy-arrays-1',
          kind: 'concept',
          difficulty: 'medium',
          prompt: 'What is `np.array([1, 2, 3.5]).dtype`?',
          options: [
            {
              id: 'a',
              text: '`int64`, from the first element',
              explanation:
                'NumPy looks at all the inputs, not the first one. `int64` cannot hold 3.5.',
            },
            {
              id: 'b',
              text: '`float64`, a type that can hold every element',
              explanation:
                'Correct. An array has one dtype, so the ints are converted to floats alongside 3.5.',
            },
            {
              id: 'c',
              text: '`object`, because the elements have mixed types',
              explanation:
                'NumPy only falls back to `object` when no numeric type fits, such as for arbitrary Python objects. Ints and floats share `float64`.',
            },
            {
              id: 'd',
              text: 'A separate dtype for each element',
              explanation:
                'An ndarray has exactly one dtype for all its elements.',
            },
          ],
          answer: 'b',
        },
        {
          id: 'm02-numpy-arrays-q5',
          objective: 'm02-numpy-arrays-3',
          kind: 'concept',
          difficulty: 'hard',
          prompt:
            'What does this print? `x = np.arange(5); y = x[1:3]; y[0] = 50; print(x)`',
          options: [
            {
              id: 'a',
              text: '`[0 1 2 3 4]`',
              explanation:
                'This would be right for a Python list, whose slices are copies. A NumPy slice is a view.',
            },
            {
              id: 'b',
              text: '`[50 1 2 3 4]`',
              explanation:
                '`y[0]` is the first element of the slice, which is `x[1]`, not `x[0]`.',
            },
            {
              id: 'c',
              text: '`[ 0  1 50  3  4]`',
              explanation:
                'The slice `1:3` starts at index 1, so `y[0]` maps to `x[1]`.',
            },
            {
              id: 'd',
              text: '`[ 0 50  2  3  4]`',
              explanation:
                'Correct. `y` is a view starting at `x[1]`, so writing `y[0]` changes `x[1]`.',
            },
          ],
          answer: 'd',
        },
        {
          id: 'm02-numpy-arrays-q6',
          objective: 'm02-numpy-arrays-3',
          kind: 'concept',
          difficulty: 'medium',
          prompt:
            'Which of these produces an array that shares memory with `x`, so that writing to it changes `x`?',
          options: [
            {
              id: 'a',
              text: '`x.astype(np.float32)`',
              explanation:
                'Converting the dtype needs new memory with a different layout, so `astype` returns a copy.',
            },
            {
              id: 'b',
              text: '`x * 2`',
              explanation:
                'Arithmetic creates a new array to hold the results. It does not touch `x`.',
            },
            {
              id: 'c',
              text: '`x[2:5]`',
              explanation:
                'Correct. Basic slicing returns a view of the same memory.',
            },
            {
              id: 'd',
              text: '`x.copy()`',
              explanation:
                '`copy` exists exactly to give an array its own memory.',
            },
          ],
          answer: 'c',
        },
        {
          id: 'm02-numpy-arrays-q7',
          objective: 'm02-numpy-arrays-1',
          kind: 'application',
          difficulty: 'medium',
          prompt:
            'About how much memory does an embedding table of 1,000,000 rows × 768 columns of `float32` need?',
          options: [
            {
              id: 'a',
              text: 'About 768 MB',
              explanation:
                'This counts one byte per value. `float32` uses four.',
            },
            {
              id: 'b',
              text: 'About 3.1 GB',
              explanation:
                'Correct. 1,000,000 × 768 × 4 bytes = 3,072,000,000 bytes.',
            },
            {
              id: 'c',
              text: 'About 6.1 GB',
              explanation:
                'That is the `float64` size, at eight bytes per value.',
            },
            {
              id: 'd',
              text: 'About 24.6 GB',
              explanation:
                'This counts 32 bytes per value, as if the "32" in `float32` were bytes. It is 32 bits, which is 4 bytes.',
            },
          ],
          answer: 'b',
        },
        {
          id: 'm02-numpy-arrays-q8',
          objective: 'm02-numpy-arrays-3',
          kind: 'application',
          difficulty: 'hard',
          prompt:
            'Code runs `val = data[:1000]` and then `val -= val.mean(axis=0)`. Later, the first 1,000 rows of `data` are found centred too. What is the cause and the fix?',
          options: [
            {
              id: 'a',
              text: '`mean` changes its input in place; call `np.mean(val.copy())` instead',
              explanation:
                '`mean` never modifies its input. The write comes from `-=` acting on a view.',
            },
            {
              id: 'b',
              text: 'The slice is a view and `-=` writes in place; use `data[:1000].copy()`',
              explanation:
                'Correct. Slicing shares memory with `data`, and in-place subtraction writes into that memory. A copy gives `val` its own.',
            },
            {
              id: 'c',
              text: '`-=` always changes every array in the program; replace it with `=`',
              explanation:
                '`-=` changes only the memory of the array it is applied to. Here that memory belongs to `data` as well, because `val` is a view.',
            },
            {
              id: 'd',
              text: 'Integer slices are always copies; switch to a boolean mask',
              explanation:
                'It is the other way round: basic slices are views, and boolean masks make copies.',
            },
          ],
          answer: 'b',
        },
      ],
      takeaways: [
        'An ndarray is one block of same-typed values plus a shape; that is why it is fast and compact.',
        'Read `shape`, `ndim`, `size` and `dtype` first when debugging. Memory = elements × bytes per element.',
        '`reshape` keeps the element count; `-1` lets NumPy infer one dimension.',
        'Slices and most reshapes are views: writing to them changes the original. Use `.copy()` for independence.',
      ],
      references: [
        {
          title: 'NumPy: the absolute basics for beginners',
          publisher: 'NumPy',
          url: 'https://numpy.org/doc/stable/user/absolute_beginners.html',
          kind: 'source',
        },
        {
          title: 'What is NumPy?',
          publisher: 'NumPy',
          url: 'https://numpy.org/doc/stable/user/whatisnumpy.html',
          kind: 'source',
        },
        {
          title: 'Copies and views',
          publisher: 'NumPy',
          url: 'https://numpy.org/doc/stable/user/basics.copies.html',
          kind: 'source',
        },
        {
          title: 'Data type promotion in NumPy',
          publisher: 'NumPy',
          url: 'https://numpy.org/doc/stable/reference/arrays.promotion.html',
          kind: 'source',
        },
      ],
      reviewedAt: '2026-11-03',
    },

    // ------------------------------------------------------------------
    // Lesson 2
    // ------------------------------------------------------------------
    {
      slug: 'vectorization-broadcasting',
      title: 'Vectorization and broadcasting',
      summary:
        'Write whole-array expressions instead of Python loops, so the per-element work runs in compiled code. Broadcasting lets arrays of different shapes combine, following two simple rules, and explains most shape errors.',
      minutes: 15,
      label: 'foundational',
      objectives: [
        {
          id: 'm02-vectorization-broadcasting-1',
          text: 'replace a Python loop with a vectorized elementwise expression, and explain why it runs faster.',
        },
        {
          id: 'm02-vectorization-broadcasting-2',
          text: "apply NumPy's broadcasting rules to predict the result shape of an operation, or that it will fail.",
        },
        {
          id: 'm02-vectorization-broadcasting-3',
          text: 'diagnose and fix common shape errors by adding an axis with `[:, None]`, `reshape` or `keepdims`.',
        },
      ],
      concept: [
        {
          heading: 'Vectorization: let the loop run in C',
          blocks: [
            {
              type: 'text',
              md: md(
                'Arithmetic between arrays works **elementwise**: `a * b` multiplies matching elements, `a + 5` adds 5 to every element. You write one expression; NumPy runs the loop.',
                py(
                  'import numpy as np',
                  '',
                  'prices = np.array([10.0, 20.0, 30.0])',
                  'qty = np.array([1, 3, 2])',
                  'print(prices * qty)  # [10. 60. 60.]',
                  'print(prices + 5)    # [15. 25. 35.]',
                  'print((prices * qty).sum())  # 130.0',
                ),
                "This is called **vectorization**: no explicit loop in your Python code. The loop still happens, but inside NumPy's pre-compiled C code. Why that is so much faster:",
                '- A Python loop runs the interpreter for every element: fetch the next object, check its type, look up how to multiply it, create a new Python object for the result.\n- NumPy knows the dtype once for the whole array, so its compiled loop walks through raw values packed side by side in memory, with none of that per-element overhead.',
                py(
                  'values = np.random.default_rng(0).random(1_000_000)',
                  'as_list = values.tolist()',
                  '',
                  'slow = [v * 2.0 + 1.0 for v in as_list]  # Python loop',
                  'fast = values * 2.0 + 1.0                # vectorized',
                ),
                'In quick tests on a laptop, the vectorized line ran roughly 20 to 40 times faster than the list comprehension for these million values. The exact ratio depends on the machine and the operation, but tens of times faster is typical for simple arithmetic.',
              ),
            },
          ],
        },
        {
          heading: 'Broadcasting: combining different shapes',
          blocks: [
            {
              type: 'text',
              md: md(
                '`prices + 5` already combined an array with a single number. **Broadcasting** is the general rule behind it: how NumPy combines arrays whose shapes differ, by stretching size-1 dimensions without copying data.',
                'NumPy compares the two shapes **starting from the trailing (rightmost) dimension** and working left. Two dimensions are compatible when:',
                '1. they are equal, or\n2. one of them is 1.',
                'If one array has fewer dimensions, the missing ones on the left are treated as 1. The result takes the larger size in each position. If any pair is incompatible, NumPy raises `ValueError: operands could not be broadcast together`.',
                py(
                  '# shapes             compare from the right        result',
                  '# (4, 3) + (3,)      3 = 3, then 4 vs (missing=1)  (4, 3)',
                  '# (4, 1) + (3,)      1 vs 3, then 4 vs 1           (4, 3)',
                  '# (4, 3) + (4,)      3 vs 4: neither is 1          error',
                  '',
                  'X = np.ones((4, 3))',
                  'print((X + np.ones(3)).shape)       # (4, 3)',
                  'print((np.ones((4, 1)) + np.ones(3)).shape)  # (4, 3)',
                  'X + np.ones(4)',
                  '# ValueError: operands could not be broadcast together with shapes (4,3) (4,)',
                ),
                'The second case is worth a second look: a column `(4, 1)` and a row `(3,)` broadcast to a full `(4, 3)` grid, every combination of the two. That is how you build tables such as all pairwise sums.',
              ),
            },
            {
              type: 'terms',
              terms: [
                {
                  term: 'Elementwise',
                  definition:
                    'Applied to each pair of matching elements independently, as `a + b` does for two arrays of the same shape.',
                },
                {
                  term: 'Vectorization',
                  definition:
                    "Writing an operation over whole arrays so that the loop runs inside NumPy's compiled code instead of the Python interpreter.",
                },
                {
                  term: 'Broadcasting',
                  definition:
                    "NumPy's rule for combining arrays of different shapes: compare from the right, and dimensions must be equal or 1.",
                },
                {
                  term: 'ufunc',
                  definition:
                    'A NumPy "universal function" such as `np.add`, `np.exp` or `np.sqrt` that works elementwise and supports broadcasting.',
                },
                {
                  term: '`None` / `np.newaxis`',
                  definition:
                    'Used in an index to insert a dimension of size 1: `v[:, None]` turns shape `(n,)` into `(n, 1)`.',
                },
              ],
            },
          ],
        },
        {
          heading: 'Common shape errors and how to fix them',
          blocks: [
            {
              type: 'text',
              md: md(
                'Most shape bugs come from one fact: a 1-D array of length `n` broadcasts as a **row** `(1, n)`, never as a column. Per-column operations therefore work out of the box, and per-row operations need an extra axis.',
                py(
                  'X = np.random.default_rng(0).random((100, 3))  # 100 rows, 3 features',
                  '',
                  'col_means = X.mean(axis=0)  # shape (3,)',
                  'X - col_means               # (100, 3) - (3,): fine',
                  '',
                  'row_norms = np.linalg.norm(X, axis=1)  # shape (100,)',
                  'X / row_norms',
                  '# ValueError: operands could not be broadcast together with shapes (100,3) (100,)',
                  '',
                  'X / row_norms[:, None]           # (100, 3) / (100, 1): fine',
                  'X / row_norms.reshape(-1, 1)     # same thing',
                ),
                '`.T` does not help here: transposing a 1-D array returns it unchanged. You need a real second axis, from `[:, None]`, `reshape(-1, 1)`, or `keepdims=True` on the reduction (lesson 3).',
                'The nastiest case raises no error. If a matrix happens to be square, a per-row operation written without the extra axis broadcasts along the wrong direction and **silently gives wrong numbers**:',
                py(
                  'S = np.array([[1., 2., 3.], [4., 5., 6.], [7., 8., 9.]])',
                  'print(S.mean(axis=1))                    # [2. 5. 8.] (row means)',
                  'print(S - S.mean(axis=1))                # wrong: subtracts [2, 5, 8] from each row',
                  '# [[-1. -3. -5.]',
                  '#  [ 2.  0. -2.]',
                  '#  [ 5.  3.  1.]]',
                  'print(S - S.mean(axis=1, keepdims=True)) # right: each row centred',
                  '# [[-1.  0.  1.]',
                  '#  [-1.  0.  1.]',
                  '#  [-1.  0.  1.]]',
                ),
              ),
            },
            {
              type: 'example',
              title: 'Standardizing features in one line',
              md: md(
                'Many models train better when every feature has mean 0 and standard deviation 1. With broadcasting, this is one expression for any number of rows:',
                py(
                  'X = np.array([[1.0, 200.0], [2.0, 400.0], [3.0, 600.0]])',
                  'X_std = (X - X.mean(axis=0)) / X.std(axis=0)',
                  'print(X_std)',
                  '# [[-1.22474487 -1.22474487]',
                  '#  [ 0.          0.        ]',
                  '#  [ 1.22474487  1.22474487]]',
                ),
                'Shapes: `(3, 2)` minus `(2,)` divided by `(2,)`. Both statistics are per column, so they broadcast as rows across all three examples, with no loop over rows or features.',
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
              "Vectorized, broadcast expressions are how ML math is written: adding a bias vector to every row of a layer's output (`X @ W + b`, where `b` has shape `(units,)`), normalizing features, computing a loss over a whole batch at once. PyTorch and JAX follow the same broadcasting rules, so what you learn here carries straight over.",
              'Limits: broadcasting avoids copying the *inputs*, but the *result* still has the full broadcast shape. Computing all pairwise differences between 10,000 points of 128 values each with `A[:, None, :] - B[None, :, :]` builds a `(10000, 10000, 128)` array: about 102 GB as `float64`. In such cases, loop over chunks or use an identity that avoids the big intermediate. And a vectorized expression is only fast if every step stays inside NumPy; calling a Python function per element (`np.vectorize` included) brings the interpreter overhead back.',
            ),
          },
        ],
      },
      misconceptions: [
        {
          claim:
            'Vectorized code is faster because NumPy uses several CPU cores for every operation.',
          correction:
            'Basic elementwise operations usually run on a single core. The speed comes from running the loop in compiled code over typed, packed values instead of interpreting Python for every element.',
        },
        {
          claim:
            'Broadcasting lines shapes up from the left, so `(4, 3)` and `(4,)` combine row by row.',
          correction:
            'Shapes are compared from the right. `(4,)` is matched against the last dimension, 3, and fails. Reshape it to `(4, 1)` to apply it per row.',
        },
        {
          claim:
            'If an operation raises no shape error, the shapes must be right.',
          correction:
            'Broadcasting can succeed along the wrong axis, especially with square matrices. Check result shapes and a few values, and use `keepdims=True` to keep reductions aligned.',
        },
      ],
      questions: [
        {
          id: 'm02-vectorization-broadcasting-q1',
          objective: 'm02-vectorization-broadcasting-2',
          kind: 'recall',
          difficulty: 'easy',
          prompt:
            'Comparing shapes from the trailing dimension, when are two dimensions compatible for broadcasting?',
          options: [
            {
              id: 'a',
              text: 'When they are equal, or one of them is 1',
              explanation:
                "Correct. These are the two conditions in NumPy's broadcasting rules.",
            },
            {
              id: 'b',
              text: 'When one of them divides the other evenly',
              explanation:
                'NumPy does not tile arrays by divisibility. Sizes 2 and 4 are incompatible.',
            },
            {
              id: 'c',
              text: 'When both arrays have the same number of dimensions',
              explanation:
                'Arrays with different numbers of dimensions broadcast fine; missing dimensions count as 1.',
            },
            {
              id: 'd',
              text: 'When the first dimensions of both shapes are equal',
              explanation:
                'Comparison starts from the last (rightmost) dimension, not the first.',
            },
          ],
          answer: 'a',
        },
        {
          id: 'm02-vectorization-broadcasting-q2',
          objective: 'm02-vectorization-broadcasting-1',
          kind: 'recall',
          difficulty: 'easy',
          prompt:
            'Why is `values * 2.0 + 1.0` on a large NumPy array much faster than a Python loop over the same numbers?',
          options: [
            {
              id: 'a',
              text: 'NumPy skips elements whose results it can predict',
              explanation:
                'Every element is computed. NumPy does no prediction or skipping.',
            },
            {
              id: 'b',
              text: 'NumPy sends every operation to the GPU automatically',
              explanation:
                'NumPy runs on the CPU. GPU arrays need other libraries such as PyTorch or CuPy.',
            },
            {
              id: 'c',
              text: 'NumPy computes in lower precision than Python floats',
              explanation:
                'A `float64` array uses the same 64-bit precision as Python floats.',
            },
            {
              id: 'd',
              text: 'The loop runs in compiled code over typed values, not once per element in the interpreter',
              explanation:
                'Correct. Knowing the dtype for the whole array lets NumPy skip the per-element type checks and object creation that a Python loop pays for.',
            },
          ],
          answer: 'd',
        },
        {
          id: 'm02-vectorization-broadcasting-q3',
          objective: 'm02-vectorization-broadcasting-2',
          kind: 'concept',
          difficulty: 'medium',
          prompt: 'What is the shape of `np.ones((5, 1)) + np.ones((3,))`?',
          options: [
            {
              id: 'a',
              text: '`(5, 1)`',
              explanation:
                'The size-1 dimension is stretched to match the 3, so the result has 3 columns.',
            },
            {
              id: 'b',
              text: 'It raises an error because 5 and 3 differ',
              explanation:
                '5 is compared with a missing dimension (treated as 1), and 1 with 3. Both pairs are compatible.',
            },
            {
              id: 'c',
              text: '`(5, 3)`',
              explanation:
                'Correct. `(3,)` is treated as `(1, 3)`. Then 1 vs 3 gives 3, and 5 vs 1 gives 5.',
            },
            {
              id: 'd',
              text: '`(3, 5)`',
              explanation:
                'Dimensions keep their positions. The 5 from the first array stays first.',
            },
          ],
          answer: 'c',
        },
        {
          id: 'm02-vectorization-broadcasting-q4',
          objective: 'm02-vectorization-broadcasting-2',
          kind: 'concept',
          difficulty: 'medium',
          prompt:
            'An array has shape `(4, 3)`. Adding an array of which shape raises a broadcasting error?',
          options: [
            {
              id: 'a',
              text: '`(3,)`',
              explanation:
                'The trailing 3 matches, and the missing dimension counts as 1. Result `(4, 3)`.',
            },
            {
              id: 'b',
              text: '`(4,)`',
              explanation:
                'Correct. The trailing dimensions are 3 and 4: not equal, and neither is 1.',
            },
            {
              id: 'c',
              text: '`(4, 1)`',
              explanation: '1 stretches to 3 and 4 matches 4. Result `(4, 3)`.',
            },
            {
              id: 'd',
              text: '`(1, 3)`',
              explanation: '3 matches 3 and 1 stretches to 4. Result `(4, 3)`.',
            },
          ],
          answer: 'b',
        },
        {
          id: 'm02-vectorization-broadcasting-q5',
          objective: 'm02-vectorization-broadcasting-3',
          kind: 'concept',
          difficulty: 'hard',
          prompt:
            "`S` has shape `(3, 3)`. You want to subtract each row's mean from that row and write `S - S.mean(axis=1)`. What happens?",
          options: [
            {
              id: 'a',
              text: 'It raises a broadcasting error, because the means have shape `(3,)`',
              explanation:
                'For a square matrix the trailing sizes are both 3, so broadcasting succeeds. That is what makes this bug dangerous.',
            },
            {
              id: 'b',
              text: 'It centres each row correctly, because there is one mean per row',
              explanation:
                'A `(3,)` array broadcasts as a row, so mean *i* is subtracted from column *i*, not row *i*.',
            },
            {
              id: 'c',
              text: "It runs, but subtracts row *i*'s mean from column *i*, giving wrong values",
              explanation:
                'Correct. The `(3,)` means broadcast as `(1, 3)`. Use `S.mean(axis=1, keepdims=True)`, shape `(3, 1)`, to subtract per row.',
            },
            {
              id: 'd',
              text: 'It subtracts the mean of the whole matrix from every element',
              explanation:
                '`axis=1` computes three row means, not one overall mean.',
            },
          ],
          answer: 'c',
        },
        {
          id: 'm02-vectorization-broadcasting-q6',
          objective: 'm02-vectorization-broadcasting-1',
          kind: 'application',
          difficulty: 'medium',
          prompt:
            '`xs` is a NumPy array of a million floats, and `w` and `b` are floats. Which is the vectorized version of `[x * w + b for x in xs]`?',
          options: [
            {
              id: 'a',
              text: '`np.array([x * w + b for x in xs])`',
              explanation:
                'This still runs the Python loop for every element and only converts the result at the end.',
            },
            {
              id: 'b',
              text: '`xs * w + b`',
              explanation:
                'Correct. The scalars broadcast across the array, and the whole computation runs in compiled code.',
            },
            {
              id: 'c',
              text: '`np.vectorize(lambda x: x * w + b)(xs)`',
              explanation:
                'Despite its name, `np.vectorize` calls the Python function once per element. It is a convenience, not a speed-up.',
            },
            {
              id: 'd',
              text: '`sum(x * w + b for x in xs)`',
              explanation:
                'This adds all results into a single number and still loops in Python.',
            },
          ],
          answer: 'b',
        },
        {
          id: 'm02-vectorization-broadcasting-q7',
          objective: 'm02-vectorization-broadcasting-3',
          kind: 'application',
          difficulty: 'medium',
          prompt:
            '`X` has shape `(100, 3)` and `row_norms` has shape `(100,)`. `X / row_norms` raises a broadcasting error. Which fix divides each row by its own norm?',
          options: [
            {
              id: 'a',
              text: '`X / row_norms.T`',
              explanation:
                'Transposing a 1-D array returns the same `(100,)` shape, so the error stays.',
            },
            {
              id: 'b',
              text: '`X / row_norms[None, :]`',
              explanation:
                'This makes shape `(1, 100)`, a row. Its trailing 100 still clashes with the 3.',
            },
            {
              id: 'c',
              text: '`X.reshape(3, 100) / row_norms`',
              explanation:
                'This runs, but `reshape` does not transpose. It regroups the values in memory order, so rows and norms no longer line up.',
            },
            {
              id: 'd',
              text: '`X / row_norms[:, None]`',
              explanation:
                'Correct. Shape `(100, 1)` is a column: 100 matches the rows, and 1 stretches across the 3 columns.',
            },
          ],
          answer: 'd',
        },
        {
          id: 'm02-vectorization-broadcasting-q8',
          objective: 'm02-vectorization-broadcasting-2',
          kind: 'application',
          difficulty: 'hard',
          prompt:
            '`A` and `B` each hold 10,000 points of 128 `float64` values. What does `A[:, None, :] - B[None, :, :]` create?',
          options: [
            {
              id: 'a',
              text: 'A `(10000, 128)` array of about 10 MB, since broadcasting avoids copies',
              explanation:
                'Broadcasting avoids copying the inputs, but the result has the full broadcast shape.',
            },
            {
              id: 'b',
              text: 'A broadcasting error, because the inserted 1s do not line up',
              explanation:
                'Comparing `(10000, 1, 128)` with `(1, 10000, 128)` from the right: 128 = 128, 1 vs 10000, 10000 vs 1. All compatible.',
            },
            {
              id: 'c',
              text: 'A `(10000, 10000, 128)` array of about 102 GB',
              explanation:
                'Correct. 10,000 × 10,000 × 128 × 8 bytes is about 1.02 × 10^11 bytes, far more than most machines have.',
            },
            {
              id: 'd',
              text: 'A `(10000, 10000)` array of about 800 MB with one distance per pair',
              explanation:
                'Subtraction keeps the 128 values per pair. Getting one number per pair needs a further reduction over the last axis, after the big array exists.',
            },
          ],
          answer: 'c',
        },
      ],
      takeaways: [
        'Elementwise expressions on arrays run their loop in compiled code, typically tens of times faster than a Python loop.',
        'Broadcasting compares shapes from the right: dimensions must be equal or 1, and missing dimensions count as 1.',
        'A 1-D array broadcasts as a row. For per-row work add an axis with `[:, None]`, `reshape(-1, 1)` or `keepdims=True`.',
        'No error does not mean correct shapes: square arrays can broadcast along the wrong axis.',
        'Broadcast results take the full shape, so huge intermediates can exhaust memory.',
      ],
      references: [
        {
          title: 'Broadcasting',
          publisher: 'NumPy',
          url: 'https://numpy.org/doc/stable/user/basics.broadcasting.html',
          kind: 'source',
        },
        {
          title: 'What is NumPy? (vectorization)',
          publisher: 'NumPy',
          url: 'https://numpy.org/doc/stable/user/whatisnumpy.html',
          kind: 'source',
        },
        {
          title: 'numpy.vectorize (notes on performance)',
          publisher: 'NumPy',
          url: 'https://numpy.org/doc/stable/reference/generated/numpy.vectorize.html',
          kind: 'source',
        },
        {
          title: 'Universal functions (ufunc)',
          publisher: 'NumPy',
          url: 'https://numpy.org/doc/stable/reference/ufuncs.html',
          kind: 'further',
        },
      ],
      reviewedAt: '2026-11-03',
    },

    // ------------------------------------------------------------------
    // Lesson 3
    // ------------------------------------------------------------------
    {
      slug: 'indexing-and-aggregation',
      title: 'Indexing, masks and aggregations',
      summary:
        'Pick out rows, columns and blocks with slices, filter with boolean masks, gather with integer arrays, and summarise with `sum`, `mean` and `max` along an axis, keeping dimensions when you need to broadcast the result back.',
      minutes: 15,
      label: 'foundational',
      objectives: [
        {
          id: 'm02-indexing-and-aggregation-1',
          text: 'select rows, columns and sub-blocks of an array with integer indexes and slices, and predict the result shape.',
        },
        {
          id: 'm02-indexing-and-aggregation-2',
          text: 'filter and gather with boolean masks and integer-array (fancy) indexing, knowing that they return copies while assignment through them writes to the original.',
        },
        {
          id: 'm02-indexing-and-aggregation-3',
          text: 'aggregate with `sum`, `mean`, `max` and `argmax` along an axis, and predict the result shape with and without `keepdims`.',
        },
      ],
      concept: [
        {
          heading: 'Slicing in more than one dimension',
          blocks: [
            {
              type: 'text',
              md: md(
                'Indexing a 2-D array takes one entry per dimension, separated by commas: `X[row, column]`. Each entry can be a single integer, which picks one position and **removes that dimension**, or a slice `start:stop:step`, which keeps the dimension. Negative numbers count from the end.',
                py(
                  'import numpy as np',
                  '',
                  'X = np.arange(12).reshape(3, 4)',
                  '# [[ 0  1  2  3]',
                  '#  [ 4  5  6  7]',
                  '#  [ 8  9 10 11]]',
                  '',
                  'X[1]         # row 1: [4 5 6 7]',
                  'X[:, 2]      # column 2: [ 2  6 10]',
                  'X[0:2, 1:3]  # [[1 2] [5 6]]',
                  'X[1:, ::2]   # rows 1+, every other column: [[ 4  6] [ 8 10]]',
                  'X[-1, -1]    # 11',
                ),
                'Watch the shapes. `X[:, 2]` has shape `(3,)` because the integer 2 drops the column dimension. `X[:, 2:3]` holds the same values but has shape `(3, 1)`, because a slice keeps it. That difference decides how the result broadcasts later.',
                'As the first lesson showed, slices are **views**: writing to `X[0:2, 1:3]` changes `X`.',
              ),
            },
          ],
        },
        {
          heading: 'Boolean masks and fancy indexing',
          blocks: [
            {
              type: 'text',
              md: md(
                'A comparison on an array gives a **boolean mask** of the same shape. Indexing with the mask keeps the elements where it is `True`, returned as a 1-D array:',
                py(
                  'scores = np.array([0.2, 0.9, 0.55, 0.7])',
                  'mask = scores > 0.5',
                  'print(mask)          # [False  True  True  True]',
                  'print(scores[mask])  # [0.9  0.55 0.7 ]',
                  'print(scores[(scores > 0.5) & (scores < 0.8)])  # [0.55 0.7 ]',
                ),
                "Combine masks with `&` (and), `|` (or) and `~` (not), with parentheses around each comparison. Python's `and` and `or` do not work on arrays: they raise `ValueError: The truth value of an array with more than one element is ambiguous`.",
                '**Fancy indexing** uses an array or list of integer positions to gather elements in any order, with repeats allowed:',
                py(
                  'X[[0, 2]]          # rows 0 and 2: [[ 0  1  2  3] [ 8  9 10 11]]',
                  'X[[0, 2], [1, 3]]  # elements (0, 1) and (2, 3): [ 1 11]',
                ),
                'Unlike slices, **masks and fancy indexing always return a copy**: they pick arbitrary positions, which cannot be described as a regular view of the original memory. So changing the result leaves the original alone. **Assigning through** them is different: `x[mask] = value` writes straight into `x`.',
                py(
                  'rows = X[[0, 2]]',
                  'rows[0, 0] = 99',
                  'print(X[0, 0])   # 0  -- rows is a copy',
                  '',
                  'clipped = scores.copy()',
                  'clipped[clipped < 0.5] = 0.0  # assignment writes in place',
                  'print(clipped)   # [0.   0.9  0.55 0.7 ]',
                ),
              ),
            },
            {
              type: 'terms',
              terms: [
                {
                  term: 'Basic indexing',
                  definition:
                    'Integers and slices, as in `X[1:, ::2]`. Returns a view.',
                },
                {
                  term: 'Boolean mask',
                  definition:
                    'A `bool` array used as an index to keep elements where it is `True`. Returns a copy.',
                },
                {
                  term: 'Fancy indexing',
                  definition:
                    'Indexing with an array or list of integer positions, as in `X[[0, 2]]`. Returns a copy.',
                },
                {
                  term: 'Axis',
                  definition:
                    'One dimension of an array, numbered from 0. In a 2-D array, axis 0 runs down the rows and axis 1 across the columns.',
                },
                {
                  term: '`keepdims`',
                  definition:
                    'An option on reductions that keeps the reduced axis as size 1, so the result broadcasts against the input.',
                },
              ],
            },
          ],
        },
        {
          heading: 'Aggregating along an axis',
          blocks: [
            {
              type: 'text',
              md: md(
                'Reductions such as `sum`, `mean`, `max`, `min`, `std` and `argmax` (the position of the maximum) summarise an array. Without `axis` they reduce everything to one value. With `axis=k` they reduce **along** axis `k`, and that axis disappears from the result.',
                py(
                  'X.sum()               # 66',
                  'X.sum(axis=0)         # down the rows, one per column: [12 15 18 21]',
                  'X.sum(axis=1)         # across columns, one per row: [ 6 22 38]',
                  'X.max(axis=0)         # [ 8  9 10 11]',
                  "X.argmax(axis=1)      # [3 3 3], the column of each row's max",
                  'X.sum(axis=0).shape   # (4,)',
                ),
                'A reliable way to predict the shape: **cross out the axis you reduce**. `X` is `(3, 4)`; reducing axis 0 leaves `(4,)`, reducing axis 1 leaves `(3,)`. For a `(2, 3, 4)` array, `axis=1` leaves `(2, 4)`, and `axis=(0, 2)` leaves `(3,)`.',
                "With `keepdims=True`, the reduced axis stays as size 1 instead: `X.mean(axis=1, keepdims=True).shape` is `(3, 1)`. That shape broadcasts against `X` per row, which is exactly what the previous lesson's shape fixes needed.",
              ),
            },
            {
              type: 'example',
              title: 'From scores to predictions and accuracy',
              md: md(
                'A classifier outputs a score per class for each example. Indexing and reductions turn that into predictions and an accuracy number:',
                py(
                  'scores = np.array([[0.1, 0.7, 0.2],   # 4 examples, 3 classes',
                  '                   [0.8, 0.1, 0.1],',
                  '                   [0.3, 0.3, 0.4],',
                  '                   [0.5, 0.2, 0.3]])',
                  'labels = np.array([1, 0, 1, 0])',
                  '',
                  'preds = scores.argmax(axis=1)         # [1 0 2 0]',
                  'print((preds == labels).mean())       # 0.75',
                  'print(scores[preds != labels])        # the misclassified rows: [[0.3 0.3 0.4]]',
                  'probs = scores / scores.sum(axis=1, keepdims=True)  # each row sums to 1',
                ),
                '`preds == labels` is a boolean array, and its mean is the fraction of `True` values, because `True` counts as 1 and `False` as 0. The mask in the third line pulls out exactly the rows to inspect.',
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
              'These operations are the daily vocabulary of ML code: slicing a batch out of a dataset (`X[i:i + 32]`), choosing feature columns, masking out padding or invalid values, picking rows by a shuffled index array (`X[perm]`, fancy indexing), and reducing over the right axis to get per-example losses, per-feature statistics or a softmax denominator. pandas boolean filters (`df[df["temp"] > 10]`) are the same idea on labelled tables.',
              'Limits: fancy indexing and masks copy data, so on large arrays they cost memory and time; slices do not. With repeated indexes, an in-place update such as `x[[1, 1, 3]] += 1` adds to `x[1]` only once, not twice; use `np.add.at` when repeats must accumulate. And a reduction over the wrong axis rarely raises an error. Always check the result shape against what you meant.',
            ),
          },
        ],
      },
      misconceptions: [
        {
          claim: '`axis=0` means "sum each row".',
          correction:
            '`axis=0` reduces along the rows, collapsing them, so you get one value per column. Think of the axis you name as the one that disappears.',
        },
        {
          claim:
            'A boolean mask returns a view, so changing `x[x > 0]` after selecting it changes `x`.',
          correction:
            'Masks and fancy indexing return copies. Only assignment through the index itself, as in `x[x > 0] = 0`, writes into `x`.',
        },
        {
          claim: "Masks can be combined with Python's `and` and `or`.",
          correction:
            'Those keywords need a single True or False, and arrays raise an "ambiguous truth value" error. Use `&`, `|` and `~`, with parentheses around each comparison.',
        },
      ],
      questions: [
        {
          id: 'm02-indexing-and-aggregation-q1',
          objective: 'm02-indexing-and-aggregation-3',
          kind: 'recall',
          difficulty: 'easy',
          prompt:
            '`X` has shape `(3, 4)`. What is the shape of `X.sum(axis=0)`?',
          options: [
            {
              id: 'a',
              text: '`(3,)`',
              explanation:
                'That is the result of `axis=1`, one value per row. `axis=0` removes the row dimension instead.',
            },
            {
              id: 'b',
              text: '`(1, 4)`',
              explanation:
                'You get this only with `keepdims=True`. By default the reduced axis is removed.',
            },
            {
              id: 'c',
              text: '`(4,)`',
              explanation:
                'Correct. Summing along axis 0 collapses the 3 rows, leaving one value for each of the 4 columns.',
            },
            {
              id: 'd',
              text: '`()`, a single number',
              explanation:
                'That is `X.sum()` with no axis, which reduces over every dimension.',
            },
          ],
          answer: 'c',
        },
        {
          id: 'm02-indexing-and-aggregation-q2',
          objective: 'm02-indexing-and-aggregation-2',
          kind: 'recall',
          difficulty: 'easy',
          prompt:
            'Which kind of indexing always returns a copy rather than a view?',
          options: [
            {
              id: 'a',
              text: 'Indexing with an array of integer positions, such as `x[[0, 2]]`',
              explanation:
                'Correct. Fancy indexing, like boolean masks, always returns a copy.',
            },
            {
              id: 'b',
              text: 'Slicing with a step, such as `x[::2]`',
              explanation:
                'A step is still basic slicing. NumPy describes it with a stride over the same memory, so it is a view.',
            },
            {
              id: 'c',
              text: 'Slicing a range of rows, such as `x[1:3]`',
              explanation: 'Basic slices are views of the original memory.',
            },
            {
              id: 'd',
              text: 'Selecting one row with an integer, such as `x[0]` on a 2-D array',
              explanation:
                'A single integer is basic indexing. On a 2-D array, `x[0]` is a view of that row.',
            },
          ],
          answer: 'a',
        },
        {
          id: 'm02-indexing-and-aggregation-q3',
          objective: 'm02-indexing-and-aggregation-1',
          kind: 'concept',
          difficulty: 'medium',
          prompt:
            'With `X = np.arange(12).reshape(3, 4)`, what is `X[1:, ::2]`?',
          options: [
            {
              id: 'a',
              text: '`[[ 0  2] [ 4  6] [ 8 10]]`',
              explanation:
                'This keeps every row. `1:` starts at row 1, so row 0 is dropped.',
            },
            {
              id: 'b',
              text: '`[[ 4  6] [ 8 10]]`',
              explanation:
                'Correct. Rows 1 and 2, then columns 0 and 2 from each.',
            },
            {
              id: 'c',
              text: '`[[ 5  7] [ 9 11]]`',
              explanation:
                'This takes columns 1 and 3. A step slice `::2` starts at column 0.',
            },
            {
              id: 'd',
              text: '`[[4 5] [8 9]]`',
              explanation:
                'This takes the first two columns. `::2` means every second column, not the first two.',
            },
          ],
          answer: 'b',
        },
        {
          id: 'm02-indexing-and-aggregation-q4',
          objective: 'm02-indexing-and-aggregation-1',
          kind: 'concept',
          difficulty: 'medium',
          prompt:
            '`X` has shape `(3, 4)`. What are the shapes of `X[:, 1]` and `X[:, 1:2]`?',
          options: [
            {
              id: 'a',
              text: 'Both `(3,)`',
              explanation:
                'A slice keeps its dimension even when it covers one position, so `X[:, 1:2]` is 2-D.',
            },
            {
              id: 'b',
              text: 'Both `(3, 1)`',
              explanation:
                'A single integer index removes its dimension, so `X[:, 1]` is 1-D.',
            },
            {
              id: 'c',
              text: '`(1, 3)` and `(3, 1)`',
              explanation:
                'An integer index does not turn a column into a row. It removes the column dimension, leaving `(3,)`.',
            },
            {
              id: 'd',
              text: '`(3,)` and `(3, 1)`',
              explanation:
                'Correct. The integer drops the column dimension; the one-wide slice keeps it.',
            },
          ],
          answer: 'd',
        },
        {
          id: 'm02-indexing-and-aggregation-q5',
          objective: 'm02-indexing-and-aggregation-2',
          kind: 'concept',
          difficulty: 'medium',
          prompt:
            'What does this print? `a = np.array([3, -1, 4, -5]); a[a < 0] = 0; print(a)`',
          options: [
            {
              id: 'a',
              text: '`[3 0 4 0]`',
              explanation:
                'Correct. Assignment through a mask writes into the original array at the `True` positions.',
            },
            {
              id: 'b',
              text: '`[3 -1 4 -5]`',
              explanation:
                'Reading `a[a < 0]` gives a copy, but assigning to `a[a < 0]` writes into `a` itself.',
            },
            {
              id: 'c',
              text: '`[3 4]`',
              explanation:
                'Assignment does not remove elements. The array keeps its length; only the values change.',
            },
            {
              id: 'd',
              text: '`[0 0]`',
              explanation:
                'That is the selected part after assignment. `print(a)` shows the whole array.',
            },
          ],
          answer: 'a',
        },
        {
          id: 'm02-indexing-and-aggregation-q6',
          objective: 'm02-indexing-and-aggregation-2',
          kind: 'concept',
          difficulty: 'hard',
          prompt:
            'What does this print? `a = np.arange(5); b = a[[1, 2]]; b[0] = 99; print(a)`',
          options: [
            {
              id: 'a',
              text: '`[ 0 99  2  3  4]`',
              explanation:
                'This would happen if `b` were a view. Fancy indexing returns a copy.',
            },
            {
              id: 'b',
              text: '`[99  1  2  3  4]`',
              explanation:
                '`b[0]` corresponds to `a[1]`, not `a[0]`, and in any case `b` is a copy.',
            },
            {
              id: 'c',
              text: '`[0 1 2 3 4]`',
              explanation:
                'Correct. `a[[1, 2]]` makes a new array, so changing `b` leaves `a` as it was.',
            },
            {
              id: 'd',
              text: 'It raises an error because `b` is read-only',
              explanation:
                'The copy is an ordinary writable array. It is just not connected to `a`.',
            },
          ],
          answer: 'c',
        },
        {
          id: 'm02-indexing-and-aggregation-q7',
          objective: 'm02-indexing-and-aggregation-3',
          kind: 'application',
          difficulty: 'medium',
          prompt:
            '`preds` and `labels` are integer arrays of the same length. Which expression gives the fraction of correct predictions?',
          options: [
            {
              id: 'a',
              text: '`(preds == labels).sum()`',
              explanation:
                'This counts the correct predictions. You still need to divide by the number of examples.',
            },
            {
              id: 'b',
              text: '`preds.mean() == labels.mean()`',
              explanation:
                'Matching averages does not mean matching predictions, and this gives a single True or False.',
            },
            {
              id: 'c',
              text: '`(preds - labels).mean()`',
              explanation:
                'Class ids are labels, not quantities. Differences can cancel out, so this is not accuracy.',
            },
            {
              id: 'd',
              text: '`(preds == labels).mean()`',
              explanation:
                'Correct. The comparison gives a boolean array, and its mean is the share of `True` values.',
            },
          ],
          answer: 'd',
        },
        {
          id: 'm02-indexing-and-aggregation-q8',
          objective: 'm02-indexing-and-aggregation-3',
          kind: 'application',
          difficulty: 'hard',
          prompt:
            '`scores` has shape `(32, 10)` with non-negative values: 32 examples, 10 classes. Which expression scales each row so that it sums to 1?',
          options: [
            {
              id: 'a',
              text: '`scores / scores.sum(axis=1)`',
              explanation:
                'The row sums have shape `(32,)`, which broadcasts as a row against 10 columns and raises a shape error.',
            },
            {
              id: 'b',
              text: '`scores / scores.sum(axis=0, keepdims=True)`',
              explanation:
                'This runs, but it divides by column totals, so each column sums to 1 instead of each row.',
            },
            {
              id: 'c',
              text: '`scores / scores.sum(axis=1, keepdims=True)`',
              explanation:
                'Correct. The row sums keep shape `(32, 1)`, which broadcasts across the 10 columns of each row.',
            },
            {
              id: 'd',
              text: '`scores / scores.sum()`',
              explanation:
                'This divides by the total of all 320 values, so the whole array sums to 1, not each row.',
            },
          ],
          answer: 'c',
        },
      ],
      takeaways: [
        'An integer index removes a dimension; a slice keeps it. `X[:, 2]` is `(3,)`, `X[:, 2:3]` is `(3, 1)`.',
        'Slices are views; boolean masks and fancy indexing return copies, but assigning through them writes to the original.',
        'Combine masks with `&`, `|` and `~`, with parentheses, never `and`/`or`.',
        'A reduction with `axis=k` removes axis `k`; `keepdims=True` keeps it as size 1 so the result broadcasts back.',
      ],
      references: [
        {
          title: 'Indexing on ndarrays',
          publisher: 'NumPy',
          url: 'https://numpy.org/doc/stable/user/basics.indexing.html',
          kind: 'source',
        },
        {
          title: 'numpy.sum (axis and keepdims)',
          publisher: 'NumPy',
          url: 'https://numpy.org/doc/stable/reference/generated/numpy.sum.html',
          kind: 'source',
        },
        {
          title: 'Copies and views',
          publisher: 'NumPy',
          url: 'https://numpy.org/doc/stable/user/basics.copies.html',
          kind: 'source',
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
      id: 'm02-numpy-essentials-x1',
      objective: 'm02-numpy-arrays-3',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'What does this print? `x = np.arange(6); v = x[2:]; v[v > 3] = 0; print(x)`',
      options: [
        {
          id: 'a',
          text: '`[0 1 2 3 4 5]`',
          explanation:
            '`v` is a slice, so it is a view of `x`, and the masked assignment writes into that shared memory.',
        },
        {
          id: 'b',
          text: '`[0 1 0 0 0 0]`',
          explanation:
            'The mask is `v > 3`, so only the values 4 and 5 are set to 0. The 2 and 3 stay.',
        },
        {
          id: 'c',
          text: '`[0 1 2 3 0 0]`',
          explanation:
            'Correct. The slice is a view, and assigning through the mask writes 0 into the positions holding 4 and 5, which are part of `x`.',
        },
        {
          id: 'd',
          text: '`[2 3 0 0]`',
          explanation:
            'That is `v` after the assignment. `x` still has all six elements.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'm02-numpy-essentials-x2',
      objective: 'm02-vectorization-broadcasting-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        "`X` has shape `(4, 3)`. Which expression subtracts each row's mean from that row?",
      options: [
        {
          id: 'a',
          text: '`X - X.mean(axis=0)`',
          explanation:
            'This subtracts column means, centring each column, not each row.',
        },
        {
          id: 'b',
          text: '`X - X.mean(axis=1)`',
          explanation:
            'The row means have shape `(4,)`, which is compared with the trailing 3 and raises a broadcasting error.',
        },
        {
          id: 'c',
          text: '`X - X.mean()`',
          explanation:
            'This subtracts one overall mean from every element. Rows are not centred individually.',
        },
        {
          id: 'd',
          text: '`X - X.mean(axis=1, keepdims=True)`',
          explanation:
            'Correct. `keepdims` gives the row means shape `(4, 1)`, which broadcasts across the 3 columns of each row.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'm02-numpy-essentials-x3',
      objective: 'm02-numpy-arrays-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt: 'What are the values and dtype of `np.array([1, 2, 3]) / 2`?',
      options: [
        {
          id: 'a',
          text: '`[0 1 1]`, dtype `int64`',
          explanation:
            'That is floor division, `//`. The `/` operator always does true division.',
        },
        {
          id: 'b',
          text: '`[0.5 1.  1.5]`, dtype `float64`',
          explanation:
            'Correct. True division of integers produces floats, applied elementwise to the whole array.',
        },
        {
          id: 'c',
          text: '`[0.5 1.  1.5]`, dtype `int64`',
          explanation:
            'An `int64` array cannot hold 0.5. The result needs a float dtype.',
        },
        {
          id: 'd',
          text: 'It raises an error because the array holds integers',
          explanation:
            'Dividing an integer array by a number is allowed; NumPy picks a float result dtype.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'm02-numpy-essentials-x4',
      objective: 'm02-indexing-and-aggregation-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'With `X = np.arange(12).reshape(3, 4)`, what is `X[[0, 2]].sum(axis=1)`?',
      options: [
        {
          id: 'a',
          text: '`[ 6 38]`',
          explanation:
            'Correct. `X[[0, 2]]` gathers rows `[0 1 2 3]` and `[8 9 10 11]`, and `axis=1` sums each row.',
        },
        {
          id: 'b',
          text: '`[ 8 10 12 14]`',
          explanation:
            'This sums the two gathered rows column by column, which is `axis=0`.',
        },
        {
          id: 'c',
          text: '`[ 6 22 38]`',
          explanation:
            'This sums all three rows of `X`. The fancy index kept only rows 0 and 2.',
        },
        {
          id: 'd',
          text: '`44`',
          explanation:
            'This adds every gathered element into one number, which is `.sum()` with no axis. `axis=1` keeps one total per row.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'm02-numpy-essentials-x5',
      objective: 'm02-indexing-and-aggregation-3',
      kind: 'concept',
      difficulty: 'easy',
      prompt: 'What is `np.arange(6).reshape(2, 3).max(axis=0)`?',
      options: [
        {
          id: 'a',
          text: '`[2 5]`',
          explanation: 'This is the maximum of each row, which is `axis=1`.',
        },
        {
          id: 'b',
          text: '`5`',
          explanation:
            'That is the maximum of the whole array, with no axis given.',
        },
        {
          id: 'c',
          text: '`[0 1 2]`',
          explanation:
            'This is the first row, the column-wise minimum rather than the maximum.',
        },
        {
          id: 'd',
          text: '`[3 4 5]`',
          explanation:
            'Correct. The rows are `[0 1 2]` and `[3 4 5]`; `axis=0` compares them column by column.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'm02-numpy-essentials-x6',
      objective: 'm02-vectorization-broadcasting-2',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'Let `o = np.arange(3).reshape(3, 1) * np.arange(4)`. What are `o.shape` and `o[2, 3]`?',
      options: [
        {
          id: 'a',
          text: '`(3, 1)` and an `IndexError`',
          explanation:
            'The size-1 dimension stretches to 4, so `o` has 4 columns and `o[2, 3]` exists.',
        },
        {
          id: 'b',
          text: '`(3, 4)` and `6`',
          explanation:
            'Correct. `(3, 1)` and `(4,)` broadcast to `(3, 4)`, and `o[i, j]` is `i * j`, so `o[2, 3]` is 2 × 3.',
        },
        {
          id: 'c',
          text: '`(4, 3)` and `6`',
          explanation:
            'Dimensions keep their positions: the 3 from the first array stays first.',
        },
        {
          id: 'd',
          text: 'It raises an error because 3 and 4 differ',
          explanation:
            'From the right, 1 vs 4 and 3 vs a missing dimension (1) are both compatible.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'm02-numpy-essentials-x7',
      objective: 'm02-vectorization-broadcasting-1',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'Which line is the vectorized replacement for a Python loop that adds up only the positive values of the array `arr`?',
      options: [
        {
          id: 'a',
          text: '`sum(v for v in arr if v > 0)`',
          explanation:
            'This gives the right total, but it is still a Python loop over every element.',
        },
        {
          id: 'b',
          text: '`arr.sum() > 0`',
          explanation:
            'This sums everything and then compares, giving a single True or False.',
        },
        {
          id: 'c',
          text: '`arr[arr > 0].sum()`',
          explanation:
            'Correct. The mask, the selection and the sum all run inside NumPy, with no Python loop.',
        },
        {
          id: 'd',
          text: '`(arr > 0).sum()`',
          explanation:
            'This sums the boolean mask, which counts the positive values instead of adding them.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'm02-numpy-essentials-x8',
      objective: 'm02-numpy-arrays-1',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        '`a = np.zeros((1000, 1000), dtype=np.float32)`, then `b = a * 2.0` in NumPy 2. How many bytes does `b` use?',
      options: [
        {
          id: 'a',
          text: '0, because `b` is a view of `a`',
          explanation:
            'Arithmetic like `a * 2.0` produces a new array with its own memory. Views come from operations such as basic slicing and reshaping.',
        },
        {
          id: 'b',
          text: '8,000,000, because the float `2.0` promotes the result to `float64`',
          explanation:
            "In NumPy 2, a Python float does not raise the precision: the array's dtype, `float32`, decides the result.",
        },
        {
          id: 'c',
          text: '1,000,000, one byte per element',
          explanation: 'A `float32` element is 32 bits, which is 4 bytes.',
        },
        {
          id: 'd',
          text: '4,000,000, a new `float32` array',
          explanation:
            'Correct. One million elements at 4 bytes each. The Python scalar keeps the `float32` dtype, and the result gets its own memory.',
        },
      ],
      answer: 'd',
    },
  ],
}
