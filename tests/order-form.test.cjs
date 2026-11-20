const {test,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const React=require('react');
const originalFetch=global.fetch,OriginalFormData=global.FormData;
function load(file,deps={}) {
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const mod={exports:{}};
 new Function('require','module','exports',code)(name=>deps[name]||require(name),mod,mod.exports);return mod.exports;
}
const order=load('src/lib/order.ts');
let current;
const hooks={...React,useState:v=>current.state(v),useRef:v=>current.ref(v),useEffect:fn=>current.effect(fn)};
const {OrderForm}=load('src/components/order-form.tsx',{'react':hooks,'next/image':()=>null,'@/lib/order':order});
global.FormData=class {constructor(form){this.form=form;}get(key){return this.form.fields[key];}};
after(()=>{global.fetch=originalFetch;global.FormData=OriginalFormData;});
function nodes(node){if(!node||typeof node!=='object')return [];if(Array.isArray(node))return node.flatMap(nodes);return [node,...nodes(node.props?.children)];}
function text(node){if(typeof node==='string')return node;if(Array.isArray(node))return node.map(text).join('');return node?.props?text(node.props.children):'';}
function harness(){
 const h={slots:[],index:0,effects:[],tree:null,
 state(initial){const i=this.index++;if(!(i in this.slots))this.slots[i]=initial;return[this.slots[i],v=>{this.slots[i]=typeof v==='function'?v(this.slots[i]):v;}];},
 ref(initial){const i=this.index++;if(!(i in this.slots))this.slots[i]={current:initial};return this.slots[i];},
 effect(fn){const i=this.index++;if(!(i in this.slots)){this.slots[i]=true;this.effects.push(fn);}},
 render(){current=this;this.index=0;this.tree=OrderForm();return this;},
 submit(form){const el=nodes(this.tree).find(n=>n.type==='form');return el.props.onSubmit({preventDefault(){},currentTarget:form});}
 };
 h.render();h.effects.splice(0).forEach(fn=>fn());return h.render();
}
function form(){return {fields:{name:'Олександр',phone:'067 123 45 67'},resets:0,elements:{namedItem(){return {focus(){}};}},reset(){this.resets++;this.fields={name:'',phone:''};}};}

test('real form blocks a simultaneous second submission and sends only contacts plus requestId',async()=>{
 const h=harness(),f=form(),calls=[];let finish;
 global.fetch=async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return new Promise(resolve=>{finish=resolve;});};
 const first=h.submit(f),second=h.submit(f);h.render();
 assert.equal(calls.length,1);assert.equal(calls[0].url,'/api/order');
 assert.deepEqual(Object.keys(calls[0].body).sort(),['name','phone','requestId']);
 assert.equal(calls[0].body.phone,'+380671234567');
 assert.equal(nodes(h.tree).find(n=>n.type==='button').props.disabled,true);
 finish(Response.json({success:true}));await first;await second;h.render();
 assert.equal(f.resets,1);assert.match(text(h.tree),/Ваше замовлення прийнято/);
});

test('form retains contacts on error and reuses the same requestId on a manual retry',async()=>{
 const h=harness(),f=form(),calls=[];
 global.fetch=async(url,options)=>{calls.push(JSON.parse(options.body));return Response.json({success:false},{status:502});};
 await h.submit(f);h.render();
 assert.equal(f.resets,0);assert.equal(f.fields.name,'Олександр');assert.match(text(h.tree),/Не вдалося відправити/);
 global.fetch=async(url,options)=>{calls.push(JSON.parse(options.body));return Response.json({success:true});};
 await h.submit(f);h.render();
 assert.equal(calls[0].requestId,calls[1].requestId);assert.equal(f.resets,1);
});
