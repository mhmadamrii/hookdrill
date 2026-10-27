import { TABS } from "./tabs";

export default function App() {
  // TODO: turn this into accessible tabs: roles and ARIA attributes, one
  // selected tab, a roving tabindex, and arrow/Home/End keys that move focus.
  // See the requirements for what the tests check.
  const selected = TABS[0];

  return (
    <div>
      <div>
        {TABS.map((tab) => (
          <button key={tab.id} disabled={tab.disabled}>
            {tab.label}
          </button>
        ))}
      </div>
      <div>{selected.content}</div>
    </div>
  );
}
