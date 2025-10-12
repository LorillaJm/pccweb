interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

export default function SkeletonLoader({
  variant = 'text',
  width = '100%',
  height,
  className = '',
  count = 1
}: SkeletonLoaderProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-lg';
      case 'card':
        return 'rounded-lg';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const getDefaultHeight = () => {
    switch (variant) {
      case 'circular':
        return width;
      case 'card':
        return '200px';
      case 'text':
        return '1em';
      default:
        return '20px';
    }
  };

  const skeletonHeight = height || getDefaultHeight();

  const skeleton = (
    <div
      className={`bg-gray-200 animate-pulse ${getVariantClasses()} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof skeletonHeight === 'number' ? `${skeletonHeight}px` : skeletonHeight
      }}
    />
  );

  if (count === 1) {
    return skeleton;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{skeleton}</div>
      ))}
    </div>
  );
}

// Predefined skeleton patterns
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <SkeletonLoader variant="rectangular" height="200px" className="mb-4" />
      <SkeletonLoader variant="text" width="60%" className="mb-2" />
      <SkeletonLoader variant="text" width="80%" className="mb-2" />
      <SkeletonLoader variant="text" width="40%" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <SkeletonLoader variant="circular" width={48} height={48} />
          <div className="flex-1">
            <SkeletonLoader variant="text" width="40%" className="mb-2" />
            <SkeletonLoader variant="text" width="60%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1">
              <SkeletonLoader variant="text" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
