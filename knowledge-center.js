/* Water knowledge center: read-only local prototype built from reviewed samples. */
(function(){
  'use strict';
  const bundle=window.LandspireWaterKnowledge;
  if(!bundle||!window.KnowledgeModelCore)return;
  const store=window.KnowledgeModelCore.createStore(bundle);
  const ui={mode:'projects',q:'',space:'',type:'',goal:'',sample:null,panel:'logic',node:null,concept:'水景类型'};
  const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const eligible=()=>state.currentRole==='superadmin'&&hasPermission('records','read')&&hasPermission('knowledge','read');
  const allowedProjects=()=>rolePermissions[state.currentRole]?.scope==='all'?null:(rolePermissions[state.currentRole]?.projectIds||[]);
  const visibleSamples=()=>store.search({},allowedProjects());
  const activeSample=()=>visibleSamples().find(s=>s.id===ui.sample);
  const button=(text,action,attrs='',className='kc-button')=>`<button class="${className}" data-kc="${action}" ${attrs}>${text}</button>`;
  const tags=(items,className='')=>items.map(x=>`<span class="kc-tag ${className}">${safe(x)}</span>`).join('');
  const evidence=ids=>`<span class="kc-evidence">${ids.map(id=>button(safe(id),'source',`data-source="${safe(id)}" aria-label="查看来源 ${safe(id)}"`,'kc-source-link')).join('')}</span>`;
  const getFact=(id,field)=>store.values(id,field).join('、');
  const empty=(title,description)=>`<div class="kc-empty"><span aria-hidden="true">⌕</span><h3>${title}</h3><p>${description}</p>${button('清除筛选','reset')}</div>`;
  const badge=(text,amber=false)=>`<span class="kc-badge ${amber?'kc-amber':''}">${safe(text)}</span>`;
  const oldKnowledge=renderKnowledge;
  const titleHeader=()=>`<header class="kc-heading"><div><span class="kc-eyebrow">LANDSPIRE / DESIGN KNOWLEDGE</span><h1>知识中心</h1><p>从场地问题，找到有依据的设计做法。</p></div><div class="kc-heading-right">${badge('水景模型 V0.1')}<span>内容已核对 · 本地样本预览</span></div></header>`;
  function mainTabs(){
    return `<nav class="kc-main-tabs" aria-label="知识浏览方式">${[['projects','项目知识'],['concepts','行业知识'],['published','已发布知识']].map(([id,label])=>button(label,'mode',`data-mode="${id}" aria-pressed="${ui.mode===id}"`,ui.mode===id?'kc-main-tab active':'kc-main-tab')).join('')}<span>样本内容核对与知识发布分别记录</span></nav>`;
  }
  function tree(){
    const visible=visibleSamples();
    const count=type=>visible.filter(s=>s.types.includes(type)).length;
    const groups=[['静水',['镜面水','静水']],['流水',['坡面流水','附壁流水']],['跌落',['跌水','水帘','瀑布']],['喷泉',['旱喷','跳泉']],['喷雾',['雾森']]];
    return `<aside class="kc-tree"><div class="kc-tree-title"><h2>专业知识树</h2><span>水景</span></div>${button(`<span>全部水景样本</span><b>${visible.length}</b>`,'type','data-type=""',`kc-tree-all ${!ui.type?'active':''}`)}${groups.map(([name,children])=>`<details ${children.includes(ui.type)||['静水','流水'].includes(name)?'open':''}><summary>${name}</summary><div class="kc-tree-children">${children.map(type=>button(`<span>${safe(type)}</span><small>${count(type)}</small>`,'type',`data-type="${safe(type)}" aria-pressed="${ui.type===type}"`,`kc-tree-leaf ${ui.type===type?'active':''}`)).join('')}</div></details>`).join('')}<p class="kc-tree-note">数字表示本地样本数。<br>树中列出的是当前常用类型。</p>${button('查看完整标签口径 ↗','source','data-source="E08"','kc-tree-more')}</aside>`;
  }
  function filters(){
    const samples=visibleSamples();
    const options=(label,values,current)=>`<option value="">${label}</option>${[...new Set(values)].map(v=>`<option value="${safe(v)}" ${v===current?'selected':''}>${safe(v)}</option>`).join('')}`;
    return `<div class="kc-filter-box"><label class="kc-search"><span aria-hidden="true">⌕</span><input id="kc-search" type="search" aria-label="搜索知识样本" placeholder="输入空间、水景类型或设计问题…" value="${safe(ui.q)}"></label><div class="kc-filter-row"><label>空间<select id="kc-space" aria-label="筛选空间">${options('全部空间',samples.map(s=>s.spaceTerm),ui.space)}</select></label><label class="kc-mobile-type">水景类型<select id="kc-type-mobile" aria-label="筛选水景类型">${options('全部类型',[...samples.flatMap(s=>s.types),...(ui.type?[ui.type]:[])],ui.type)}</select></label><label>设计目标<select id="kc-goal" aria-label="筛选设计目标">${options('全部目标',samples.flatMap(s=>s.goals),ui.goal)}</select></label>${button('重置','reset','','kc-text-button')}<span>已确认内容参与关键词检索</span></div></div>`;
  }
  function samplePreview(s){
    const photo=bundle.sourceAssets[s.image];
    return `<article class="kc-sample"><button class="kc-cover" data-kc="sample" data-sample="${s.id}" aria-label="查看${safe(s.shortName)}"><img src="${photo.url}" alt="${safe(s.shortName)}水景效果图"><span>${safe(s.versionLabel)}</span></button><div class="kc-sample-copy"><p class="kc-project">${safe(s.projectLabel)} <span>／ ${safe(s.spaceTerm)}</span></p><h3>${button(safe(s.shortName),'sample',`data-sample="${s.id}"`,'kc-title-button')}</h3><p class="kc-problem">${safe(s.problems.map(p=>p.name).join('；'))}</p><div class="kc-tag-list">${tags(s.types)}</div><p class="kc-strategy">${safe(s.strategy)}</p><div class="kc-sample-foot"><span>${s.sources.length} 项来源 · 内容已核对</span>${button('查看设计逻辑 →','sample',`data-sample="${s.id}"`,'kc-text-button')}</div></div></article>`;
  }
  function listing(){
    const list=store.search(ui,allowedProjects());
    return `<div class="kc-browser">${tree()}<section class="kc-results">${filters()}<div class="kc-results-head"><h2>项目水景样本 <span>${list.length}</span></h2><p>${ui.type?safe(ui.type)+' · ':''}图文、设计原因与对象关系</p></div>${list.length?`<div class="kc-sample-grid">${list.map(samplePreview).join('')}</div>`:empty('没有匹配的已确认样本','可以缩短关键词，或调整空间与目标。待确认内容不参与确定事实检索。')}<div class="kc-how"><div><span>01</span><b>找到相似问题</b><p>从空间条件和设计目标切入</p></div><div><span>02</span><b>理解设计做法</b><p>查看水景部件及它们的关系</p></div><div><span>03</span><b>回到原始依据</b><p>对照方案、效果图与设计说明</p></div></div></section></div>`;
  }
  function logic(s){
    const subjects=[['场地条件',s.space.id],['问题',s.problems[0]?.id],['需求',s.needs[0]?.id],['设计做法',s.id]];
    const wanted={场地条件:['场地条件','业态背景'],问题:['问题描述'],需求:['需求描述'],设计做法:['设计做法']};
    const steps=subjects.map(([label,id],i)=>{const facts=store.factsFor(id,true).filter(f=>wanted[label].includes(f.field));return `<article class="kc-logic-step"><span class="kc-step-number">${String(i+1).padStart(2,'0')}</span><div><h3>${label}</h3><p>${facts.length?facts.map(f=>safe(f.value)).join('；'):safe(s.space.name)}</p>${evidence([...new Set(facts.flatMap(f=>f.evidence))])}</div></article>`;}).join('');
    const features=store.factsFor(s.id).filter(f=>['设计目标','运行特色','方向反馈','版本延续说明','术语澄清','底部收水方式'].includes(f.field));
    return `<div class="kc-logic-layout"><div><h2 class="kc-section-title">设计为什么这样做</h2><div class="kc-logic-chain">${steps}</div></div><aside class="kc-detail-aside"><h2 class="kc-section-title">对象与设计表达</h2><div class="kc-object-links">${s.objects.filter(e=>['水景部件','关联设施'].includes(e.type)).map(e=>button(`<span>${safe(e.name)}</span><small>${safe(e.type)} ↗</small>`,'inspect',`data-node="${e.id}"`,'kc-object-button')).join('')}</div><details class="kc-specifics" open><summary>目标、运行与确认范围</summary>${features.map(f=>`<div class="kc-feature"><label>${safe(f.field)} ${f.status!=='已确认'?badge(f.status,true):''}</label><p>${safe(f.value)}</p>${f.part?`<small>${safe(f.part)}</small>`:''}${evidence(f.evidence)}</div>`).join('')}</details></aside></div>`;
  }
  function graph(s){
    const current=ui.node&&s.ids.has(ui.node)?ui.node:s.id;
    const group=store.neighborhood(s,current);
    const center={id:current,x:310,y:Math.max(155,Math.ceil(group.nodes.length/2)*48),width:238,height:70};
    const points=new Map([[current,center]]);
    group.nodes.forEach((n,i)=>points.set(n.id,{id:n.id,x:i%2?620:0,y:30+Math.floor(i/2)*104,width:230,height:70}));
    const height=Math.max(280,Math.ceil(group.nodes.length/2)*104+30);
    const edges=group.relations.map(r=>{const a=points.get(r.subject),b=points.get(r.object);if(!a||!b)return '';const right=b.x>a.x;const x1=a.x+(right?a.width:0),x2=b.x+(right?0:b.width),y1=a.y+35,y2=b.y+35;const middle=(x1+x2)/2;return `<g><path d="M${x1},${y1} C${middle},${y1} ${middle},${y2} ${x2},${y2}" marker-end="url(#kc-arrow)"></path><text x="${middle}" y="${(y1+y2)/2-8}" text-anchor="middle">${safe(r.predicate)}</text></g>`;}).join('');
    const nodes=[group.center,...group.nodes].filter(Boolean).map(n=>{const p=points.get(n.id);const chunks=n.name.match(/.{1,13}/gu)||[n.name];return `<g class="kc-graph-node ${n.id===current?'selected':''}" role="button" tabindex="0" aria-label="查看对象 ${safe(n.name)}" data-kc="node" data-node="${n.id}"><rect x="${p.x}" y="${p.y}" width="${p.width}" height="70" rx="12"></rect><text class="kc-node-kind" x="${p.x+14}" y="${p.y+19}">${safe(n.type)}</text><text class="kc-node-name" x="${p.x+14}" y="${p.y+41}">${chunks.slice(0,2).map((t,i)=>`<tspan x="${p.x+14}" dy="${i?17:0}">${safe(t)}</tspan>`).join('')}</text><title>${safe(n.name)}</title></g>`;}).join('');
    const facts=store.factsFor(current);
    return `<div class="kc-graph-head"><div><h2 class="kc-section-title">点选对象，沿关系查看设计</h2><p>当前中心：${safe(store.name(current))}</p></div>${button('回到水景整体','node',`data-node="${s.id}"`)}</div><div class="kc-graph-scroll"><svg class="kc-graph" viewBox="-10 0 875 ${height}" role="group" aria-label="${safe(s.shortName)}对象关系图"><defs><marker id="kc-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="#82978c"></path></marker></defs><g class="kc-edges">${edges}</g>${nodes}</svg></div><div class="kc-graph-details"><section><h3>${safe(store.name(current))} · 属性</h3>${facts.length?facts.map(f=>`<div class="kc-property"><div><label>${safe(f.field)} ${f.status!=='已确认'?badge(f.status,true):''}</label><p>${safe(f.value)}</p>${f.part?`<small>${safe(f.part)}</small>`:''}</div>${evidence(f.evidence)}</div>`).join(''):'<p class="kc-muted">当前只登记对象身份与关联关系。</p>'}</section><section><h3>直接关联 · ${group.relations.length}</h3>${group.relations.map(r=>`<div class="kc-relation"><p>${button(safe(store.name(r.subject)),'node',`data-node="${r.subject}"`,'kc-inline-button')}<b>${safe(r.predicate)}</b>${button(safe(store.name(r.object)),'node',`data-node="${r.object}"`,'kc-inline-button')}</p>${evidence(r.evidence)}</div>`).join('')||'<p class="kc-muted">没有已登记的直接关系。</p>'}</section></div>`;
  }
  function sources(s){
    return `<div class="kc-section-heading"><h2 class="kc-section-title">每条信息，都能回到依据</h2><p>方案文字、效果图和设计师补充分别记录。点击来源查看原件及适用范围。</p></div><div class="kc-source-grid">${s.sources.map(source=>`<article class="kc-source-item"><div><span>${safe(source.id)} / ${safe(source.type)}</span><h3>${safe(source.name)}</h3><p>${safe(source.locator)}</p><small>${safe(source.scope)}</small></div>${button('查看依据 ↗','source',`data-source="${source.id}"`)}</article>`).join('')}</div>`;
  }
  function gaps(s){
    const items=store.model.pending.filter(g=>g.subject.split('、').some(id=>s.ids.has(id)));
    return `<div class="kc-section-heading"><h2 class="kc-section-title">保留尚未明确的信息</h2><p>这些事项不会阻止查看已确认内容。有相应资料时，再补充具体记录。</p></div><div class="kc-gap-list">${items.map(g=>`<article><div>${badge(g.state,true)}<h3>${safe(g.item)}</h3><p>${safe(g.action)}</p></div>${evidence(g.source.split('、'))}</article>`).join('')}</div>`;
  }
  function detail(s){
    const pending=store.model.pending.filter(g=>g.subject.split('、').some(id=>s.ids.has(id))).length;
    return `<div class="kc-detail-top">${button('← 返回样本','back','','kc-text-button')}<span>${safe(s.projectLabel)} / ${safe(s.versionLabel)} / ${safe(s.space.name)}</span></div><div class="kc-detail-hero"><button class="kc-detail-photo" data-kc="source" data-source="${s.image}" aria-label="查看完整效果图"><img src="${bundle.sourceAssets[s.image].url}" alt="${safe(s.shortName)}效果图"><span>查看完整效果图 ↗</span></button><div class="kc-detail-intro"><span class="kc-eyebrow">${safe(s.projectLabel)} / ${safe(s.versionLabel)}</span><h2>${safe(s.shortName)}</h2><p>${safe(s.strategy)}</p><div class="kc-tag-list">${tags(s.types)}</div><div class="kc-meta-pairs"><span>空间<b>${safe(s.spaceTerm)}</b></span><span>专业<b>水景</b></span><span>内容状态<b>已核对</b></span></div><small>设计目标尚无建成后的效果验证。</small></div></div><nav class="kc-detail-tabs" aria-label="样本详情">${[['logic','设计逻辑'],['graph','对象关系'],['sources',`来源依据 ${s.sources.length}`],['gaps',`待补信息 ${pending}`]].map(([id,label])=>button(label,'panel',`data-panel="${id}" aria-pressed="${ui.panel===id}"`,ui.panel===id?'active':'')).join('')}</nav><div class="kc-detail-body">${ui.panel==='graph'?graph(s):ui.panel==='sources'?sources(s):ui.panel==='gaps'?gaps(s):logic(s)}</div>`;
  }
  function concepts(){
    const definitions=[['项目','具体商业景观项目，是方案与空间的归属。'],['方案','在一个汇报版本内提出的具体设计选项。版本和方案号分别记录。'],['空间','项目中的具体区域，跨方案保持身份稳定。'],['组合水景','由多个部件构成的整体设计，用于关联整体目标与运行模式。'],['水景部件','镜面水、坡面流水、附壁流水等具体设计对象。'],['既有对象','改造前已存在的对象，保留与方案状态的对应。'],['关联设施','与水景关联的平台、景墙、灯光、植物、外摆等。'],['问题','场地或原有设计中需要改善的具体状况。'],['需求','由问题引出的设计目标，可由多个设计对象共同响应。'],['来源','支撑属性和关系的文档、图像或专业说明。']];
    const predicates=store.model.schema.predicates;
    return `<div class="kc-concepts"><div class="kc-concept-intro"><span class="kc-eyebrow">工作模型 / V0.1</span><h2>统一概念，保留项目差异</h2><p>这一层规定记录什么、怎样关联。秘境露台等项目名称放在具体案例中；圆形、镜面水等特征沿用共同的标签。</p><div class="kc-tag-list">${tags(['核心对象','属性字段','对象关系'])}</div></div><div class="kc-concept-columns"><section><h3>实体 · 我们记录哪些对象</h3><div class="kc-definition-list">${definitions.map(([name,desc])=>`<div><b>${name}</b><p>${desc}</p></div>`).join('')}</div></section><section><h3>属性 · 用同一套字段描述</h3><div class="kc-definition-list">${[['水景类型','镜面水、坡面流水、附壁流水等受控标签'],['几何特色','圆形、自由曲线等，并注明对应部位'],['设计目标','氛围营造、停留休憩等，记录预期目标'],['运行特色','分时运行、活动模式等，注明作用范围'],['确认状态','已确认、待确认、未提供分别记录'],['来源依据','每条重要属性和关系关联来源ID']].map(([name,desc])=>`<div><b>${name}</b><p>${desc}</p></div>`).join('')}</div><h3>关系 · 对象怎样连接</h3><div class="kc-tag-list">${tags(predicates)}</div><p class="kc-muted">例如：坡面流水 → 流入 → 镜面水。<br>这是对象之间的关系；圆形是对象的属性。</p>${button('查看水景标签口径','source','data-source="E08"')}</section></div><div class="kc-model-note">本版是用于整理案例的工作模型。项目策略保留场地条件与依据，行业通用结论仍需更多案例和专业资料支持。</div></div>`;
  }
  function renderModel(){
    if(!eligible())return oldKnowledge();
    const s=activeSample();
    if(ui.sample&&!s){ui.sample=null;ui.node=null;}
    return `<div class="kc">${titleHeader()}${mainTabs()}${ui.mode==='published'?`<div class="kc-published">${oldKnowledge()}</div>`:ui.mode==='concepts'?concepts():s?detail(s):listing()}<footer class="kc-footer"><span>已连接 ${visibleSamples().length} 个真实项目样本 · 水景知识结构 V0.1</span><a href="assets/knowledge-samples/water-samples.xlsx" download>下载样本登记表 ↗</a></footer></div>`;
  }
  renderKnowledge=renderModel;
  navNames.knowledge='知识中心';
  document.querySelector('#design-nav [data-page="knowledge"]').innerHTML='<span class="nav-icon">⌕</span>知识中心';
  const oldApplyRole=applyRole;
  applyRole=function(role){oldApplyRole(role);if(location.hash==='#knowledge-center'&&pageAllowed('knowledge'))state.page='knowledge';};

  let priorFocus=null;
  function closeSource(){const overlay=document.querySelector('.kc-source-overlay');if(overlay)overlay.remove();if(priorFocus?.isConnected)priorFocus.focus();priorFocus=null;}
  function showSource(id){
    const source=store.sourceById.get(id),asset=bundle.sourceAssets[id];
    const s=activeSample();
    if(!source||!asset||!(id==='E08'||(s?s.sources.some(x=>x.id===id):visibleSamples().some(x=>x.sources.some(y=>y.id===id)))))return;
    closeSource();priorFocus=document.activeElement;
    const picture=['.png','.jpg','.jpeg'].includes(asset.extension);
    const content=picture?`<figure><img src="${asset.url}" alt="${safe(source.name)}"><figcaption>${safe(source.scope)}</figcaption></figure>`:asset.text?`<pre class="kc-source-text">${safe(asset.text)}</pre>`:`<div class="kc-document-preview"><span aria-hidden="true">▤</span><h3>${safe(source.name)}</h3><p>${safe(source.locator)}</p><p>${safe(source.scope)}</p><a href="${asset.url}${asset.extension==='.pdf'?'#page=31':''}" target="_blank" rel="noopener" ${asset.extension!=='.pdf'?'download':''}>${asset.extension==='.pdf'?'打开方案 PDF · 第31页':'下载原文件'} ↗</a></div>`;
    const root=document.createElement('div');root.className='kc-source-overlay';
    root.innerHTML=`<section class="kc-source-dialog" role="dialog" aria-modal="true" aria-labelledby="kc-source-title"><header><div><span>${safe(source.id)} · ${safe(source.type)}</span><h2 id="kc-source-title">${safe(source.name)}</h2></div>${button('×','close-source','aria-label="关闭来源"','kc-close')}</header><div class="kc-source-context"><b>${safe(source.locator)}</b><p>${safe(source.basis)}</p></div><div class="kc-source-body">${content}</div><footer><span>${picture?'效果图表达，不代表建成结果':safe(source.scope)}</span><a href="${asset.url}" download>下载来源文件</a></footer></section>`;
    document.body.append(root);root.querySelector('.kc-close').focus();
  }
  function refresh(focusId=null){
    const input=focusId?document.getElementById(focusId):null;
    const pos=input?.selectionStart;
    render();
    if(focusId){const el=document.getElementById(focusId);el?.focus();if(pos!==null&&pos!==undefined&&el?.type!=='search')el?.setSelectionRange(pos,pos);}
  }
  document.addEventListener('click',event=>{
    if(event.target.classList.contains('kc-source-overlay')){closeSource();return;}
    const el=event.target.closest('[data-kc]');if(!el||!eligible()||state.page!=='knowledge')return;
    event.preventDefault();
    const action=el.dataset.kc;
    if(action==='source'){showSource(el.dataset.source);return;}
    if(action==='close-source'){closeSource();return;}
    if(action==='mode'){ui.mode=el.dataset.mode;ui.sample=null;ui.node=null;}
    if(action==='type'){ui.type=el.dataset.type;ui.sample=null;}
    if(action==='reset'){Object.assign(ui,{q:'',space:'',type:'',goal:''});}
    if(action==='sample'){ui.sample=el.dataset.sample;ui.panel='logic';ui.node=ui.sample;}
    if(action==='back'){ui.sample=null;ui.node=null;}
    if(action==='panel')ui.panel=el.dataset.panel;
    if(action==='node'||action==='inspect'){ui.node=el.dataset.node;ui.panel='graph';}
    refresh();
    if(['sample','back','mode'].includes(action))window.scrollTo(0,0);
  });
  document.addEventListener('input',e=>{if(e.target.id==='kc-search'&&eligible()){ui.q=e.target.value;refresh('kc-search');}});
  document.addEventListener('change',e=>{if(!eligible())return;if(e.target.id==='kc-space')ui.space=e.target.value;else if(e.target.id==='kc-goal')ui.goal=e.target.value;else if(e.target.id==='kc-type-mobile')ui.type=e.target.value;else return;refresh(e.target.id);});
  document.addEventListener('keydown',e=>{
    const overlay=document.querySelector('.kc-source-overlay');
    if(overlay){if(e.key==='Escape'){e.preventDefault();closeSource();}if(e.key==='Tab'){const items=[...overlay.querySelectorAll('button,a[href]')],first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}return;}
    if((e.key==='Enter'||e.key===' ')&&e.target.matches('g[data-kc="node"]')){e.preventDefault();ui.node=e.target.dataset.node;refresh();}
  });
  window.addEventListener('hashchange',()=>{if(location.hash==='#knowledge-center'&&state.currentRole&&pageAllowed('knowledge')){state.page='knowledge';render();}});
})();
