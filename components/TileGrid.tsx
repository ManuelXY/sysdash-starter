import type { ReactNode } from "react";

type TileGridProps = {
  children: ReactNode;
};

// Responsive grid for tiles:
// 1 column on phones, 2 from 768 px (md), 3 from 1280 px (xl).
// A list (<ul>) tells screen readers how many tiles there are.
// role="list" keeps that meaning in Safari although list bullets are removed.
export default function TileGrid({ children }: TileGridProps) {
  return (
    <ul role="list" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {children}
    </ul>
  );
}
