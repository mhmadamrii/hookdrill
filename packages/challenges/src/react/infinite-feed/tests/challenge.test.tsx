import React from "react";
import {
  act,
  render,
  within,
  cleanup,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import type { Page } from "../api";

type View = ReturnType<typeof within>;

// A fake fetchPage whose answers the test releases by hand.
function controlledFetch() {
  const calls: Array<{
    cursor: string | null;
    resolve: (page: Page) => Promise<void>;
    reject: () => Promise<void>;
  }> = [];
  const fetchPage = (cursor: string | null) =>
    new Promise<Page>((res, rej) => {
      calls.push({
        cursor,
        resolve: (page) => act(async () => res(page)),
        reject: () => act(async () => rej(new Error("Network error"))),
      });
    });
  return { fetchPage, calls };
}

const page = (ids: number[], nextCursor: string | null): Page => ({
  items: ids.map((id) => ({ id, author: "Ada", text: `Post ${id}` })),
  nextCursor,
});

// Sandpack's in-browser Jest renders into the iframe's real DOM but exposes
// jsdom globals, so user-event must be pointed at the real `document`.
// `delay: null` skips user-event's setTimeout between actions: browsers throttle
// timers in background tabs, which would otherwise slow runs to a crawl.
// Queries are scoped to the rendered container because the sandbox entry
// may also mount the app into the same document.
function setup() {
  const { fetchPage, calls } = controlledFetch();
  const user = userEvent.setup({ document, delay: null });
  const utils = render(<App fetchPage={fetchPage} />);
  const view = within(utils.container);
  return { user, view, calls, unmount: utils.unmount };
}

const postIds = (view: View) =>
  view.queryAllByTestId("post").map((p) => p.getAttribute("data-id"));
const loadMore = (view: View) =>
  view.getByTestId("load-more") as HTMLButtonElement;

afterEach(cleanup);

describe("Infinite Feed", () => {
  it("fetches the first page on mount and shows loading", async () => {
    const { view, calls } = setup();
    expect(calls.map((c) => c.cursor)).toEqual([null]);
    expect(view.queryByTestId("loading")).not.toBeNull();
    expect(postIds(view)).toEqual([]);

    await calls[0].resolve(page([1, 2, 3], "c2"));
    expect(view.queryByTestId("loading")).toBeNull();
    expect(postIds(view)).toEqual(["1", "2", "3"]);
    expect(loadMore(view).disabled).toBe(false);
    expect(calls.length).toBe(1);
  });

  it("loads the next page with the last cursor and appends it", async () => {
    const { user, view, calls } = setup();
    await calls[0].resolve(page([1, 2], "c2"));

    await user.click(loadMore(view));
    expect(calls.map((c) => c.cursor)).toEqual([null, "c2"]);
    expect(view.queryByTestId("loading")).not.toBeNull();
    expect(postIds(view)).toEqual(["1", "2"]);

    await calls[1].resolve(page([3, 4], "c3"));
    expect(postIds(view)).toEqual(["1", "2", "3", "4"]);
    expect(view.queryByTestId("loading")).toBeNull();

    await user.click(loadMore(view));
    expect(calls.map((c) => c.cursor)).toEqual([null, "c2", "c3"]);
  });

  it("sends only one request at a time", async () => {
    const { user, view, calls } = setup();
    await calls[0].resolve(page([1, 2], "c2"));

    await user.click(loadMore(view));
    expect(loadMore(view).disabled).toBe(true);
    await user.click(loadMore(view));
    fireEvent.click(loadMore(view));
    expect(calls.length).toBe(2);

    await calls[1].resolve(page([3], "c3"));
    expect(loadMore(view).disabled).toBe(false);
    expect(calls.length).toBe(2);
  });

  it("skips posts that are already shown", async () => {
    const { user, view, calls } = setup();
    await calls[0].resolve(page([1, 2, 3], "c2"));
    await user.click(loadMore(view));
    await calls[1].resolve(page([3, 4, 5], "c3"));
    expect(postIds(view)).toEqual(["1", "2", "3", "4", "5"]);

    await user.click(loadMore(view));
    await calls[2].resolve(page([5, 6], "c4"));
    expect(postIds(view)).toEqual(["1", "2", "3", "4", "5", "6"]);
  });

  it("shows the end of the feed when there is no next cursor", async () => {
    const { user, view, calls } = setup();
    await calls[0].resolve(page([1, 2], "c2"));
    expect(view.queryByTestId("end-message")).toBeNull();

    await user.click(loadMore(view));
    await calls[1].resolve(page([3], null));
    expect(postIds(view)).toEqual(["1", "2", "3"]);
    expect(view.queryByTestId("end-message")).not.toBeNull();
    expect(view.queryByTestId("load-more")).toBeNull();
    expect(view.queryByTestId("loading")).toBeNull();
    expect(calls.length).toBe(2);
  });

  it("shows an error and retries the same cursor, keeping loaded posts", async () => {
    const { user, view, calls } = setup();
    await calls[0].resolve(page([1, 2], "c2"));
    await user.click(loadMore(view));
    await calls[1].reject();

    expect(view.queryByTestId("error")).not.toBeNull();
    expect(view.queryByTestId("loading")).toBeNull();
    expect(postIds(view)).toEqual(["1", "2"]);

    await user.click(view.getByTestId("retry-button"));
    expect(calls.map((c) => c.cursor)).toEqual([null, "c2", "c2"]);
    expect(view.queryByTestId("error")).toBeNull();
    expect(view.queryByTestId("loading")).not.toBeNull();

    await calls[2].resolve(page([3], "c3"));
    expect(postIds(view)).toEqual(["1", "2", "3"]);
  });

  it("retries the first page and ignores answers after unmount", async () => {
    const { user, view, calls, unmount } = setup();
    await calls[0].reject();
    expect(view.queryByTestId("error")).not.toBeNull();

    await user.click(view.getByTestId("retry-button"));
    expect(calls.map((c) => c.cursor)).toEqual([null, null]);

    const errors = jest.spyOn(console, "error").mockImplementation(() => {});
    try {
      unmount();
      await calls[1].resolve(page([1], "c2"));
      expect(errors).not.toHaveBeenCalled();
    } finally {
      errors.mockRestore();
    }
  });
});
