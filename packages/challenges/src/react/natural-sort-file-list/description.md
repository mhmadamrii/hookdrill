Build a file list in `App.tsx` (default export `App`) that sorts names the way people expect: `file2.txt` before `file10.txt`. The entries are given in `files.ts`.

## Requirements

- **Folders first**: folders are always listed before files, in every sort mode and direction.
- **Natural name order**: names compare exactly like `new Intl.Collator("en", { numeric: true, sensitivity: "base" }).compare`. In practice:
  - runs of digits compare by **numeric value**: `file1.txt` < `file2.txt` < `file10.txt`, and `Chapter 9` < `chapter 10`;
  - **leading zeros are ignored**: `img7.png` and `img007.png` compare **equal** (both come before `img10.png`);
  - **case and accents are ignored**: `README.md` < `résumé.pdf` < `resume.txt` (`résumé` and `resume` tie, so the extension decides);
  - punctuation sorts before digits and letters, so `.env` comes first.
- **Ties**: entries whose names compare equal keep their original order from `FILES`, in **both** directions.
- **Start**: the list starts sorted by name, A to Z.
- **Name button**: clicking `sort-name` toggles between A to Z and Z to A. Z to A is the same comparison flipped (it is not the A to Z list reversed, so ties still keep their original order). From a size mode, it switches to A to Z.
- **Size button**: clicking `sort-size` sorts files by size, smallest first; clicking it again switches to largest first, and back. Files of equal size are ordered by name, A to Z. Folders have no size: they stay first, ordered by name A to Z, in both size directions. From a name mode, it switches to smallest first.
- **Status**: `sort-status` shows the current mode as exactly one of `Name, A to Z`, `Name, Z to A`, `Size, smallest first` or `Size, largest first`.

## Required `data-testid` selectors

| Test id       | Element                                                          |
| ------------- | ---------------------------------------------------------------- |
| `sort-name`   | button that sorts by name / toggles the name direction           |
| `sort-size`   | button that sorts files by size / toggles the size direction     |
| `sort-status` | the current mode text                                            |
| `entry`       | one element per file or folder, with `data-name` set to its name |
