
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, title, className = '' }) => {
    return (
        <div className={`card ${className}`}>
            {title && <h3 className="card-title">{title}</h3>}
            <div className="card-content">{children}</div>
            <style>{`
        .card {
          background-color: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          padding: var(--space-lg);
          box-shadow: var(--shadow-sm);
        }
        .card-title {
          font-size: var(--font-size-lg);
          font-weight: 600;
          margin-bottom: var(--space-md);
          color: var(--color-text-primary);
        }
      `}</style>
        </div>
    );
};

export default Card;
