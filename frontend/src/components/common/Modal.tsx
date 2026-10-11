import type { ReactNode } from 'react';
import './shared-ui.css';

export interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, title, children, onClose, footer, width = 'md' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="mc-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={`mc-modal mc-modal--${width}`} role="dialog" aria-modal="true" aria-labelledby="mc-modal-title">
        <header className="mc-modal__header">
          <h2 id="mc-modal-title" className="mc-modal__title">{title}</h2>
          <button type="button" className="mc-icon-button" onClick={onClose} aria-label="Đóng">×</button>
        </header>
        <div className="mc-modal__body">{children}</div>
        {footer && <footer className="mc-modal__footer">{footer}</footer>}
      </section>
    </div>
  );
}
