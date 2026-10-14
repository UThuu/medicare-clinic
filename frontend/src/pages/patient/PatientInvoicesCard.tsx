import {useEffect,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import api from '../../services/api';
import {Card} from '../../components/common/Card';
import {Button} from '../../components/common/Button';
import type {HoaDonResponse} from '../../types/billing';
export function PatientInvoicesCard(){
 const [data,setData]=useState<HoaDonResponse[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('');const navigate=useNavigate();
 const refresh=async()=>{setLoading(true);setError('');try{setData((await api.get<HoaDonResponse[]>('/patient/invoices')).data.filter(h=>h.trangThai==='CHUA_THANH_TOAN'));}catch{setError('Không thể tải hóa đơn.');}finally{setLoading(false);}};
 useEffect(()=>{void refresh();},[]);
 return <Card className="mc-patient-bills"><h2>Hóa đơn cần thanh toán</h2>{loading?<p>Đang tải hóa đơn...</p>:error?<><p role="alert">{error}</p><Button onClick={refresh}>Thử lại</Button></>:data.length===0?<p>Chưa có hóa đơn cần thanh toán.</p>:data.slice(0,3).map(h=><div key={h.idHoaDon} style={{display:'flex',justifyContent:'space-between',gap:16,padding:'12px 0',flexWrap:'wrap'}}><span>{h.idHoaDon}</span><strong>{new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(h.tongTien)}</strong><Button onClick={()=>navigate('/patient/payment')}>Thanh toán</Button></div>)}<Button variant="secondary" onClick={()=>navigate('/patient/payment')}>Xem tất cả hóa đơn</Button></Card>;
}
