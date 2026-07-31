"use client";

import { useMemo, useState } from "react";

export function SearchableTable<T>({
  items,
  searchPlaceholder = "Rechercher...",
  filterFn,
  children,
}: {
  items: T[];
  searchPlaceholder?: string;
  filterFn: (item: T, query: string) => boolean;
  children: (filtered: T[]) => React.ReactNode;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => filterFn(item, q));
  }, [items, query, filterFn]);

  return (
    <div>
      <div className="mb-4 max-w-sm">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="input"
        />
      </div>
      {filtered.length === 0 ? (
        <div className="card px-6 py-10 text-center text-sm text-slate-500">
          Aucun resultat pour &laquo; {query} &raquo;.
        </div>
      ) : (
        children(filtered)
      )}
    </div>
  );
}
