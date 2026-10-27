import React from "react";
import { render, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

type View = ReturnType<typeof within>;

// Sandpack's in-browser Jest renders into the iframe's real DOM but exposes
// jsdom globals, so user-event must be pointed at the real `document`.
// `delay: null` skips user-event's setTimeout between actions: browsers throttle
// timers in background tabs, which would otherwise slow runs to a crawl.
// Queries are scoped to the rendered container because the sandbox entry
// may also mount the app into the same document.
function setup() {
  const user = userEvent.setup({ document, delay: null });
  const { container } = render(<App />);
  const view = within(container);
  const click = (id: string) => user.click(view.getByTestId(id));
  return { user, view, click };
}

const names = (view: View) =>
  view.queryAllByTestId("entry").map((e) => e.getAttribute("data-name"));
const status = (view: View) =>
  (view.getByTestId("sort-status").textContent ?? "").trim();

const FOLDERS_AZ = ["archive", "Chapter 9", "chapter 10", "Photos"];
const FILES_AZ = [
  ".env",
  "file1.txt",
  "file2.txt",
  "file10.txt",
  "img7.png",
  "img007.png",
  "img10.png",
  "README.md",
  "résumé.pdf",
  "resume.txt",
];

afterEach(cleanup);

// Every test must fail against starter/App.tsx and pass against solution/App.tsx.
describe("Natural Sort File List", () => {
  it("starts sorted by name, A to Z, with folders first", () => {
    const { view } = setup();
    expect(names(view)).toEqual([...FOLDERS_AZ, ...FILES_AZ]);
    expect(status(view)).toBe("Name, A to Z");
  });

  it("compares numbers inside names by value", () => {
    const { view } = setup();
    const all = names(view);
    // Text comparison would put file10 before file2, and "chapter 10" before "Chapter 9".
    expect(all.filter((n) => n?.startsWith("file"))).toEqual([
      "file1.txt",
      "file2.txt",
      "file10.txt",
    ]);
    expect(all.filter((n) => n?.toLowerCase().startsWith("chapter"))).toEqual([
      "Chapter 9",
      "chapter 10",
    ]);
  });

  it("ignores case, accents and leading zeros", () => {
    const { view } = setup();
    const all = names(view);
    // Case-sensitive comparison puts README.md and Photos before lowercase names;
    // code-point comparison puts résumé after resume (é > e).
    expect(all.filter((n) => n?.toLowerCase().startsWith("r"))).toEqual([
      "README.md",
      "résumé.pdf",
      "resume.txt",
    ]);
    // img7 and img007 are equal, so they keep their original order; img10 is after both.
    expect(all.filter((n) => n?.startsWith("img"))).toEqual([
      "img7.png",
      "img007.png",
      "img10.png",
    ]);
    // Folders lead even though ".env" would win on name alone.
    expect(all.slice(0, 5)).toEqual([...FOLDERS_AZ, ".env"]);
  });

  it("toggles to Z to A with folders still first and ties kept in order", async () => {
    const { view, click } = setup();
    await click("sort-name");
    expect(names(view)).toEqual([
      "Photos",
      "chapter 10",
      "Chapter 9",
      "archive",
      "resume.txt",
      "résumé.pdf",
      "README.md",
      "img10.png",
      // Equal names keep their original order: reversing the A to Z list would swap these.
      "img7.png",
      "img007.png",
      "file10.txt",
      "file2.txt",
      "file1.txt",
      ".env",
    ]);
    expect(status(view)).toBe("Name, Z to A");

    await click("sort-name");
    expect(names(view)).toEqual([...FOLDERS_AZ, ...FILES_AZ]);
    expect(status(view)).toBe("Name, A to Z");
  });

  it("sorts files by size, keeping folders first by name", async () => {
    const { view, click } = setup();
    await click("sort-size");
    // file1.txt and resume.txt are both 2048 B: name breaks the tie
    // (resume.txt comes first in the data, so a stable sort alone is not enough).
    expect(names(view)).toEqual([
      ...FOLDERS_AZ,
      "file10.txt",
      ".env",
      "file2.txt",
      "file1.txt",
      "resume.txt",
      "README.md",
      "img7.png",
      "img007.png",
      "résumé.pdf",
      "img10.png",
    ]);
    expect(status(view)).toBe("Size, smallest first");

    await click("sort-size");
    // Folders stay A to Z; equal sizes stay A to Z.
    expect(names(view)).toEqual([
      ...FOLDERS_AZ,
      "img10.png",
      "résumé.pdf",
      "img007.png",
      "img7.png",
      "README.md",
      "file1.txt",
      "resume.txt",
      "file2.txt",
      ".env",
      "file10.txt",
    ]);
    expect(status(view)).toBe("Size, largest first");
  });

  it("switches back from size to name, A to Z", async () => {
    const { view, click } = setup();
    await click("sort-size");
    await click("sort-size");
    await click("sort-name");
    expect(names(view)).toEqual([...FOLDERS_AZ, ...FILES_AZ]);
    expect(status(view)).toBe("Name, A to Z");

    await click("sort-name");
    await click("sort-size");
    expect(status(view)).toBe("Size, smallest first");
    expect(names(view).slice(4, 6)).toEqual(["file10.txt", ".env"]);
  });
});
