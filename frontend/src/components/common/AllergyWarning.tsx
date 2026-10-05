import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import './shared-ui.css';

export interface AllergyWarningProps {
    medicineName: string;
    allergyName?: string;
    onChangeMedicine?: () => void;
    onResolved?: (reason: string) => void;
}

export function AllergyWarning({
                                   medicineName,
                                   allergyName = 'Penicillin',
                                   onChangeMedicine,
                                   onResolved,
                               }: AllergyWarningProps) {
    const [resolved, setResolved] = useState(false);
    const [reason, setReason] = useState('');

    const handleResolve = () => {
        if (!reason.trim()) {
            return;
        }

        setResolved(true);
        onResolved?.(reason);
    };

    return (
        <div className="mc-allergy-warning">

            <div className="mc-allergy-warning__medicine">
                {medicineName}
            </div>

            {!resolved ? (
                <div className="mc-allergy-warning__pending">

                    <div className="mc-allergy-warning__title">
                        ⚠ Cảnh báo dị ứng tại thuốc này
                    </div>

                    <div className="mc-allergy-warning__message">
                        Thuốc có thành phần liên quan đến dị ứng{' '}
                        {allergyName} đã ghi nhận.
                    </div>

                    <div className="mc-allergy-warning__form">

                        <Input
                            label="Lý do tiếp tục kê"
                            required
                            placeholder="Nhập lý do..."
                            value={reason}
                            onChange={(event) =>
                                setReason(event.target.value)
                            }
                        />

                        <div className="mc-allergy-warning__actions">

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onChangeMedicine}
                            >
                                Đổi thuốc
                            </Button>

                            <Button
                                variant="primary"
                                size="sm"
                                disabled={!reason.trim()}
                                onClick={handleResolve}
                            >
                                Xác nhận tiếp tục kê
                            </Button>

                        </div>

                    </div>

                </div>
            ) : (
                <div className="mc-allergy-warning__resolved">

                    <div className="mc-allergy-warning__resolved-title">
                        ✓ Cảnh báo đã được bác sĩ xử lý
                    </div>

                    <div className="mc-allergy-warning__message">
                        Đã xác nhận tiếp tục kê mặc dù có cảnh báo dị ứng.
                    </div>

                    <button
                        type="button"
                        className="mc-allergy-warning__reason"
                        title={reason}
                    >
                        Xem lý do
                    </button>

                </div>
            )}

        </div>
    );
}