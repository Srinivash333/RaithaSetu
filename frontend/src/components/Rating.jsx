import React from 'react';
import { Star } from 'lucide-react';

export default function Rating({ value = 4.5, count, size = 'sm' }) {
  const stars = [1, 2, 3, 4, 5];
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center text-amber-400">
        {stars.map((s) => (
          <Star
            key={s}
            className={`${starSize} ${
              s <= Math.floor(value)
                ? 'fill-current text-amber-400'
                : s - value <= 0.5
                ? 'fill-current text-amber-300'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-extrabold text-gray-800">{value}</span>
      {count !== undefined && (
        <span className="text-[11px] text-gray-500">({count})</span>
      )}
    </div>
  );
}
