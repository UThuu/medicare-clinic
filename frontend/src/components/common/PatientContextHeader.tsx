import type { ReactNode } from 'react';
import './shared-ui.css';

export interface PatientContextHeaderProps {
    patientCode: string;
    patientName: string;
    gender: string;
    dateOfBirth: string;
    phone: string;
    address: string;
    extra?: ReactNode;
}

export function PatientContextHeader({
                                         patientCode,
                                         patientName,
                                         gender,
                                         dateOfBirth,
                                         phone,
                                         address,
                                         extra,
                                     }: PatientContextHeaderProps) {
    return (
        <section className="mc-patient-context">

            <div className="mc-patient-context__name">
                {patientName}
            </div>

            <div className="mc-patient-context__meta">

                <div className="mc-patient-context__item">
          <span
              className="mc-patient-context__icon"
              aria-hidden="true"
          >
            ▣
          </span>

                    <span>{patientCode}</span>
                </div>

                <div className="mc-patient-context__item">
          <span
              className="mc-patient-context__icon"
              aria-hidden="true"
          >
            ⚥
          </span>

                    <span>{gender}</span>
                </div>

                <div className="mc-patient-context__item">
          <span
              className="mc-patient-context__icon"
              aria-hidden="true"
          >
            □
          </span>

                    <span>{dateOfBirth}</span>
                </div>

                <div className="mc-patient-context__item">
          <span
              className="mc-patient-context__icon"
              aria-hidden="true"
          >
            ☎
          </span>

                    <span>{phone}</span>
                </div>

                <div className="mc-patient-context__item">
          <span
              className="mc-patient-context__icon"
              aria-hidden="true"
          >
            ⌖
          </span>

                    <span>{address}</span>
                </div>

            </div>

            {extra && (
                <div className="mc-patient-context__extra">
                    {extra}
                </div>
            )}

        </section>
    );
}