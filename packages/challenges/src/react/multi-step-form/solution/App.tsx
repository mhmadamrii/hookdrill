import { useState, type FormEvent } from "react";

type Plan = "free" | "pro";
type Values = { email: string; password: string; name: string; plan: Plan };
type Errors = Partial<Record<keyof Values, string>>;

const PLAN_LABELS: Record<Plan, string> = { free: "Free", pro: "Pro" };
const STEPS = ["Account", "Profile", "Review"];

function validate(step: number, v: Values): Errors {
  const errors: Errors = {};
  if (step === 0) {
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim()))
      errors.email = "Enter a valid email.";
    if (v.password.length < 8) errors.password = "Use at least 8 characters.";
  }
  if (step === 1 && !v.name.trim()) errors.name = "Enter your name.";
  return errors;
}

export default function App() {
  // One object for every step, so going Back never loses what was typed.
  const [values, setValues] = useState<Values>({
    email: "",
    password: "",
    name: "",
    plan: "free",
  });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  const set = <K extends keyof Values>(key: K, value: Values[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  function next() {
    const found = validate(step, values);
    setErrors(found);
    if (Object.keys(found).length === 0) setStep((s) => s + 1);
  }

  function back() {
    setErrors({});
    setStep((s) => s - 1);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (step < STEPS.length - 1) return next();
    setDone(true);
  }

  if (done) {
    return (
      <p data-testid="success-message">
        Welcome aboard, {values.name.trim()}! Your {PLAN_LABELS[values.plan]}{" "}
        account is ready.
      </p>
    );
  }

  const field = (key: keyof Values) => ({
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });

  return (
    <form onSubmit={submit} noValidate>
      <p data-testid="step-indicator">
        Step {step + 1} of {STEPS.length}
      </p>
      <h2>{STEPS[step]}</h2>

      {step === 0 && (
        <>
          <label>
            Email
            <input
              data-testid="email-input"
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              {...field("email")}
            />
          </label>
          {errors.email && (
            <p id="email-error" data-testid="email-error">
              {errors.email}
            </p>
          )}
          <label>
            Password
            <input
              data-testid="password-input"
              type="password"
              value={values.password}
              onChange={(e) => set("password", e.target.value)}
              {...field("password")}
            />
          </label>
          {errors.password && (
            <p id="password-error" data-testid="password-error">
              {errors.password}
            </p>
          )}
        </>
      )}

      {step === 1 && (
        <>
          <label>
            Name
            <input
              data-testid="name-input"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              {...field("name")}
            />
          </label>
          {errors.name && (
            <p id="name-error" data-testid="name-error">
              {errors.name}
            </p>
          )}
          <label>
            Plan
            <select
              data-testid="plan-select"
              value={values.plan}
              onChange={(e) => set("plan", e.target.value as Plan)}
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
            </select>
          </label>
        </>
      )}

      {step === 2 && (
        <dl>
          <dt>Email</dt>
          <dd data-testid="review-email">{values.email.trim()}</dd>
          <dt>Name</dt>
          <dd data-testid="review-name">{values.name.trim()}</dd>
          <dt>Plan</dt>
          <dd data-testid="review-plan">{PLAN_LABELS[values.plan]}</dd>
        </dl>
      )}

      {step > 0 && (
        <button data-testid="back-button" type="button" onClick={back}>
          Back
        </button>
      )}
      {step < STEPS.length - 1 ? (
        <button data-testid="next-button" type="button" onClick={next}>
          Next
        </button>
      ) : (
        <button data-testid="submit-button" type="submit">
          Create account
        </button>
      )}
    </form>
  );
}
