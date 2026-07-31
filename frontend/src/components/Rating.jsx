import { Star } from 'lucide-react';

const Rating = ({ value = 0, count, size = 14, showCount = true }) => {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={size}
            className={n <= Math.round(value) ? 'fill-marigold text-marigold' : 'fill-transparent text-ink/20'}
          />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-ink/50 font-semibold">
          {value > 0 ? `${value.toFixed(1)}` : 'New'} {count ? `(${count})` : ''}
        </span>
      )}
    </div>
  );
};

export default Rating;
