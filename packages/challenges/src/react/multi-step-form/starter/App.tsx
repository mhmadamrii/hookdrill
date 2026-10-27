export default function App() {
  // TODO: three steps (Account, Profile, Review) with validation on Next,
  // Back that keeps what was typed, and a success message on Submit.
  // See the requirements for the data-testid each element needs.

  return (
    <form>
      <p data-testid="step-indicator">Step 1 of 3</p>
      <h2>Account</h2>
      <label>
        Email
        <input data-testid="email-input" type="email" />
      </label>
      <label>
        Password
        <input data-testid="password-input" type="password" />
      </label>
      <button data-testid="next-button" type="button">
        Next
      </button>
    </form>
  );
}
