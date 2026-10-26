import { useState } from "react";
import { FAQ } from "./faq";

export default function App() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      <h1>FAQ</h1>
      {FAQ.map((item) => {
        const open = openId === item.id;
        const panelId = `panel-${item.id}`;
        return (
          <div key={item.id} data-testid="accordion-item">
            <button
              data-testid="accordion-trigger"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenId(open ? null : item.id)}
            >
              {item.question}
            </button>
            {open && (
              <div id={panelId} data-testid="accordion-panel">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
