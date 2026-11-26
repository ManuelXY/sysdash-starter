type NoMatchProps = {
  query: string;
};

// Shown in a section when the search hides all of its tiles.
export default function NoMatch({ query }: NoMatchProps) {
  return <p className="text-sm text-ink-muted">No tile here matches “{query.trim()}”.</p>;
}
