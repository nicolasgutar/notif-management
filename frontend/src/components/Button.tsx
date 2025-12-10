
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {
    return (
        <button className={`btn btn-${variant} btn-${size} ${className}`} {...props}>
            {children}
            <style>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          font-weight: 500;
          transition: all 0.2s;
          gap: var(--space-sm);
        }
        .btn-sm {
          padding: var(--space-xs) var(--space-sm);
          font-size: var(--font-size-sm);
        }
        .btn-md {
          padding: var(--space-sm) var(--space-md);
          font-size: var(--font-size-base);
        }
        .btn-lg {
          padding: var(--space-md) var(--space-lg);
          font-size: var(--font-size-lg);
        }
        .btn-primary {
          background-color: var(--color-primary);
          color: white;
        }
        .btn-primary:hover {
          background-color: var(--color-primary-hover);
        }
        .btn-secondary {
          background-color: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }
        .btn-secondary:hover {
          background-color: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
        }
        .btn-danger {
          background-color: var(--color-danger);
          color: white;
        }
      `}</style>
        </button>
    );
};

export default Button;
