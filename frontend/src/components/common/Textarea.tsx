import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import './shared-ui.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    errorText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
    { label, errorText, id, required, className = '', ...props }, ref,
) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
        <div className="mc-field">
            <label className="mc-label" htmlFor={inputId}>
                {label} {required && <span className="mc-required">*</span>}
            </label>
            <textarea {...props} ref={ref} id={inputId} required={required}
                className={`mc-input ${className}`.trim()} aria-invalid={Boolean(errorText)}
                aria-describedby={errorText ? `${inputId}-error` : undefined} />
            {errorText && <span id={`${inputId}-error`} className="mc-helper mc-helper--error">{errorText}</span>}
        </div>
    );
});
