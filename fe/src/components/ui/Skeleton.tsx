interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export const Skeleton = ({ className = '', children, ...props }: SkeletonProps) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const FormCardSkeleton = () => {
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white">
      {/* Header with Icon and Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-5 w-3/4 mb-2 rounded" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </div>
        </div>
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>

      {/* Description */}
      <div className="mb-4">
        <Skeleton className="h-4 w-full mb-2 rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 mb-4"></div>

      {/* Footer with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-3.5 h-3.5 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="w-8 h-8 rounded-md" />
          <Skeleton className="w-8 h-8 rounded-md" />
          <Skeleton className="w-8 h-8 rounded-md" />
          <Skeleton className="w-8 h-8 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export const FormRowSkeleton = () => {
  return (
    <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        {/* Left side: Icon, Title, and Metadata */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Icon */}
          <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0 mt-1" />

          {/* Title and metadata */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <Skeleton className="h-6 w-full mb-2 rounded" />
            <Skeleton className="h-6 w-3/4 mb-3 rounded" />

            {/* Description */}
            <Skeleton className="h-4 w-full mb-3 rounded" />
            <Skeleton className="h-4 w-2/3 mb-3 rounded" />

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="w-20 h-6 rounded-full" />
              <Skeleton className="w-16 h-4 rounded" />
              <Skeleton className="w-24 h-4 rounded" />
              <Skeleton className="w-20 h-4 rounded" />
              <Skeleton className="w-16 h-4 rounded" />
            </div>
          </div>
        </div>

        {/* Right side: Action buttons */}
        <div className="flex flex-shrink-0 gap-2 lg:gap-1">
          <Skeleton className="w-16 h-10 rounded-lg lg:hidden sm:inline-flex" />
          <Skeleton className="w-10 h-10 rounded-lg hidden lg:flex" />
          <Skeleton className="w-16 h-10 rounded-lg lg:hidden sm:inline-flex" />
          <Skeleton className="w-10 h-10 rounded-lg hidden lg:flex" />
          <Skeleton className="w-16 h-10 rounded-lg lg:hidden sm:inline-flex" />
          <Skeleton className="w-10 h-10 rounded-lg hidden lg:flex" />
        </div>
      </div>
    </div>
  );
};

export const FormListSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <FormRowSkeleton key={index} />
      ))}
    </div>
  );
};