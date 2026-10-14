import { useAppointmentNotifications } from '../../hooks/useAppointmentNotifications';
import { useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import { PatientLayout } from '../../components/layout/PatientLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { InHoaDonModal } from '../cashier/components/InHoaDonModal';
import type { HoaDonResponse, ThongTinThanhToanResponse } from '../../types/billing';
import './patientPayment.css';
import { VNPayPaymentCard } from './VNPayPaymentCard';
const money=(value:number) => new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(value);
export function ThanhToanOnlinePage() {
  const notifications=useAppointmentNotifications();
  const [invoices,setInvoices]=useState<HoaDonResponse[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [processing,setProcessing]=useState<string|null>(null);
  const busy=useRef(false);
  const [detail,setDetail]=useState<ThongTinThanhToanResponse|null>(null);
  const [paymentInvoice,setPaymentInvoice]=useState<HoaDonResponse|null>(null);
  const [printId,setPrintId]=useState<string|null>(null);
  const refresh=async()=>{setLoading(true);setError('');try{setInvoices((await api.get<HoaDonResponse[]>('/patient/invoices')).data);}catch(e:any){setError(e.response?.data?.error||'Không thể tải hóa đơn. Vui lòng thử lại.');}finally{setLoading(false);}};
  useEffect(()=>{void refresh();},[]);
  const pay=async(id:string)=>{if(busy.current)return;busy.current=true;setProcessing(id);setError('');try{
    const result=(await api.post<{paymentUrl:string}>(`/patient/invoices/${encodeURIComponent(id)}/vnpay`)).data;
    const url=new URL(result.paymentUrl); if(url.protocol!=='https:' || !['sandbox.vnpayment.vn','pay.vnpay.vn'].includes(url.hostname))throw new Error('Liên kết thanh toán không hợp lệ');
    window.location.assign(url.href);
  }catch(e:any){setError(e.response?.data?.error||e.message||'Không thể khởi tạo thanh toán');setProcessing(null);busy.current=false;}};
  const view=async(id:string)=>{setError('');try{setDetail((await api.get<ThongTinThanhToanResponse>(`/patient/invoices/${encodeURIComponent(id)}`)).data);}catch(e:any){setError(e.response?.data?.error||'Không thể tải chi tiết hóa đơn');}};
  return <PatientLayout active="payment" notifications={notifications}><div className="mc-patient-payment">
    <div className="mc-payment-heading"><div><h1>Thanh toán</h1><p>Xem hóa đơn của bạn và thanh toán trực tuyến qua VNPay.</p></div><Button variant="secondary" onClick={refresh} loading={loading}>Làm mới</Button></div>
    {error&&<p className="mc-payment-error" role="alert">{error}</p>}
    <Card>{loading?<p role="status">Đang tải hóa đơn...</p>:invoices.length===0?<p>Chưa có hóa đơn. Chi phí sẽ hiển thị sau khi thu ngân lập hóa đơn cho lượt khám đã hoàn tất.</p>:<div className="mc-payment-table"><table><thead><tr><th>Mã hóa đơn</th><th>Ngày lập</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{invoices.map(h=><tr key={h.idHoaDon}>
      <td>{h.idHoaDon}</td><td>{new Date(h.ngayTao).toLocaleString('vi-VN')}</td><td><strong>{money(h.tongTien)}</strong></td><td><span className={`mc-payment-status ${h.trangThai==='DA_THANH_TOAN'?'is-paid':''}`}>{h.trangThai==='DA_THANH_TOAN'?'Đã thanh toán':h.trangThai==='CHUA_THANH_TOAN'?'Chưa thanh toán':'Đã hủy'}</span></td>
      <td><div className="mc-payment-actions"><Button variant="secondary" onClick={()=>view(h.idHoaDon)}>Chi tiết</Button>{h.trangThai==='CHUA_THANH_TOAN'&&<Button onClick={()=>{setError('');setPaymentInvoice(h);}} disabled={processing!==null} loading={processing===h.idHoaDon}>Thanh toán</Button>}{h.trangThai==='DA_THANH_TOAN'&&<Button onClick={()=>setPrintId(h.idHoaDon)}>Xem / In hóa đơn</Button>}</div></td>
    </tr>)}</tbody></table></div>}</Card>
    <Modal open={detail!==null} title="Chi tiết hóa đơn" onClose={()=>setDetail(null)} width="lg">{detail&&<><p><strong>{detail.tenBenhNhan}</strong> · {detail.idHoaDon}</p><table className="mc-payment-detail"><thead><tr><th>Khoản thu</th><th>Số lượng</th><th>Thành tiền</th></tr></thead><tbody>{(detail.danhSachChiTiet||[]).map((d,i)=><tr key={i}><td>{d.tenKhoanThu}</td><td>{d.soLuong}</td><td>{money(d.thanhTien)}</td></tr>)}</tbody></table><p><strong>Tổng cộng: {money(detail.tongTien)}</strong></p></>}</Modal>
    <Modal open={paymentInvoice!==null} title="Thanh toán" onClose={()=>{if(!busy.current)setPaymentInvoice(null);}} width="lg">
      {paymentInvoice&&<>
        <p>Hóa đơn <strong>{paymentInvoice.idHoaDon}</strong> · Tổng tiền: <strong>{money(paymentInvoice.tongTien)}</strong></p>
        <VNPayPaymentCard/>
        {error&&<p className="mc-payment-error" role="alert">{error}</p>}
        <div className="mc-payment-actions">
          <Button variant="secondary" onClick={()=>setPaymentInvoice(null)} disabled={processing!==null}>Hủy bỏ</Button>
          <Button onClick={()=>pay(paymentInvoice.idHoaDon)} disabled={processing!==null} loading={processing!==null}>Chuyển đến cổng thanh toán VNPay</Button>
        </div>
      </>}
    </Modal>
    <InHoaDonModal isOpen={printId!==null} idHoaDon={printId} onClose={()=>setPrintId(null)}/>
  </div></PatientLayout>;
}
