export type Person = {
  id: number;
  name: string;
  age: number;
  city: string;
  /** ISO date, YYYY-MM-DD. */
  joined: string;
};

export const PEOPLE: Person[] = [
  { id: 1, name: "Maya Chen", age: 34, city: "Toronto", joined: "2021-03-14" },
  { id: 2, name: "bruno costa", age: 9, city: "Lisbon", joined: "2023-11-02" },
  { id: 3, name: "Aisha Bello", age: 100, city: "Lagos", joined: "2019-07-21" },
  { id: 4, name: "Lukas Weber", age: 27, city: "Berlin", joined: "2023-01-09" },
  { id: 5, name: "zoe Martin", age: 41, city: "Paris", joined: "2020-05-30" },
  { id: 6, name: "Diego Ramos", age: 27, city: "Bogotá", joined: "2022-08-17" },
  { id: 7, name: "Hana Sato", age: 52, city: "Osaka", joined: "2018-12-05" },
  { id: 8, name: "Omar Haddad", age: 19, city: "Amman", joined: "2024-02-29" },
];
