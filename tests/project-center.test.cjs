const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../project-center.js'),'utf8');
function harness(saved={}){
  const listeners={},fields={},messages=[],memory={...saved};let failSave=false;
  const element=id=>fields[id]??(fields[id]={value:'',innerHTML:'',checked:false,classList:{add(){},remove(){},toggle(){}},insertAdjacentHTML(){}});
  const state={currentRole:'manager',currentAccount:'pm@example.com',activeProjectId:'H001',page:'project-detail'};
  const projects=[{id:'H001',name:'测试景观项目',projectType:'商业景观'}];
  const context={console,Date,JSON,Math,Number,String,Object,Array,Set,crypto:require('node:crypto').webcrypto,setTimeout,clearTimeout,state,designerProjects:projects,versions:[],pageModules:{},navNames:{},
    accessUsers:[{account:'pm@example.com',name:'项目经理'}],roleConfig:{manager:{name:'项目经理'},designer:{name:'设计师'}},rolePermissions:{manager:{scope:'all'},designer:{scope:'all'}},
    accessibleProjects:()=>projects,hasPermission:(m,o)=>o==='read'||o==='create'||o==='update'||state.currentRole==='manager',pageAllowed:()=>true,
    esc:s=>String(s??'').replaceAll('<','&lt;'),heading:()=>'',toast:s=>messages.push(s),modal:(...args)=>{context.lastModal=args;},render(){},
    localStorage:{getItem:k=>memory[k]??null,setItem:(k,v)=>{if(failSave)throw Error('quota');memory[k]=v;}},
    document:{addEventListener:(t,fn)=>{(listeners[t]??=[]).push(fn);},querySelector:()=>element('selector'),querySelectorAll:()=>[],getElementById:element,body:{classList:{remove(){}}}},
    window:{scrollTo(){},landspireDesign:{syncProjectVersions(){},confirmVersion(){},projectReports(){return [];},openSource(){return false;}}}
  };
  vm.createContext(context);vm.runInContext(source,context);
  function click(name,data={}){const button={dataset:{pc:name,...data},disabled:false};listeners.click.forEach(fn=>fn({target:{closest:()=>button},preventDefault(){},stopPropagation(){}}));}
  return {context,fields,element,click,messages,memory,state,read:()=>JSON.parse(memory['landspire.projects.v1']||'{}'),fail:()=>{failSave=true;}};
}
const v={id:'v3-test',projectId:'H001',number:'V3',sequence:3,title:'入口优化',note:'简化铺装',requirement:'提升入口识别',dimensions:{objects:'铺装'},by:'设计师',at:'2026-10-01T10:00:00Z',output:{src:'assets/candidate-a.svg',title:'概念示意'},confirmation:null,conversationId:'private-conversation',messages:[{text:'private'}],image:{url:'private-image'}};
const h=harness();h.context.window.landspireProjects.syncVersions([v],'designer@example.com');
assert.equal(h.read().versions.length,1);
assert.equal(h.read().versions[0].messages,undefined,'Private conversation messages must not enter project snapshots');
assert.equal(h.read().versions[0].image,undefined,'Private attachments must not enter project snapshots');
h.click('designate-save',{id:v.id});
assert.equal(h.read().projects.H001,undefined,'Unconfirmed output cannot become the delivery');
h.state.currentRole='designer';h.click('confirm-save',{id:v.id});
assert.equal(h.read().confirmations[v.id],undefined,'Designers cannot confirm output');
h.state.currentRole='manager';h.click('confirm-save',{id:v.id});
assert.equal(h.read().confirmations[v.id].by,'项目经理');
h.click('designate-save',{id:v.id});
assert.equal(h.read().projects.H001.delivery.versionId,v.id);
const delivery=h.read().projects.H001.delivery;
h.context.window.landspireProjects.syncVersions([{...v,id:'v4-test',number:'V4',sequence:4,note:'新的候选',at:'2026-10-02T10:00:00Z'}],'designer@example.com');
assert.deepEqual(h.read().projects.H001.delivery,delivery,'A newer candidate must not silently replace the designated delivery');
const reloaded=harness(h.memory);
assert.equal(reloaded.read().projects.H001.delivery.snapshot.note,'简化铺装','Delivery snapshot persists across reload');
assert.equal(reloaded.context.window.landspireProjects.maxSequence('H001'),4,'Version numbering sees shared versions');
reloaded.state.currentRole='designer';reloaded.click('designate-save',{id:'v4-test'});
assert.equal(reloaded.read().projects.H001.delivery.versionId,v.id,'Designer cannot replace delivery');
['pc-concept','pc-rationale','pc-req-tags','pc-scheme-tags','pc-area','pc-layout','pc-reason','pc-changes','pc-evidence'].forEach(id=>reloaded.element(id).value='修改后的说明');
reloaded.click('save-version-meta',{id:v.id});
assert.equal(reloaded.read().versionMeta[v.id].concept,'修改后的说明');
assert.equal(reloaded.read().projects.H001.delivery.snapshot.presentation.concept,delivery.snapshot.presentation.concept,'Editing a version does not change the already designated snapshot');
const unchanged=JSON.stringify(reloaded.read());reloaded.fail();reloaded.state.currentRole='manager';reloaded.click('confirm-save',{id:'v4-test'});
assert.equal(JSON.stringify(reloaded.read()),unchanged,'Storage errors must not report a persisted mutation');
assert.ok(reloaded.messages.at(-1).includes('本地保存失败'));
console.log('PASS: role gates, private chat boundary, confirmation, manual delivery, snapshot stability, reload persistence, shared version numbering and save-failure handling');
