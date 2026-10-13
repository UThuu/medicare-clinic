const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ts = require('typescript'), React = require('react');
const {create,act}=require('react-test-renderer');
const text=n=>typeof n==='string'?n:(n.children||[]).map(text).join('');
function harness(api,initialTab='cho-lap') {
 const cache=new Map();
 function Layout({children,sidebarItems,doctorName,roleLabel}) {return React.createElement('div',null,doctorName,roleLabel,React.createElement('aside',null,sidebarItems.map(i=>React.createElement('a',{key:i.label,href:i.href,'data-active':i.active},i.label))),children);}
 const load=file=>{
  if(cache.has(file))return cache.get(file);
  const compiled=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  const exports={};cache.set(file,exports);
  vm.runInNewContext(compiled,{exports,console,setTimeout:()=>0,require:id=>{
   if(id==='react'||id==='react/jsx-runtime')return require(id);
   if(id==='react-router-dom')return {useSearchParams:()=>{const [tab,setTab]=React.useState(initialTab);return [new URLSearchParams({tab}),p=>setTab(p.tab)];}};
   if(id.endsWith('contexts/AuthContext'))return {useAuth:()=>({user:{hoTen:'Session Cashier',vaiTro:'THU_NGAN'}})};
   if(id.endsWith('services/hoaDonService'))return {hoaDonService:api};
   if(id.endsWith('layout/MainLayout'))return {MainLayout:Layout};
   if(id.endsWith('.css'))return {};
   if(id.startsWith('.')){const f=path.posix.normalize(path.posix.join(path.posix.dirname(file),id));return load(fs.existsSync(path.join(__dirname,'../src',f+'.tsx'))?f+'.tsx':f+'.ts');}
   throw Error('Unexpected import '+id);
  }});return exports;
 };
 return load('pages/cashier/TaoHoaDonPage.tsx').TaoHoaDonPage;
}
function api(extra={}){return {getDanhSachChoLapHoaDon:async()=>[],getDanhSachTatCaHoaDon:async()=>[],...extra};}
test('billing sidebar uses API counts and session identity; selected route determines content',async()=>{
 let page;const Page=harness(api(),'da-lap');try{await act(async()=>{page=create(React.createElement(Page));});assert.ok(text(page.root).includes('Session Cashier'));const links=page.root.findByType('aside').findAllByType('a');assert.ok(text(links[0]).includes('(0)'));assert.equal(links[1].props['data-active'],true);assert.ok(page.root.findByProps({id:'btn-tab-da-lap'}).props.className.includes('active'));}finally{if(page)act(()=>page.unmount());}
});
test('billing load error is visible instead of a successful empty list',async()=>{
 let page;const Page=harness(api({getDanhSachChoLapHoaDon:async()=>{throw {response:{data:{error:'Forbidden'}}};}}));try{await act(async()=>{page=create(React.createElement(Page));});assert.ok(text(page.root).includes('Forbidden'));}finally{if(page)act(()=>page.unmount());}
});
test('invoice confirmation submits visit only and ignores repeated clicks while saving',async()=>{
 let resolve, sent=[];const pending={idLuotKham:'V',tenBenhNhan:'Patient',trangThaiLuotKham:'HOAN_TAT'};
 const preview={...pending,phiKham:150000,tienThuoc:0,tongTien:150000,danhSachKhoanThu:[],daCoHoaDon:false};
 const Page=harness(api({getDanhSachChoLapHoaDon:async()=>[pending],getChiPhiDuKien:async()=>preview,taoHoaDon:r=>{sent.push(r);return new Promise(done=>{resolve=done;});}}));let page;
 try{await act(async()=>{page=create(React.createElement(Page));});const open=page.root.findAllByType('button').find(b=>b.props.onClick&&text(b).includes('Lập hóa đơn'));assert.ok(open);await act(async()=>open.props.onClick());const button=page.root.findAllByType('button').find(b=>text(b).includes('Xác nhận'));assert.ok(button);let work;await act(async()=>{work=button.props.onClick();button.props.onClick();});assert.equal(sent.length,1);assert.equal(JSON.stringify(sent[0]),JSON.stringify({idLuotKham:'V'}));await act(async()=>{resolve({idHoaDon:'H'});await work;});assert.ok(page.root.findByProps({id:'btn-tab-da-lap'}).props.className.includes('active'));}finally{if(page)act(()=>page.unmount());}
});
