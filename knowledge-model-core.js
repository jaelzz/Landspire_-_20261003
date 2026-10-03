/* Structured sample queries. No publication or permission state is changed here. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.KnowledgeModelCore=factory();
})(typeof window==='undefined'?this:window,function(){
  'use strict';
  function createStore(bundle){
    const model=bundle.model;
    const byId=new Map(model.entities.map(e=>[e.id,e]));
    const sourceById=new Map(model.sources.map(e=>[e.id,e]));
    const factsFor=(id,confirmedOnly=false)=>model.facts.filter(f=>f.subject===id&&(!confirmedOnly||f.status==='已确认'));
    const values=(id,field)=>factsFor(id,true).filter(f=>f.field===field).map(f=>f.value);
    const outgoing=(id,predicate)=>model.relations.filter(r=>r.subject===id&&r.status==='已确认'&&(!predicate||r.predicate===predicate));
    const name=id=>byId.get(id)?.name||id;
    function sampleInfo(meta){
      const root=byId.get(meta.id);
      const objects=model.entities.filter(e=>e.project===root.project&&(e.scheme===root.scheme||e.space===root.space));
      const ids=new Set([root.id,root.space,root.scheme,root.project,...objects.map(o=>o.id)]);
      const need=outgoing(root.id,'响应需求').map(r=>byId.get(r.object)).filter(Boolean);
      const problems=need.flatMap(n=>outgoing(n.id,'回应问题').map(r=>byId.get(r.object))).filter(Boolean);
      const water=objects.filter(e=>e.type==='水景部件');
      const types=[...new Set(water.flatMap(e=>values(e.id,'水景类型')))];
      const goals=values(root.id,'设计目标');
      return {...meta,root,objects,ids,water,types,goals,needs:need,problems,space:byId.get(root.space),scheme:byId.get(root.scheme),spaceTerm:values(root.space,'空间检索词')[0]||'未分类',strategy:values(root.id,'设计做法')[0]||'',sources:[...new Set([meta.image,...model.facts.filter(f=>ids.has(f.subject)).flatMap(f=>f.evidence),...model.relations.filter(r=>ids.has(r.subject)&&ids.has(r.object)).flatMap(r=>r.evidence)])].map(id=>sourceById.get(id)).filter(Boolean)};
    }
    const samples=bundle.samples.map(sampleInfo);
    function search(filters={},allowedProjects=null){
      const tokens=(filters.q||'').trim().toLowerCase().split(/\s+/).filter(Boolean);
      const searchable=new Set(['水景类型','几何特色','空间检索词','业态背景','场地条件','问题描述','需求描述','改造方式','设计做法','设计目标','运行特色','支持活动']);
      return samples.filter(s=>{
        if(allowedProjects&&!allowedProjects.includes(s.root.project))return false;
        if(filters.space&&filters.space!==s.spaceTerm)return false;
        if(filters.type&&!s.types.includes(filters.type))return false;
        if(filters.goal&&!s.goals.includes(filters.goal))return false;
        const corpus=[s.shortName,s.projectLabel,s.versionLabel,s.space.name,...model.facts.filter(f=>s.ids.has(f.subject)&&f.status==='已确认'&&searchable.has(f.field)).map(f=>f.value)].join(' ').toLowerCase();
        return tokens.every(t=>corpus.includes(t));
      });
    }
    function neighborhood(sample,id){
      if(!sample.ids.has(id))return {center:null,nodes:[],relations:[]};
      const relations=model.relations.filter(r=>r.status==='已确认'&&sample.ids.has(r.subject)&&sample.ids.has(r.object)&&(r.subject===id||r.object===id)&&!['属于方案','属于项目'].includes(r.predicate));
      const ids=[...new Set(relations.flatMap(r=>[r.subject,r.object]))].filter(x=>x!==id);
      return {center:byId.get(id),nodes:ids.map(x=>byId.get(x)),relations};
    }
    return {model,bundle,byId,sourceById,name,factsFor,values,outgoing,samples,search,neighborhood};
  }
  return {createStore};
});
