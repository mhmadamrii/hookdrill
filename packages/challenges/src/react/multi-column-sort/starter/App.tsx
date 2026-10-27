import { TASKS } from "./tasks";

export default function App() {
  // TODO: click a header to sort by that column (again to reverse),
  // shift+click to add it as a tie-breaker, show each sorted column's rank,
  // mark the primary column with aria-sort, and reset with Clear sort.
  // See the requirements for the data-testid each element needs.

  return (
    <div>
      <button data-testid="clear-sort">Clear sort</button>
      <table>
        <thead>
          <tr>
            <th>
              <button data-testid="sort-title">Title</button>
            </th>
            <th>
              <button data-testid="sort-priority">Priority</button>
            </th>
            <th>
              <button data-testid="sort-due">Due</button>
            </th>
            <th>
              <button data-testid="sort-assignee">Assignee</button>
            </th>
          </tr>
        </thead>
        <tbody>
          {TASKS.map((t) => (
            <tr key={t.id} data-testid="row" data-id={t.id}>
              <td>{t.title}</td>
              <td>{t.priority}</td>
              <td>{t.due ?? "—"}</td>
              <td>{t.assignee ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
