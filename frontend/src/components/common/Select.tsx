import type { SelectHTMLAttributes } from 'react';
import './shared-ui.css';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  errorText?: string;
}

export function Select({ label, options, placeholder, errorText, id, className = '', ...props }: SelectProps) {
  const selectId = id ?? `mc-select-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className="mc-field">
      {label && <label className="mc-label" htmlFor={selectId}>{label}</label>}
      <select id={selectId} className={`mc-input mc-select ${errorText ? 'mc-input--error' : ''} ${className}`.trim()} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
      </select>
      {errorText && <span className="mc-helper mc-helper--error">{errorText}</span>}
    </div>
  );
}
