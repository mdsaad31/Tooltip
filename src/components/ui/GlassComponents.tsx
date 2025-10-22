import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'hover' | 'interactive';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  size = 'md',
  onClick
}) => {
  const { isDark } = useTheme();
  
  const baseClasses = isDark 
    ? 'backdrop-blur-md bg-black/10 border border-white/10 shadow-lg' 
    : 'backdrop-blur-md bg-white/10 border border-white/20 shadow-lg';
  
  const sizeClasses = {
    sm: 'p-4 rounded-lg',
    md: 'p-6 rounded-xl',
    lg: 'p-8 rounded-2xl'
  };
  
  const variantClasses = {
    default: 'transition-all duration-300',
    hover: `transition-all duration-300 ${isDark ? 'hover:bg-black/20' : 'hover:bg-white/20'}`,
    interactive: `transition-all duration-200 ${isDark ? 'hover:bg-black/20' : 'hover:bg-white/30'} active:scale-95 cursor-pointer`
  };
  
  return (
    <div 
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  size = 'md',
  icon,
  ...props 
}) => {
  const { isDark } = useTheme();
  
  const baseClasses = isDark 
    ? 'backdrop-blur-md bg-black/10 border border-white/10' 
    : 'backdrop-blur-md bg-white/10 border border-white/20';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-xl'
  };
  
  const variantClasses = {
    primary: `text-white font-medium transition-all duration-200 ${isDark ? 'hover:bg-black/20' : 'hover:bg-white/30'} active:scale-95`,
    secondary: `text-white/80 font-normal transition-all duration-200 ${isDark ? 'hover:bg-black/15' : 'hover:bg-white/20'} active:scale-95`,
    ghost: `text-white/60 font-normal transition-all duration-200 hover:text-white hover:bg-white/10 active:scale-95`
  };
  
  return (
    <button 
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className} flex items-center justify-center space-x-2`}
      {...props}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({ 
  label,
  error,
  className = '',
  ...props 
}) => {
  const { isDark } = useTheme();
  
  const baseClasses = isDark 
    ? 'backdrop-blur-md bg-black/10 border border-white/10' 
    : 'backdrop-blur-md bg-white/10 border border-white/20';
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-white/80 text-sm font-medium">
          {label}
        </label>
      )}
      <input
        className={`${baseClasses} rounded-lg px-4 py-2 text-white placeholder-white/60 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 w-full ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-300 text-sm">{error}</p>
      )}
    </div>
  );
};

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative ${sizeClasses[size]} w-full animate-slide-up`}>
        <GlassCard size="lg" className="relative">
          {title && (
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          {children}
        </GlassCard>
      </div>
    </div>
  );
};

interface GlassPanelProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  title,
  subtitle,
  icon,
  className = '',
  actions
}) => {
  return (
    <GlassCard variant="hover" className={className}>
      {(title || subtitle || icon || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="text-white/60">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-white">{title}</h3>
              )}
              {subtitle && (
                <p className="text-white/60 text-sm">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </GlassCard>
  );
};