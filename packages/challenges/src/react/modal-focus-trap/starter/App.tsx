import { useState } from "react";

export default function App() {
  const [open, setOpen] = useState(false);
  // TODO: make the dialog accessible. Move focus in when it opens, trap Tab
  // and Shift+Tab inside it, close on Escape, Cancel, × and the backdrop,
  // hide the page behind it, and give focus back to the opener on close.
  // See the requirements for the data-testid each element needs.

  return (
    <div>
      <div data-testid="page">
        <h1>Profile</h1>
        <p>
          Display name: <span data-testid="saved-name">Anonymous</span>
        </p>
        <button data-testid="open-button" onClick={() => setOpen(true)}>
          Edit name
        </button>
        <a href="#help">Help</a>
      </div>

      {open && (
        <div data-testid="backdrop">
          <div>
            <h2>Edit display name</h2>
            <button data-testid="close-button" aria-label="Close">
              ×
            </button>
            <label>
              Name
              <input data-testid="name-input" />
            </label>
            <button data-testid="cancel-button">Cancel</button>
            <button data-testid="save-button">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
