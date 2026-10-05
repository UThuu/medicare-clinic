import type { ReactNode } from 'react';
import './shared-ui.css';

export interface CardProps {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ title, children, className = '', padding = 'md' }: CardProps) {
  return (
    <section className={`mc-card mc-card--${padding} ${className}`.trim()}>
      {title && <h3 className="mc-card__title">{title}</h3>}
      {children}
    </section>
  );
}
