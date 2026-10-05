import type { ReactNode } from 'react';
import './shared-ui.css';

export type StatusTone = 'success' | 'warning' | 'error' | 'neutral' | 'info';

export interface StatusBadgeProps {
  children: ReactNode;
  tone?: StatusTone;
  dot?: boolean;
}

export function StatusBadge({ children, tone = 'neutral', dot = true }: StatusBadgeProps) {
  return <span className={`mc-status mc-status--${tone}`}>{dot && <span className="mc-status__dot" aria-hidden="true" />}{children}</span>;
}
