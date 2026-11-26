// Pure function: does a tile title match the search text?
// Upper/lower case and spaces around the text are ignored.
// An empty search matches everything, so all tiles are shown.
export function matchesQuery(title: string, query: string): boolean {
  return title.toLowerCase().includes(query.trim().toLowerCase());
}
