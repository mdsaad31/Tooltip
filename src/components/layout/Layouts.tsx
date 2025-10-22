import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  dock?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  header,
  dock,
  sidebar,
  className = ''
}) => {
  return (
    <div className={`min-h-screen relative overflow-x-hidden ${className}`}>
      {/* Responsive Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-4 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-40 right-4 sm:right-10 w-48 h-48 sm:w-72 sm:h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-10 left-1/2 w-48 h-48 sm:w-72 sm:h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      {header && (
        <header className="relative z-10">
          {header}
        </header>
      )}

      {/* Sidebar - Hidden on mobile */}
      {sidebar && (
        <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 z-40">
          {sidebar}
        </aside>
      )}

      {/* Main Content */}
      <main className={`
        relative z-10 flex-1 min-h-screen
        ${dock ? 'pb-20 sm:pb-24' : ''} 
        ${sidebar ? 'lg:ml-64' : ''}
        px-2 sm:px-4 lg:px-6 pt-6
      `}>
        {children}
      </main>

      {/* Dock */}
      {dock && (
        <div className="relative z-50">
          {dock}
        </div>
      )}
    </div>
  );
};

interface GridLayoutProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GridLayout: React.FC<GridLayoutProps> = ({
  children,
  columns = 3,
  gap = 'md',
  className = ''
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6'
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

interface StackLayoutProps {
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  className?: string;
}

export const StackLayout: React.FC<StackLayoutProps> = ({
  children,
  direction = 'vertical',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  className = ''
}) => {
  const directionClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col'
  };

  const spacingClasses = {
    horizontal: {
      sm: 'space-x-2',
      md: 'space-x-4',
      lg: 'space-x-6'
    },
    vertical: {
      sm: 'space-y-2',
      md: 'space-y-4',
      lg: 'space-y-6'
    }
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  };

  return (
    <div className={`
      flex ${directionClasses[direction]} 
      ${spacingClasses[direction][spacing]} 
      ${alignClasses[align]} 
      ${justifyClasses[justify]} 
      ${className}
    `}>
      {children}
    </div>
  );
};

interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centered?: boolean;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  centered = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-none'
  };

  const centerClasses = centered ? 'mx-auto' : '';

  return (
    <div className={`${sizeClasses[size]} ${centerClasses} px-4 relative z-20 ${className}`}>
      {children}
    </div>
  );
};