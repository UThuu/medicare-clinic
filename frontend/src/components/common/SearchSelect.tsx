import { useState } from 'react';
import './shared-ui.css';

export interface SearchSelectOption {
    label: string;
    value: string;
}

export interface SearchSelectProps {
    label?: string;
    placeholder?: string;
    options: SearchSelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    errorText?: string;
}

export function SearchSelect({
                                 label,
                                 placeholder = 'Tìm tên thuốc...',
                                 options,
                                 value = '',
                                 onChange,
                                 errorText,
                             }: SearchSelectProps) {
    const [open, setOpen] = useState(false);
    const [keyword, setKeyword] = useState('');

    const selectedOption = options.find(
        (option) => option.value === value,
    );

    const filteredOptions = options.filter((option) =>
        option.label
            .toLowerCase()
            .includes(keyword.toLowerCase()),
    );

    const displayValue =
        selectedOption?.label || keyword || '';

    return (
        <div className="mc-search-select">

            {label && (
                <label className="mc-label">
                    {label}
                </label>
            )}

            <div className="mc-search-select__control">

                <input
                    type="text"
                    className={`mc-input ${
                        errorText ? 'mc-input--error' : ''
                    }`}
                    value={displayValue}
                    placeholder={placeholder}
                    onFocus={() => setOpen(true)}
                    onChange={(event) => {
                        setKeyword(event.target.value);
                        setOpen(true);
                        onChange?.('');
                    }}
                />

                <button
                    type="button"
                    className="mc-search-select__arrow"
                    onClick={() => setOpen((current) => !current)}
                    aria-label="Mở danh sách"
                >
                    ⌄
                </button>
            </div>

            {open && (
                <div className="mc-search-select__menu">

                    {filteredOptions.length === 0 ? (
                        <div className="mc-search-select__empty">
                            Không có kết quả
                        </div>
                    ) : (
                        filteredOptions.map((option) => (
                            <button
                                type="button"
                                key={option.value}
                                className="mc-search-select__option"
                                onClick={() => {
                                    onChange?.(option.value);
                                    setKeyword('');
                                    setOpen(false);
                                }}
                            >
                                {option.label}
                            </button>
                        ))
                    )}

                </div>
            )}

            {errorText && (
                <span className="mc-helper mc-helper--error">
          {errorText}
        </span>
            )}

        </div>
    );
}