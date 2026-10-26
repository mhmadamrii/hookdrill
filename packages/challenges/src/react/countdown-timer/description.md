Build a countdown timer in `App.tsx` (default export `App`).

## Requirements

- **Duration**: a number input sets how many seconds to count down from. It starts at 60. While the timer isn't running, changing it updates the display straight away.
- **Display**: show the remaining time as `mm:ss` with leading zeros, e.g. `01:30` for 90 seconds and `00:05` for 5.
- **Start**: counts down by one second, once per second. Use `setInterval` or `setTimeout` for the ticks.
- **Pause**: stops the countdown where it is. **Start** again resumes from there.
- **Time's up**: at `00:00` the timer stops (it never goes below zero) and shows a "Time's up!" message. The message isn't shown before that.
- **Reset**: stops the timer and goes back to the chosen duration.
- **Disabled states**: **Start** is `disabled` while running, **Pause** is `disabled` while not running.
- **Clean up**: clear your interval or timeout when the timer stops and when the component unmounts.

## Required `data-testid` selectors

| Test id         | Element                                              |
| --------------- | ---------------------------------------------------- |
| `seconds-input` | the duration input, in seconds                       |
| `time`          | the remaining time as `mm:ss`                        |
| `start-button`  | starts or resumes the countdown                      |
| `pause-button`  | pauses the countdown                                 |
| `reset-button`  | stops and goes back to the duration                  |
| `done-message`  | "Time's up!", rendered only once the timer reaches 0 |
