import React from "react";
import { render, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";

// Sandpack's in-browser Jest renders into the iframe's real DOM but exposes
// jsdom globals, so user-event must be pointed at the real `document`.
// Queries are scoped to the rendered container because the sandbox entry
// may also mount the app into the same document.
function setup() {
  const user = userEvent.setup({ document });
  const { container } = render(<App />);
  return { user, view: within(container) };
}

async function addTodo(user, view, text) {
  await user.type(view.getByTestId("todo-input"), text);
  await user.click(view.getByTestId("add-button"));
}

function texts(view) {
  return view.queryAllByTestId("todo-text").map((el) => el.textContent.trim());
}

afterEach(cleanup);

describe("Todo List", () => {
  it("adds a todo with the Add button and with Enter", async () => {
    const { user, view } = setup();
    await addTodo(user, view, "Buy milk");
    await user.type(view.getByTestId("todo-input"), "Walk dog{Enter}");

    expect(view.getAllByTestId("todo-item")).toHaveLength(2);
    expect(texts(view)).toEqual(["Buy milk", "Walk dog"]);
    expect(view.getByTestId("todo-input").value).toBe("");
  });

  it("ignores empty and whitespace-only input", async () => {
    const { user, view } = setup();
    await addTodo(user, view, "Buy milk");
    await user.click(view.getByTestId("add-button"));
    await addTodo(user, view, "   ");

    expect(texts(view)).toEqual(["Buy milk"]);
  });

  it("deletes a todo", async () => {
    const { user, view } = setup();
    await addTodo(user, view, "Buy milk");
    const item = view.getByTestId("todo-item");
    await user.click(within(item).getByTestId("delete-button"));

    expect(view.queryAllByTestId("todo-item")).toHaveLength(0);
  });

  it("edits a todo and saves the new text", async () => {
    const { user, view } = setup();
    await addTodo(user, view, "Buy milk");
    const item = view.getByTestId("todo-item");
    await user.click(within(item).getByTestId("edit-button"));

    const input = view.getByTestId("edit-input");
    await user.clear(input);
    await user.type(input, "Buy oat milk");
    await user.click(view.getByTestId("save-button"));

    expect(view.queryByTestId("edit-input")).toBeNull();
    expect(texts(view)).toEqual(["Buy oat milk"]);
  });

  it("toggles a todo done and undone", async () => {
    const { user, view } = setup();
    await addTodo(user, view, "Buy milk");
    const item = () => view.getByTestId("todo-item");

    expect(item().getAttribute("data-done")).toBe("false");
    await user.click(within(item()).getByTestId("toggle-button"));
    expect(item().getAttribute("data-done")).toBe("true");
    await user.click(within(item()).getByTestId("toggle-button"));
    expect(item().getAttribute("data-done")).toBe("false");
  });

  it("keeps the other todos intact after a delete", async () => {
    const { user, view } = setup();
    await addTodo(user, view, "One");
    await addTodo(user, view, "Two");
    await addTodo(user, view, "Three");
    await user.click(
      within(view.getAllByTestId("todo-item")[1]).getByTestId("toggle-button"),
    );

    await user.click(
      within(view.getAllByTestId("todo-item")[0]).getByTestId("delete-button"),
    );

    const items = view.getAllByTestId("todo-item");
    expect(texts(view)).toEqual(["Two", "Three"]);
    expect(items[0].getAttribute("data-done")).toBe("true");
    expect(items[1].getAttribute("data-done")).toBe("false");
  });
});
