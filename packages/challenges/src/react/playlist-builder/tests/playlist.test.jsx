import React from "react";
import { render, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";
import { SONGS } from "../songs.js";

// Sandpack's in-browser Jest renders into the iframe's real DOM but exposes
// jsdom globals, so user-event must be pointed at the real `document`.
// Queries are scoped to the rendered container because the sandbox entry
// may also mount the app into the same document.
function setup() {
  const user = userEvent.setup({ document });
  const { container } = render(<App />);
  return { user, view: within(container) };
}

const [A, B, C] = SONGS.map((s) => s.title);

function libraryItem(view, title) {
  return view
    .getAllByTestId("library-item")
    .find(
      (el) => within(el).getByTestId("song-title").textContent.trim() === title,
    );
}

async function addSongs(user, view, ...titles) {
  for (const title of titles) {
    await user.click(
      within(libraryItem(view, title)).getByTestId("add-button"),
    );
  }
}

function playlist(view) {
  return view
    .queryAllByTestId("playlist-item")
    .map((el) => within(el).getByTestId("song-title").textContent.trim());
}

function buttons(view, index) {
  const item = within(view.getAllByTestId("playlist-item")[index]);
  return {
    up: item.getByTestId("move-up-button"),
    down: item.getByTestId("move-down-button"),
    remove: item.getByTestId("remove-button"),
  };
}

afterEach(cleanup);

describe("Playlist Builder", () => {
  it("adds songs to the end of the playlist in click order", async () => {
    const { user, view } = setup();
    expect(view.getByTestId("playlist-empty")).toBeTruthy();

    await addSongs(user, view, C, A);

    expect(playlist(view)).toEqual([C, A]);
    expect(view.queryByTestId("playlist-empty")).toBeNull();
  });

  it("disables Add for a song already in the playlist", async () => {
    const { user, view } = setup();
    await addSongs(user, view, A);
    const addA = within(libraryItem(view, A)).getByTestId("add-button");

    expect(addA.disabled).toBe(true);
    expect(
      within(libraryItem(view, B)).getByTestId("add-button").disabled,
    ).toBe(false);
    await user.click(addA);
    expect(playlist(view)).toEqual([A]);
  });

  it("moves a song up", async () => {
    const { user, view } = setup();
    await addSongs(user, view, A, B, C);
    await user.click(buttons(view, 2).up);

    expect(playlist(view)).toEqual([A, C, B]);
  });

  it("moves a song down", async () => {
    const { user, view } = setup();
    await addSongs(user, view, A, B, C);
    await user.click(buttons(view, 0).down);

    expect(playlist(view)).toEqual([B, A, C]);
  });

  it("disables Up on the first item and Down on the last item", async () => {
    const { user, view } = setup();
    await addSongs(user, view, A);
    expect(buttons(view, 0).up.disabled).toBe(true);
    expect(buttons(view, 0).down.disabled).toBe(true);

    await addSongs(user, view, B, C);
    expect(buttons(view, 0).up.disabled).toBe(true);
    expect(buttons(view, 0).down.disabled).toBe(false);
    expect(buttons(view, 1).up.disabled).toBe(false);
    expect(buttons(view, 1).down.disabled).toBe(false);
    expect(buttons(view, 2).up.disabled).toBe(false);
    expect(buttons(view, 2).down.disabled).toBe(true);
  });

  it("updates the disabled buttons after reordering", async () => {
    const { user, view } = setup();
    await addSongs(user, view, A, B);
    await user.click(buttons(view, 1).up);

    expect(playlist(view)).toEqual([B, A]);
    expect(buttons(view, 0).up.disabled).toBe(true);
    expect(buttons(view, 0).down.disabled).toBe(false);
    expect(buttons(view, 1).up.disabled).toBe(false);
    expect(buttons(view, 1).down.disabled).toBe(true);
  });

  it("removes a song and lets it be added again", async () => {
    const { user, view } = setup();
    await addSongs(user, view, A, B);
    await user.click(buttons(view, 0).remove);

    expect(playlist(view)).toEqual([B]);
    expect(
      within(libraryItem(view, A)).getByTestId("add-button").disabled,
    ).toBe(false);

    await user.click(buttons(view, 0).remove);
    expect(view.getByTestId("playlist-empty")).toBeTruthy();

    await addSongs(user, view, A);
    expect(playlist(view)).toEqual([A]);
  });
});
