import '../common/shared-ui.css';

export interface HeaderProps {
  doctorName?: string;
  roleLabel?: string;
  hotline?: string;
}

export function Header({ doctorName = 'Tên bác sĩ', roleLabel = 'Bác sĩ', hotline = 'Hotline' }: HeaderProps) {
  return (
    <header className="mc-header">
      <div className="mc-brand">
        <span className="mc-brand__mark" aria-hidden="true">+</span>
        <div>
          <div className="mc-brand__name">MediCare Clinic</div>
          <div className="mc-brand__hotline">{hotline}</div>
        </div>
      </div>
      <div className="mc-user">
        <span className="mc-avatar mc-avatar--sm" aria-hidden="true">●</span>
        <div><strong>{doctorName}</strong><span>{roleLabel}</span></div>
      </div>
    </header>
  );
}
