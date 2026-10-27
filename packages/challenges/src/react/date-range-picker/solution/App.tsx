import { useEffect, useRef, useState, type KeyboardEvent } from "react";

type Props = {
  // "YYYY-MM", e.g. "2026-02". Defaults to the current month.
  initialMonth?: string;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAY_MS = 24 * 60 * 60 * 1000;

// Always build dates from local parts: never parse an ISO string into a Date.
const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const keyOf = (d: Date) =>
  d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();
// Count days through UTC so a DST change in between can't skew the result.
const utcDay = (d: Date) =>
  Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS;
const fullName = (d: Date) =>
  `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
const shortName = (d: Date) =>
  `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;

function parseMonth(value?: string) {
  if (value) {
    const [y, m] = value.split("-").map(Number);
    return new Date(y, m - 1, 1);
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

const KEY_DELTAS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

export default function App({ initialMonth }: Props) {
  // The day with tabindex 0; its month is the month on screen.
  const [active, setActive] = useState(() => parseMonth(initialMonth));
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const dayRefs = useRef(new Map<number, HTMLButtonElement>());
  const focusPending = useRef(false);

  const year = active.getFullYear();
  const month = active.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = new Date(year, month, 1).getDay(); // 0 = Sunday

  // Move focus after the new month (if any) has rendered.
  useEffect(() => {
    if (!focusPending.current) return;
    focusPending.current = false;
    dayRefs.current.get(keyOf(active))?.focus();
  }, [active]);

  function changeMonth(delta: number) {
    setActive(new Date(year, month + delta, 1));
  }

  function pick(day: Date) {
    setActive(day);
    if (!start || end) {
      setStart(day);
      setEnd(null);
    } else if (keyOf(day) < keyOf(start)) {
      setEnd(start);
      setStart(day);
    } else {
      setEnd(day);
    }
  }

  // Enter and Space need no handler: they click the focused button.
  function onKeyDown(e: KeyboardEvent) {
    const delta = KEY_DELTAS[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    focusPending.current = true;
    setActive(addDays(active, delta));
  }

  const isSelected = (day: Date) => {
    if (!start) return false;
    const k = keyOf(day);
    return k >= keyOf(start) && k <= keyOf(end ?? start);
  };

  // Leading blanks, then the days, padded to whole weeks.
  const slots: (Date | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(year, month, i + 1),
    ),
  ];
  while (slots.length % 7) slots.push(null);
  const weeks = Array.from({ length: slots.length / 7 }, (_, w) =>
    slots.slice(w * 7, w * 7 + 7),
  );

  let output = "Pick a start date";
  let nights: number | null = null;
  if (start && !end) output = "Pick an end date";
  if (start && end) {
    output = `${shortName(start)} – ${shortName(end)}`;
    nights = utcDay(end) - utcDay(start);
  }

  return (
    <div>
      <div>
        <button
          data-testid="prev-month"
          aria-label="Previous month"
          onClick={() => changeMonth(-1)}
        >
          ‹
        </button>
        <h2 id="month-label" data-testid="month-label">
          {MONTHS[month]} {year}
        </h2>
        <button
          data-testid="next-month"
          aria-label="Next month"
          onClick={() => changeMonth(1)}
        >
          ›
        </button>
      </div>
      <div role="grid" aria-labelledby="month-label" onKeyDown={onKeyDown}>
        <div role="row">
          {WEEKDAYS.map((d) => (
            <span key={d} role="columnheader">
              {d}
            </span>
          ))}
        </div>
        {weeks.map((week, w) => (
          <div key={w} role="row">
            {week.map((day, i) =>
              day ? (
                <button
                  key={i}
                  ref={(el) => {
                    if (el) dayRefs.current.set(keyOf(day), el);
                    else dayRefs.current.delete(keyOf(day));
                  }}
                  role="gridcell"
                  aria-label={fullName(day)}
                  aria-selected={isSelected(day)}
                  tabIndex={keyOf(day) === keyOf(active) ? 0 : -1}
                  onClick={() => pick(day)}
                >
                  {day.getDate()}
                </button>
              ) : (
                <span key={i} />
              ),
            )}
          </div>
        ))}
      </div>
      <p data-testid="range-output">{output}</p>
      {nights !== null && (
        <p data-testid="nights">
          {nights} {nights === 1 ? "night" : "nights"}
        </p>
      )}
    </div>
  );
}
