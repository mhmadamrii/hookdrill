import { useState } from "react";

const RULES = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (p: string) => p.length >= 8,
  },
  { id: "number", label: "A number", test: (p: string) => /\d/.test(p) },
  {
    id: "uppercase",
    label: "An uppercase letter",
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    id: "symbol",
    label: "A symbol",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

function strength(met: number) {
  if (met === 4) return "Strong";
  if (met >= 2) return "Medium";
  return "Weak";
}

export default function App() {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const met = RULES.filter((rule) => rule.test(password)).length;

  return (
    <div>
      <label>
        Password
        <input
          data-testid="password-input"
          type={visible ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button
        data-testid="visibility-toggle"
        onClick={() => setVisible(!visible)}
      >
        {visible ? "Hide" : "Show"}
      </button>
      <ul>
        {RULES.map((rule) => (
          <li
            key={rule.id}
            data-testid="rule"
            data-rule={rule.id}
            data-met={String(rule.test(password))}
          >
            {rule.label}
          </li>
        ))}
      </ul>
      <p data-testid="strength">{strength(met)}</p>
    </div>
  );
}
