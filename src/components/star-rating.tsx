"use client";

import { useState } from "react";

export function StarRating({ name }: { name: string }) {
  const [value, setValue] = useState(0);
  const [hovered, setHovered] = useState(0);

  return (
    <div>
      <div className="flex gap-1 text-3xl">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setValue(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${star} etoile(s)`}
            className={(hovered || value) >= star ? "text-amber-400" : "text-slate-300"}
          >
            ★
          </button>
        ))}
      </div>
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
