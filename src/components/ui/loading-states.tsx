import { cn } from "@/lib/utils";
import { Leaf, Loader2 } from "lucide-react";

// Enhanced loading spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'ocean' | 'nature';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const variantClasses = {
  default: 'text-muted-foreground',
  ocean: 'text-ocean',
  nature: 'text-nature'
};

export function LoadingSpinner({ size = 'md', variant = 'default', className }: LoadingSpinnerProps) {
  return (
    <Loader2 
      className={cn(
        'animate-spin',
        sizeClasses[size],
        variantClasses[variant],
        className
      )} 
    />
  );
}

// Page loading state
interface PageLoadingProps {
  message?: string;
  variant?: 'default' | 'ocean' | 'nature';
}

export function PageLoading({ message = 'Loading...', variant = 'ocean' }: PageLoadingProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center',
            variant === 'ocean' && 'bg-ocean/10',
            variant === 'nature' && 'bg-nature/10',
            variant === 'default' && 'bg-muted'
          )}>
            {variant === 'default' ? (
              <LoadingSpinner size="lg" />
            ) : (
              <Leaf className={cn(
                'h-8 w-8 animate-pulse',
                variant === 'ocean' && 'text-ocean',
                variant === 'nature' && 'text-nature'
              )} />
            )}
          </div>
          {variant !== 'default' && (
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-current animate-spin opacity-20" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold">Blue Carbon Registry</h3>
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Card loading skeleton
interface CardSkeletonProps {
  rows?: number;
  showImage?: boolean;
  className?: string;
}

export function CardSkeleton({ rows = 3, showImage = false, className }: CardSkeletonProps) {
  return (
    <div className={cn("border rounded-lg p-6 space-y-4", className)}>
      {showImage && <div className="w-full h-48 bg-muted rounded-md animate-pulse" />}
      <div className="space-y-2">
        <div className="h-6 bg-muted rounded animate-pulse" />
        {Array.from({ length: rows }).map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "h-4 bg-muted rounded animate-pulse",
              i === rows - 1 ? "w-2/3" : "w-full"
            )} 
          />
        ))}
      </div>
      <div className="flex gap-2 pt-4">
        <div className="h-8 w-20 bg-muted rounded animate-pulse" />
        <div className="h-8 w-16 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

// Table loading skeleton
interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  showHeader?: boolean;
  className?: string;
}

export function TableSkeleton({ rows = 5, cols = 4, showHeader = true, className }: TableSkeletonProps) {
  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {showHeader && (
        <div className="border-b bg-muted/50 p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      )}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div 
                  key={colIndex} 
                  className={cn(
                    "h-4 bg-muted rounded animate-pulse",
                    colIndex === 0 ? "h-5" : "", // First column slightly taller
                    colIndex === cols - 1 ? "w-3/4" : "w-full" // Last column shorter
                  )} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// List loading skeleton
interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}

export function ListSkeleton({ items = 5, showAvatar = false, className }: ListSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          {showAvatar && (
            <div className="w-10 h-10 bg-muted rounded-full animate-pulse flex-shrink-0" />
          )}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Form loading skeleton
interface FormSkeletonProps {
  fields?: number;
  showSubmit?: boolean;
  className?: string;
}

export function FormSkeleton({ fields = 4, showSubmit = true, className }: FormSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-10 w-full bg-muted rounded animate-pulse" />
        </div>
      ))}
      {showSubmit && (
        <div className="flex gap-2 pt-4">
          <div className="h-10 w-24 bg-muted rounded animate-pulse" />
          <div className="h-10 w-20 bg-muted rounded animate-pulse" />
        </div>
      )}
    </div>
  );
}

// Stats grid loading skeleton
interface StatsSkeletonProps {
  items?: number;
  className?: string;
}

export function StatsSkeleton({ items = 4, className }: StatsSkeletonProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="border rounded-lg p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}