import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface AllergyManageModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (thanhPhan: string, ghiChu: string) => Promise<void>;
  editingItem?: { thanhPhan: string; ghiChu?: string } | null;
  loading?: boolean;
}

const COMMON_ALLERGIES = [
  'Penicillin',
  'Cephalosporin',
  'Paracetamol',
  'Aspirin',
  'Ibuprofen',
  'Sulfonamide',
  'Hải sản',
];

export function AllergyManageModal({
  open,
  onClose,
  onSave,
  editingItem,
  loading = false,
}: AllergyManageModalProps) {
  const [thanhPhan, setThanhPhan] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingItem) {
      setThanhPhan(editingItem.thanhPhan || '');
      setGhiChu(editingItem.ghiChu || '');
    } else {
      setThanhPhan('');
      setGhiChu('');
    }
    setError(null);
  }, [editingItem, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thanhPhan.trim()) {
      setError('Vui lòng nhập tên thành phần hoặc hoạt chất dị ứng');
      return;
    }

    try {
      setError(null);
      await onSave(thanhPhan.trim(), ghiChu.trim());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu dị ứng';
      setError(msg);
    }
  };

  return (
    <Modal
      open={open}
      title={editingItem ? 'Chỉnh sửa tiền sử dị ứng' : 'Thêm tiền sử dị ứng mới'}
      onClose={() => {
        if (!loading) onClose();
      }}
      width="md"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Đang lưu...' : editingItem ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="allergy-modal-form">
        {error && (
          <div
            style={{
              background: '#FEE2E2',
              color: '#B91C1C',
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '14px',
              fontSize: '14px',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
            Thành phần / Hoạt chất dị ứng <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="text"
            className="mc-input"
            placeholder="Ví dụ: Penicillin, Paracetamol, Aspirin..."
            value={thanhPhan}
            onChange={(e) => setThanhPhan(e.target.value)}
            disabled={editingItem !== null && editingItem !== undefined || loading}
            autoFocus={!editingItem}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
          {editingItem && (
            <span style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', display: 'block' }}>
              * Không thể đổi tên thành phần khi đang sửa. Nếu cần đổi thành phần khác, vui lòng xóa và thêm mới.
            </span>
          )}
          {!editingItem && (
            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748B', marginRight: '2px' }}>Gợi ý nhanh:</span>
              {COMMON_ALLERGIES.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className="allergy-chip"
                  onClick={() => setThanhPhan(chip)}
                >
                  + {chip}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
            Biểu hiện phản ứng / Ghi chú lâm sàng
          </label>
          <textarea
            className="mc-input"
            rows={3}
            placeholder="Ví dụ: Nổi mề đay, mẩn ngứa, khó thở, sốc phản vệ nhẹ..."
            value={ghiChu}
            onChange={(e) => setGhiChu(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '14px',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </form>
    </Modal>
  );
}
