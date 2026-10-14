import { forwardRef, type InputHTMLAttributes } from 'react';
import './shared-ui.css';

export type InputState = 'default' | 'focused' | 'error' | 'readOnly';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  state?: InputState;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, errorText, state = 'default', id, className = '', required, ...props },
  ref,
) {
  const inputId = id ?? `mc-input-${Math.random().toString(36).slice(2, 8)}`;
  const isError = state === 'error' || Boolean(errorText);
  return (
    <div className="mc-field">
      {label && (
        <label className="mc-label" htmlFor={inputId}>
          {label} {required && <span className="mc-required">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        readOnly={state === 'readOnly' || props.readOnly}
        aria-invalid={isError}
        className={`mc-input mc-input--${state} ${className}`.trim()}
        {...props}
      />
      {errorText ? <span className="mc-helper mc-helper--error">{errorText}</span> : helperText ? <span className="mc-helper">{helperText}</span> : null}
    </div>
  );
});
