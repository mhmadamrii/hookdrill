import { useRef, useState, type KeyboardEvent } from "react";
import { TABS } from "./tabs";

const enabled = TABS.filter((t) => !t.disabled);

export default function App() {
  const [selectedId, setSelectedId] = useState(enabled[0].id);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const selected = TABS.find((t) => t.id === selectedId)!;

  // Selection follows focus ("automatic activation").
  function select(id: string) {
    setSelectedId(id);
    tabRefs.current.get(id)?.focus();
  }

  function onKeyDown(e: KeyboardEvent) {
    const i = enabled.findIndex((t) => t.id === selectedId);
    const next: Record<string, number> = {
      ArrowRight: (i + 1) % enabled.length,
      ArrowLeft: (i - 1 + enabled.length) % enabled.length,
      Home: 0,
      End: enabled.length - 1,
    };
    if (!(e.key in next)) return;
    e.preventDefault();
    select(enabled[next[e.key]].id);
  }

  return (
    <div>
      <div role="tablist" aria-label="Product details" onKeyDown={onKeyDown}>
        {TABS.map((tab) => {
          const isSelected = tab.id === selectedId;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
                else tabRefs.current.delete(tab.id);
              }}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isSelected ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => select(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`panel-${selected.id}`}
        aria-labelledby={`tab-${selected.id}`}
        tabIndex={0}
      >
        {selected.content}
      </div>
    </div>
  );
}
