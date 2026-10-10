const {test}=require('node:test'); const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'); const {create,act}=require('react-test-renderer');
const text=n=>typeof n==='string'?n:(n.children||[]).map(text).join('');
const wrap=tag=>props=>React.createElement(tag,props,props.children);
function load(file,deps={},globals={}) {
 const source=fs.readFileSync(path.join(__dirname,'../src',file),'utf8');
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const exports={};vm.runInNewContext(compiled,{exports,Error,URLSearchParams,...globals,require:id=>{
  if(Object.hasOwn(deps,id))return deps[id];if(id==='react/jsx-runtime')return require(id);if(id.endsWith('.css'))return {};throw Error('Unexpected '+id);
 }});return exports;
}
const patient={idBenhNhan:'P1',hoTen:'Persisted patient',ngaySinh:'1990-01-01',gioiTinh:'NU',soDienThoai:'0901234567',diaChi:'Address'};
const receipt={idLichKham:'BOOKED-ID',hoTenBenhNhan:patient.hoTen,hoTenBacSi:'Persisted doctor',ngayKham:'2026-10-12',gioKham:'09:00:00',trangThai:'DA_DAT'};
class BookingApiError extends Error{constructor(message,status){super(message);this.status=status;}}
async function mount(overrides={}) {
 const calls=[];const api={BookingApiError,layBacSi:async()=>[{maBacSi:'D1',hoTen:'Persisted doctor',chuyenKhoa:'Medicine'}],
  layKhungGio:async(d,date)=>{calls.push({slot:d,date});return {maBacSi:d,ngayKham:date,gioTrong:['09:00:00'],ngayGoiY:[]};},
  datLichKhamTaiQuay:async body=>{calls.push({save:body});return receipt;},...overrides};
 const {LichKhamDatTaiQuay}=load('pages/LichKhamDatTaiQuay.tsx',{react:React,
  '../components/common/Alert':{Alert:p=>React.createElement('aside',null,p.title,p.children)},
  '../components/common/Button':load('components/common/Button.tsx'), '../components/common/Card':{Card:wrap('section')},
  '../components/common/Input':{Input:wrap('input')}, '../components/layout/ReceptionLayout':{ReceptionLayout:wrap('main')},
  './BenhNhanTimKiem':{BenhNhanTimKiem:p=>React.createElement('div',{id:'picker',...p})},
  './BenhNhanTaoMoi':{ngayHienTai:()=> '2026-10-12'}, '../services/lichKhamDatTaiQuayService':api });
 let page;await act(async()=>{page=create(React.createElement(LichKhamDatTaiQuay));});
 const select=async()=>act(()=>page.root.findByProps({id:'picker'}).props.onSelectPatient(patient));
 const doctor=async d=>act(()=>page.root.findByProps({id:'uc30-doctor'}).props.onChange({target:{value:d}}));
 const time=async()=>act(()=>page.root.findAllByType('button').find(n=>text(n)==='09:00').props.onClick());
 const confirm=async()=>act(()=>page.root.findByProps({type:'checkbox'}).props.onChange({target:{checked:true}}));
 return {page,calls,select,doctor,time,confirm,close:()=>act(()=>page.unmount())};
}
test('UC30 selects actual UC28/29 profile, validates confirmation and sends selected identities',async()=>{
 const app=await mount();try{
  assert.equal(app.page.root.findByProps({id:'picker'}).props.embedded,true);await app.select();await app.doctor('D1');
  assert.ok(text(app.page.root).includes('Persisted patient'));await app.time();
  await act(async()=>app.page.root.findByType('form').props.onSubmit({preventDefault(){}}));assert.equal(app.calls.filter(c=>c.save).length,0);
  await app.confirm();await act(async()=>app.page.root.findByType('form').props.onSubmit({preventDefault(){}}));
  assert.deepEqual(JSON.parse(JSON.stringify(app.calls.find(c=>c.save).save)),{idBenhNhan:'P1',maBacSi:'D1',ngayKham:'2026-10-12',gioKham:'09:00:00'});
  assert.ok(text(app.page.root).includes('BOOKED-ID'));assert.ok(text(app.page.root).includes('Đã đặt'));assert.equal(app.page.root.findAllByType('form').length,0);
 }finally{app.close();}
});
test('UC30 prevents repeated submission and a booking collision reloads availability',async()=>{
 let reject;let writes=0;const app=await mount({datLichKhamTaiQuay:()=>{writes++;return new Promise((resolve,r)=>{reject=r;});}});
 try{await app.select();await app.doctor('D1');await app.time();await app.confirm();let pending;
  const submit=app.page.root.findByType('form').props.onSubmit;await act(async()=>{pending=submit({preventDefault(){}});submit({preventDefault(){}});});
  assert.equal(writes,1);assert.equal(app.page.root.findByType('fieldset').props.disabled,true);
  await act(async()=>{reject(new BookingApiError('Slot now occupied',409));await pending;});
  assert.ok(text(app.page.root).includes('Slot now occupied'));assert.equal(app.calls.filter(c=>c.slot).length,2);
  assert.equal(app.page.root.findAllByProps({type:'checkbox'}).length,0);assert.equal(app.page.root.findByProps({id:'uc30-doctor'}).props.value,'D1');
 }finally{app.close();}
});
test('UC30 discards stale slot responses after doctor or date changes',async()=>{
 const release={};const app=await mount({layKhungGio:d=>new Promise(resolve=>{release[d]=resolve;})});
 try{await app.select();await app.doctor('D1');await app.doctor('D2');
  await act(async()=>release.D2({gioTrong:['10:00:00'],ngayGoiY:[]}));await act(async()=>release.D1({gioTrong:['09:00:00'],ngayGoiY:[]}));
  const buttons=app.page.root.findAllByType('button').map(text);assert.ok(buttons.includes('10:00'));assert.ok(!buttons.includes('09:00'));
 }finally{app.close();}
});
test('UC30 renders full configured day and genuine API errors with retry',async()=>{
 for(const mode of ['empty','error']) { const app=await mount({layKhungGio:async()=>{if(mode==='error')throw Error('API unavailable');return {gioTrong:[],ngayGoiY:['2026-10-13']};}});
  try{await app.select();await app.doctor('D1');assert.ok(text(app.page.root).includes(mode==='empty'?'Không còn giờ trống':'API unavailable'));
   if(mode==='empty')assert.ok(text(app.page.root).includes('13/10/2026'));else assert.ok(text(app.page.root).includes('Thử tải lại khung giờ'));
  }finally{app.close();}
 }
});
test('UC30 transport uses relative API, session cookie and structured collision status',async()=>{
 let request;const service=load('services/lichKhamDatTaiQuayService.ts',{}, {fetch:async(url,options)=>{request={url,options};return {ok:true,json:async()=>receipt};}});
 await service.datLichKhamTaiQuay({idBenhNhan:'P1',maBacSi:'D1',ngayKham:'2026-10-12',gioKham:'09:00'});
 assert.equal(request.url,'/api/lichkham/dat-tai-quay');assert.equal(request.options.credentials,'include');assert.equal(request.options.method,'POST');
 const bad=load('services/lichKhamDatTaiQuayService.ts',{}, {fetch:async()=>({ok:false,status:409,json:async()=>({message:'Occupied'})})});
 await assert.rejects(bad.datLichKhamTaiQuay({}),e=>e.status===409&&e.message==='Occupied');
});
