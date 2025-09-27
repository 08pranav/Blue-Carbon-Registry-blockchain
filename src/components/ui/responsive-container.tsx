import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'narrow' | 'wide' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const variants = {
  default: 'max-w-7xl',
  narrow: 'max-w-4xl',
  wide: 'max-w-screen-xl',
  full: 'max-w-full'
};

const paddings = {
  none: '',
  sm: 'px-2 sm:px-4',
  md: 'px-4 sm:px-6 lg:px-8',
  lg: 'px-6 sm:px-8 lg:px-12',
  xl: 'px-8 sm:px-12 lg:px-16'
};

export function ResponsiveContainer({ 
  children, 
  className, 
  variant = 'default',
  padding = 'md'
}: ResponsiveContainerProps) {
  return (
    <div className={cn(
      'mx-auto w-full',
      variants[variant],
      paddings[padding],
      className
    )}>
      {children}
    </div>
  );
}

// Responsive grid component
interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12'
};

const gaps = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8'
};

export function ResponsiveGrid({ 
  children, 
  className, 
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md'
}: ResponsiveGridProps) {
  const gridClasses = [
    cols.default && gridCols[cols.default],
    cols.sm && `sm:${gridCols[cols.sm]}`,
    cols.md && `md:${gridCols[cols.md]}`,
    cols.lg && `lg:${gridCols[cols.lg]}`,
    cols.xl && `xl:${gridCols[cols.xl]}`
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(
      'grid',
      gridClasses,
      gaps[gap],
      className
    )}>
      {children}
    </div>
  );
}

// Responsive stack component
interface ResponsiveStackProps {
  children: ReactNode;
  className?: string;
  direction?: {
    default?: 'row' | 'col';
    sm?: 'row' | 'col';
    md?: 'row' | 'col';
    lg?: 'row' | 'col';
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

const directions = {
  row: 'flex-row',
  col: 'flex-col'
};

const alignments = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch'
};

const justifications = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly'
};

export function ResponsiveStack({ 
  children, 
  className,
  direction = { default: 'col', lg: 'row' },
  gap = 'md',
  align = 'stretch',
  justify = 'start'
}: ResponsiveStackProps) {
  const directionClasses = [
    direction.default && directions[direction.default],
    direction.sm && `sm:${directions[direction.sm]}`,
    direction.md && `md:${directions[direction.md]}`,
    direction.lg && `lg:${directions[direction.lg]}`
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(
      'flex',
      directionClasses,
      gaps[gap],
      alignments[align],
      justifications[justify],
      className
    )}>
      {children}
    </div>
  );
}