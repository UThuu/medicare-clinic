import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './shared-ui.css';

export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'ghost';

export type ButtonSize =
    | 'sm'
    | 'md'
    | 'lg';

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
}

export function Button({
                         variant = 'primary',
                         size = 'md',
                         loading = false,
                         loadingText = 'Đang lưu...',
                         icon,
                         children,
                         disabled = false,
                         className = '',
                         ...props
                       }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
      <button
          type="button"
          className={[
            'mc-button',
            `mc-button--${variant}`,
            `mc-button--${size}`,
            loading ? 'mc-button--loading' : '',
            className,
          ]
              .filter(Boolean)
              .join(' ')}
          disabled={isDisabled}
          aria-busy={loading}
          {...props}
      >
        {loading ? (
            <span
                className="mc-spinner"
                aria-hidden="true"
            />
        ) : (
            icon
        )}

        <span>
        {loading ? loadingText : children}
      </span>
      </button>
  );
}