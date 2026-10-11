import { useCallback, useEffect, useRef, useState } from 'react';
import { benhNhanThongBaoLichKhamService } from '../services/benhNhanThongBaoLichKhamService';
import type { BenhNhanThongBaoLichKhamResponse } from '../types/BenhNhanThongBaoLichKham';

/** No stored/read/deleted notification state. Recompute from the authenticated patient's appointments. */
export function useAppointmentNotifications() {
  const [data, setData] = useState<BenhNhanThongBaoLichKhamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);
  const inFlight = useRef(false);
  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    const id = generation.current;
    setLoading(true);
    try {
      const result = await benhNhanThongBaoLichKhamService.layThongBaoLichKham();
      if (id === generation.current) { setData(result); setError(null); }
    } catch (err) {
      if (id === generation.current) {
        setError(err instanceof Error ? err.message : 'Không thể tải thông báo.');
        setData(null);
      }
    } finally {
      if (id === generation.current) { inFlight.current = false; setLoading(false); }
    }
  }, []);
  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => { if (!document.hidden) void refresh(); }, 30000);
    const onFocus = () => { if (!document.hidden) void refresh(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      generation.current += 1;
      inFlight.current = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [refresh]);
  return { data, loading, error, refresh };
}
