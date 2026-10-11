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
  vm.runInNewContext(code,{exports:result,console,Error,require:id=>{
   if(id==='react'||id==='react/jsx-runtime')return require(id);
   if(id==='react-router-dom')return {useNavigate:()=>url=>calls.push({navigate:url})};
   if(id.endsWith('contexts/AuthContext'))return {useAuth:()=>({user:{hoTen:'Session cashier'},checkSession:async()=>calls.push({session:true})})};
   if(id.endsWith('services/authService'))return {ApiError};
   if(id.endsWith('services/hoaDonTongDoanhThuService'))return {hoaDonTongDoanhThuService:{xemTongDoanhThu:request=>{calls.push(request);return search(request,ApiError);}}};
   if(id.endsWith('/MainLayout'))return {MainLayout};
   if(id.endsWith('.css'))return {};
   if(id.startsWith('.')){const rel=path.posix.normalize(path.posix.join(path.posix.dirname(file),id));return load(fs.existsSync(path.join(__dirname,'../src',rel+'.tsx'))?rel+'.tsx':rel+'.ts');}
   throw Error('Unexpected dependency '+id);
  }});return result;
 };
 return {Page:load('pages/HoaDonTongDoanhThu.tsx').HoaDonTongDoanhThu,calls};
}

const submit=page=>page.root.findByType('form').props.onSubmit({preventDefault(){}});
test('revenue uses shared cashier navigation and genuine zero result',async()=>{
 const h=harness(async r=>({...r,tongDoanhThu:0,soHoaDonDaThanhToan:0,thongBao:'No paid invoices'}));let page;
 try{await act(async()=>{page=create(React.createElement(h.Page));});assert.equal(page.root.findAllByType('a').length,4);assert.equal(page.root.findAllByType('a')[3].props['data-active'],true);await act(async()=>submit(page));assert.ok(text(page.root).includes('No paid invoices'));assert.equal(h.calls.length,1);}finally{if(page)act(()=>page.unmount());}
});
test('invalid range blocks API and server errors remain visible',async()=>{
 const h=harness(async(r,E)=>{throw new E('Server error',400)});let page;
 try{await act(async()=>{page=create(React.createElement(h.Page));});const dates=page.root.findAllByType('input');act(()=>{dates[0].props.onChange({target:{value:'2026-10-13'}});dates[1].props.onChange({target:{value:'2026-10-12'}});});await act(async()=>submit(page));assert.equal(h.calls.length,0);act(()=>dates[0].props.onChange({target:{value:'2026-10-11'}}));await act(async()=>submit(page));assert.ok(text(page.root).includes('Server error'));}finally{if(page)act(()=>page.unmount());}
});
test('duplicate submissions are blocked while loading',async()=>{
 let finish;const h=harness(()=>new Promise(resolve=>{finish=resolve}));let page;
 try{await act(async()=>{page=create(React.createElement(h.Page));});let work;await act(async()=>{work=submit(page);submit(page);});assert.equal(h.calls.length,1);assert.ok(page.root.findAllByType('input').every(i=>i.props.disabled));await act(async()=>{finish({tongDoanhThu:150000,soHoaDonDaThanhToan:1});await work;});}finally{if(page)act(()=>page.unmount());}
});
