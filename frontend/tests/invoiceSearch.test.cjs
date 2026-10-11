const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('typescript'),React=require('react');
const {create,act}=require('react-test-renderer');
const text=n=>typeof n==='string'?n:(n.children||[]).map(text).join('');
function harness(search) {
 const calls=[],cache=new Map();
 class ApiError extends Error{constructor(message,status){super(message);this.status=status;}}
 function MainLayout({children,sidebarItems,doctorName}){return React.createElement('div',null,doctorName,React.createElement('nav',null,sidebarItems.map(i=>React.createElement('a',{key:i.label,href:i.href,'data-active':i.active},i.label))),children);}
 const load=file=>{
  if(cache.has(file))return cache.get(file);
  const result={};cache.set(file,result);
  const source=fs.readFileSync(path.join(__dirname,'../src',file),'utf8');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  vm.runInNewContext(code,{exports:result,console,require:id=>{
   if(id==='react'||id==='react/jsx-runtime')return require(id);
   if(id==='react-router-dom')return {useNavigate:()=>url=>calls.push({navigate:url})};
   if(id.endsWith('contexts/AuthContext'))return {useAuth:()=>({user:{hoTen:'Session cashier'},checkSession:async()=>calls.push({session:true})})};
   if(id.endsWith('services/authService'))return {ApiError};
   if(id.endsWith('services/hoaDonService'))return {hoaDonService:{traCuuHoaDon:request=>{calls.push(request);return search(request,ApiError);}}};
   if(id.endsWith('/MainLayout'))return {MainLayout};
   if(id.endsWith('.css'))return {};
   if(id.startsWith('.')){const rel=path.posix.normalize(path.posix.join(path.posix.dirname(file),id));return load(fs.existsSync(path.join(__dirname,'../src',rel+'.tsx'))?rel+'.tsx':rel+'.ts');}
   throw Error('Unexpected dependency '+id);
  }});return result;
 };
 return {Page:load('pages/HoaDonTraCuu.tsx').HoaDonTraCuu,calls};
}
const empty={page:0,size:20,totalPages:0,tongSoKetQua:0,danhSachHoaDon:[],thongBao:'Không tìm thấy hóa đơn'};
const submit=page=>page.root.findByType('form').props.onSubmit({preventDefault(){}});
const input=(page,placeholder,value)=>page.root.findAllByType('input').find(n=>n.props.placeholder===placeholder).props.onChange({target:{value}});
test('cashier menu preserves billing/payment and opens search; empty filters show genuine empty result',async()=>{
 const h=harness(async()=>empty);let page;
 try{await act(async()=>{page=create(React.createElement(h.Page));});const links=page.root.findAllByType('a');assert.deepEqual(links.map(n=>n.props.href),['/staff/billing','/staff/billing?tab=thanh-toan','/staff/hoadon/tra-cuu']);assert.equal(links[2].props['data-active'],true);assert.ok(text(page.root).includes('Session cashier'));await act(async()=>submit(page));assert.equal(h.calls[0].page,0);assert.equal(h.calls[0].size,20);assert.ok(text(page.root).includes('Không tìm thấy hóa đơn'));}finally{if(page)act(()=>page.unmount());}
});
test('search pagination keeps submitted filter and detail uses saved invoice fields',async()=>{
 const h=harness(async r=>({...empty,page:r.page,totalPages:2,tongSoKetQua:21,danhSachHoaDon:[{idHoaDon:'SAVED',hoTenBenhNhan:'Persisted patient',tongTien:42,trangThai:'DA_THANH_TOAN',chiTietHoaDon:[{loaiChiPhi:'TIEN_KHAM',moTa:'Saved fee',soLuong:1,donGia:42,thanhTien:42}]}]}));let page;
 try{await act(async()=>{page=create(React.createElement(h.Page));});act(()=>input(page,'Nhập số điện thoại','00022'));await act(async()=>submit(page));act(()=>input(page,'Nhập số điện thoại','different-unsent'));const next=page.root.findAllByType('button').find(n=>text(n)==='Tiếp');await act(async()=>next.props.onClick());assert.equal(h.calls[1].soDienThoaiBenhNhan,'00022');assert.equal(h.calls[1].page,1);const detail=page.root.findAllByType('button').find(n=>text(n)==='Chi tiết');act(()=>detail.props.onClick());assert.ok(text(page.root.findByProps({role:'dialog'})).includes('Saved fee'));}finally{if(page)act(()=>page.unmount());}
});
test('invalid date range prevents request; server validation and forbidden errors stay visible',async()=>{
 const h=harness(async(r,E)=>{throw new E('Không có quyền',403)});let page;
 try{await act(async()=>{page=create(React.createElement(h.Page));});const dates=page.root.findAllByType('input').filter(n=>n.props.type==='date');act(()=>{dates[0].props.onChange({target:{value:'2026-10-12'}});dates[1].props.onChange({target:{value:'2026-10-11'}});});await act(async()=>submit(page));assert.equal(h.calls.length,0);assert.ok(text(page.root).includes('Ngày bắt đầu'));act(()=>page.root.findAllByType('button').find(n=>text(n)==='Xóa bộ lọc').props.onClick());await act(async()=>submit(page));assert.ok(text(page.root).includes('không có quyền'));}finally{if(page)act(()=>page.unmount());}
});
test('repeated submission makes one request while loading',async()=>{
 let finish;const h=harness(()=>new Promise(resolve=>{finish=resolve}));let page;
 try{await act(async()=>{page=create(React.createElement(h.Page));});let work;await act(async()=>{work=submit(page);submit(page);});assert.equal(h.calls.length,1);await act(async()=>{finish(empty);await work;});}finally{if(page)act(()=>page.unmount());}
});
