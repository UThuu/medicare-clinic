import { forwardRef, type InputHTMLAttributes } from 'react';
import './shared-ui.css';

export interface SearchBoxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(function SearchBox({ label, placeholder = 'Tìm theo tên / mã bệnh nhân', className = '', ...props }, ref) {
  return (
    <div className="mc-search-field">
      {label && <span className="mc-label">{label}</span>}
      <span className="mc-search-icon" aria-hidden="true">⌕</span>
      <input ref={ref} type="search" className={`mc-input mc-search-input ${className}`.trim()} placeholder={placeholder} {...props} />
    </div>
  );
});
