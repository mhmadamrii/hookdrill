import { useEffect, useRef, useState, type KeyboardEvent } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function App() {
  const [open, setOpen] = useState(false);
  const [savedName, setSavedName] = useState("Anonymous");
  const [draft, setDraft] = useState("");
  const opener = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const wasOpen = useRef(false);

  // Focus the field on open; hand focus back to the opener on close.
  useEffect(() => {
    if (open) input.current?.focus();
    else if (wasOpen.current) opener.current?.focus();
    wasOpen.current = open;
  }, [open]);

  function openDialog() {
    setDraft(savedName === "Anonymous" ? "" : savedName);
    setOpen(true);
  }

  function save() {
    if (draft.trim()) setSavedName(draft.trim());
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      setOpen(false);
      return;
    }
    if (e.key !== "Tab" || !dialog.current) return;
    const items = [...dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || !dialog.current.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div>
      {/* `inert` takes the page out of focus and the accessibility tree. */}
      <div
        data-testid="page"
        inert={open || undefined}
        aria-hidden={open || undefined}
      >
        <h1>Profile</h1>
        <p>
          Display name: <span data-testid="saved-name">{savedName}</span>
        </p>
        <button ref={opener} data-testid="open-button" onClick={openDialog}>
          Edit name
        </button>
        <a href="#help">Help</a>
      </div>

      {open && (
        <div
          data-testid="backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgb(0 0 0 / 0.4)",
          }}
          onMouseDown={(e) => {
            // Only a press on the backdrop itself, not inside the dialog.
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            onKeyDown={onKeyDown}
            style={{
              background: "white",
              margin: "20vh auto",
              padding: 16,
              maxWidth: 360,
            }}
          >
            <h2 id="dialog-title">Edit display name</h2>
            <button
              data-testid="close-button"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <label>
              Name
              <input
                ref={input}
                data-testid="name-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") save();
                }}
              />
            </label>
            <button data-testid="cancel-button" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button data-testid="save-button" onClick={save}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
