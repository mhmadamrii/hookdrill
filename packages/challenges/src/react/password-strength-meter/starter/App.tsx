const RULES = [
  { id: "length", label: "At least 8 characters" },
  { id: "number", label: "A number" },
  { id: "uppercase", label: "An uppercase letter" },
  { id: "symbol", label: "A symbol" },
];

export default function App() {
  // TODO: keep the password in state, check each rule as the user types,
  // rate the strength, and make the Show/Hide button work.
  // See the requirements for the data-testid and attributes each element needs.

  return (
    <div>
      <label>
        Password
        <input data-testid="password-input" type="password" />
      </label>
      <button data-testid="visibility-toggle">Show</button>
      <ul>
        {RULES.map((rule) => (
          <li
            key={rule.id}
            data-testid="rule"
            data-rule={rule.id}
            data-met="false"
          >
            {rule.label}
          </li>
        ))}
      </ul>
      <p data-testid="strength">Weak</p>
    </div>
  );
}
