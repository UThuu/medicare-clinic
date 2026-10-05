import type { ReactNode } from 'react';
import './shared-ui.css';

export type AlertTone = 'error' | 'warning' | 'success' | 'info';

export interface AlertProps {
    title: string;
    children?: ReactNode;
    tone?: AlertTone;
}

export function Alert({
                          title,
                          children,
                          tone = 'error',
                      }: AlertProps) {
    return (
        <div
            className={`mc-alert mc-alert--${tone}`}
            role="alert"
        >
            <div className="mc-alert__title">
                {title}
            </div>

            {children && (
                <div className="mc-alert__message">
                    {children}
                </div>
            )}
        </div>
    );
}