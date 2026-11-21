const {test,beforeEach,after}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
function load(file,deps={}) {
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};new Function('require','module','exports',code)(name=>deps[name]||require(name),mod,mod.exports);return mod.exports;
}
const tracking=load('src/lib/tracking.ts'), visitor=load('src/lib/visitor.ts');
const {POST}=load('src/app/api/visit/route.ts',{'@/lib/tracking':tracking});
const id='a77e3b46-5748-442f-bc22-10aaed15de40';
const envKeys=['CRM_LEADS_ENDPOINT','LANDING_API_KEY','LANDING_PRODUCT_ID','SITE_URL'];
const saved=Object.fromEntries(envKeys.map(key=>[key,process.env[key]]));
const oldFetch=global.fetch,oldWindow=global.window;
let calls;
beforeEach(()=>{
 process.env.CRM_LEADS_ENDPOINT='https://crm.invalid/api/leads';process.env.LANDING_API_KEY='unit-test-key';process.env.LANDING_PRODUCT_ID='mock-lamp';delete process.env.SITE_URL;
 calls=[];global.fetch=async(...args)=>{calls.push(args);return new Response(null,{status:204});};
});
after(()=>{global.fetch=oldFetch;global.window=oldWindow;for(const key of envKeys)if(saved[key]===undefined)delete process.env[key];else process.env[key]=saved[key];});
const request=(body={visitorId:id},headers={})=>new Request('https://led-lamp.onrender.com/api/visit',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
test('server forwards only anonymous visitor plus server-configured URL/product; key never appears in browser response',async()=>{
 const response=await POST(request({visitorId:id,url:'https://evil.invalid',productId:'evil',phone:'private',name:'private'}));
 assert.equal(response.status,204);assert.equal(await response.text(),'');
 const [url,options]=calls[0];assert.equal(url,'https://crm.invalid/api/landing-visits');
 assert.equal(options.headers['x-api-key'],'unit-test-key');assert.equal(options.redirect,'error');assert.equal(options.cache,'no-store');
 assert.deepEqual(JSON.parse(options.body),{url:'https://led-lamp.onrender.com',productId:'mock-lamp',visitorId:id});
});
test('malformed visitor, cross-origin calls and oversized payload do not reach CRM',async()=>{
 for(const body of [null,{}, {visitorId:'phone'}])assert.equal((await POST(request(body))).status,400);
 assert.equal((await POST(request(undefined,{'Origin':'https://evil.invalid'}))).status,403);
 assert.equal((await POST(request({visitorId:id,extra:'x'.repeat(1100)}))).status,413);
 assert.equal((await POST(request(undefined,{'Content-Type':'text/plain'}))).status,415);
 assert.equal(calls.length,0);
});
test('missing configuration and insecure endpoints fail without upstream calls',async()=>{
 for(const key of ['CRM_LEADS_ENDPOINT','LANDING_API_KEY','LANDING_PRODUCT_ID']) {
  const val=process.env[key];delete process.env[key];assert.equal((await POST(request())).status,503);process.env[key]=val;
 }
 for(const endpoint of ['http://crm.invalid/api/leads','https://user:pass@crm.invalid/api/leads','https://crm.invalid/other','not-url']) {
  process.env.CRM_LEADS_ENDPOINT=endpoint;assert.equal((await POST(request())).status,503);
 }
 assert.equal(calls.length,0);
});
test('analytics errors remain empty generic responses and do not expose upstream data',async()=>{
 for(const fetcher of [async()=>Response.json({error:'secret detail'},{status:503}),async()=>{throw new Error('secret');}]) {
  global.fetch=fetcher;const response=await POST(request());assert.equal(response.status,502);assert.equal(await response.text(),'');
 }
});
test('anonymous visitor persists across refresh and records no personal data; blocked storage skips tracking',()=>{
 const map=new Map();let generated=0;const storage={getItem:key=>map.get(key),setItem:(key,value)=>map.set(key,value)};
 const random=()=>{generated++;return id;};
 assert.equal(visitor.anonymousVisitor(storage,random),id);assert.equal(visitor.anonymousVisitor(storage,random),id);assert.equal(generated,1);
 assert.deepEqual([...map.values()],[id]);
 assert.equal(visitor.anonymousVisitor({getItem(){throw new Error('blocked');},setItem(){}},random),null);
});
test('invisible tracker calls only its own server, including on refresh, and safely ignores failure',async()=>{
 const map=new Map();global.window={localStorage:{getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)}};
 const effects=[];const {VisitTracker}=load('src/components/visit-tracker.tsx',{'react':{useEffect:fn=>effects.push(fn)},'@/lib/visitor':visitor});
 assert.equal(VisitTracker(),null);effects.shift()();await new Promise(r=>setImmediate(r));
 VisitTracker();effects.shift()();await new Promise(r=>setImmediate(r));
 assert.equal(calls.length,2);assert.equal(calls[0][0],'/api/visit');
 assert.deepEqual(JSON.parse(calls[0][1].body),JSON.parse(calls[1][1].body));
 assert.deepEqual(Object.keys(JSON.parse(calls[0][1].body)),['visitorId']);
 global.fetch=async()=>{throw new Error('offline');};VisitTracker();effects.shift()();await new Promise(r=>setImmediate(r));
});
