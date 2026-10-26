import { FAQ } from "./faq";

export default function App() {
  // TODO: track which section is open. Only one can be open at a time.
  // See the requirements for the data-testid and aria attributes each element needs.

  return (
    <div>
      <h1>FAQ</h1>
      {FAQ.map((item) => (
        <div key={item.id} data-testid="accordion-item">
          <button data-testid="accordion-trigger" aria-expanded={false}>
            {item.question}
          </button>
        </div>
      ))}
    </div>
  );
}
