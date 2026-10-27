import { PEOPLE } from "./people";

export default function App() {
  // TODO: sort by a column when its header is clicked (again to reverse),
  // mark the sorted column with aria-sort, and filter rows by name.
  // See the requirements for the data-testid each element needs.

  return (
    <div>
      <input data-testid="filter-input" placeholder="Filter by name" />
      <p data-testid="result-count">
        Showing {PEOPLE.length} of {PEOPLE.length}
      </p>
      <table>
        <thead>
          <tr>
            <th>
              <button data-testid="sort-name">Name</button>
            </th>
            <th>
              <button data-testid="sort-age">Age</button>
            </th>
            <th>City</th>
            <th>
              <button data-testid="sort-joined">Joined</button>
            </th>
          </tr>
        </thead>
        <tbody>
          {PEOPLE.map((p) => (
            <tr key={p.id} data-testid="row" data-id={p.id}>
              <td>{p.name}</td>
              <td>{p.age}</td>
              <td>{p.city}</td>
              <td>{p.joined}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
