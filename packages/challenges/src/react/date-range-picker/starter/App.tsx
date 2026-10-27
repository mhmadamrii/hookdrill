type Props = {
  // "YYYY-MM", e.g. "2026-02". Defaults to the current month.
  initialMonth?: string;
};

export default function App({ initialMonth }: Props) {
  // TODO: build the calendar for initialMonth: a Sunday-first grid of day
  // buttons (role="gridcell", named like "February 14, 2026"), month
  // navigation, click-to-pick a range, and arrow keys with a roving tabindex.
  // See the requirements for what the tests check.
  void initialMonth;

  return (
    <div>
      <div>
        <button data-testid="prev-month" aria-label="Previous month">
          ‹
        </button>
        <h2 data-testid="month-label">Month YYYY</h2>
        <button data-testid="next-month" aria-label="Next month">
          ›
        </button>
      </div>
      <div role="grid" aria-labelledby="month-label">
        {/* one role="row" per week, one day button per day */}
      </div>
      <p data-testid="range-output">Pick a start date</p>
    </div>
  );
}
