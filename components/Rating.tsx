import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: number;
}

const Rating: React.FC<RatingProps> = ({ value, onChange, readonly = false, size = 20 }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange && onChange(star)}
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors duration-200`}
        >
          <Star
            size={size}
            className={`${
              star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default Rating;
