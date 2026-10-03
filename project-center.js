/* Internal project workspace. Shared project snapshots stay in this browser. */
(() => {
  'use strict';
  const key='landspire.projects.v1';
  const clone=value=>JSON.parse(JSON.stringify(value));
  const safe=value=>esc(value??'');
  const actor=()=>accessUsers.find(u=>u.account.toLowerCase()===state.currentAccount)?.name||roleConfig[state.currentRole]?.name||'当前用户';
  const stamp=()=>new Date().toISOString();
  const date=value=>value?new Date(value).toLocaleDateString('zh-CN',{timeZone:'Asia/Shanghai'}):'待补录';
  const timestamp=value=>value?new Date(value).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false}):'待补录';
  const canEdit=()=>hasPermission('projects','update');
  const canReview=()=>hasPermission('projects','review');
  const action=(label,name,attrs='',primary=false)=>`<button class="btn ${primary?'btn-primary':''} btn-sm" data-pc="${name}" ${attrs}>${label}</button>`;
  const nav=(label,page,id='')=>`<button class="btn btn-sm" data-page="${page}" ${id?`data-project-id="${safe(id)}"`:''}>${label}</button>`;
  const statuses=['进行中','待确认','已完成','已归档'];
  let store={schema:1,projects:{},versions:[],versionMeta:{},confirmations:{},completedTodos:{}};
  let storageOK=true,search='',filter='all',sort='updated',listPage=1,reportMode=false,galleryIndex=0;
  try {const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved?.schema===1&&saved.projects&&Array.isArray(saved.versions))store={...store,...saved};} catch {storageOK=false;}
  let committed=JSON.stringify(store);
  function persist(){
    try{localStorage.setItem(key,JSON.stringify(store));committed=JSON.stringify(store);storageOK=true;return true;}
    catch{store=JSON.parse(committed);storageOK=false;toast('本地保存失败，改动尚未保存。请释放浏览器存储空间后重试。');return false;}
  }
  function hydrate(){
    Object.values(store.projects).forEach(p=>{const existing=designerProjects.find(x=>x.id===p.id);if(existing)Object.assign(existing,p);else designerProjects.push(clone(p));});
  }
  hydrate();
  function project(id){
    const base=designerProjects.find(p=>p.id===id);if(!base)return null;
    return {status:base.placeholder?'待确认':'进行中',featured:id==='H001',startDate:'',endDate:'',createdBy:'待补录',updatedBy:'待补录',updatedAt:'',...base,...store.projects[id]};
  }
  function visibleProjects(){hydrate();return accessibleProjects().map(p=>project(p.id));}
  function allowed(id){return visibleProjects().some(p=>p.id===id);}
  function syncVersions(items,owner){
    let changed=false;
    items.forEach(v=>{
      if(!v.projectId)return;
      // Project deliverables contain no private chat messages or uploaded chat attachments.
      const snapshot={id:v.id,projectId:v.projectId,number:v.number,sequence:v.sequence,title:v.title,note:v.note,requirement:v.requirement,dimensions:clone(v.dimensions||{}),by:v.by,at:v.at,parentVersion:v.parentVersion,output:clone(v.output),confirmation:v.confirmation?clone(v.confirmation):null,requirementConfirmation:v.requirementConfirmation?clone(v.requirementConfirmation):null,conversationId:v.conversationId,owner,kind:'assistant'};
      const index=store.versions.findIndex(x=>x.id===snapshot.id);
      if(index<0){store.versions.push(snapshot);changed=true;}else if(JSON.stringify(store.versions[index])!==JSON.stringify(snapshot)){store.versions[index]=snapshot;changed=true;}
    });
    if(changed)persist();
  }
  window.landspireProjects={syncVersions,confirmationFor:id=>store.confirmations[id]?clone(store.confirmations[id]):null,maxSequence:id=>Math.max(0,...store.versions.filter(v=>v.projectId===id).map(v=>Number(v.sequence)||0))};
  function legacyVersions(id){
    if(id!=='H001')return [];
    return versions.map((v,i)=>({id:v.id,projectId:id,number:`V${i+1}`,sequence:i+1,title:v.name,at:v.date.replaceAll('.','-')+'T12:00:00+08:00',by:'原项目团队（姓名待补）',images:v.images.map(im=>'assets/'+im),kind:'legacy',parentVersion:i?'v1':null,confirmation:null,
      requirement:i?'简化细碎铺装，调整投入重点，提升主入口识别与到达体验。':'原始任务书待补录；当前资料保留了主入口概念方案。',
      note:i?'简化铺装表达，将入口体验重点转向水景节点。':'建立主入口空间与铺装表达的初始方案基线。',
      dimensions:{layout:'延续主入口空间关系；详细总平面与尺寸待补录。'},
      concept:i?'简化地面表达，集中塑造入口体验。':'以主入口空间组织和铺装变化形成场地体验。',
      rationale:i?'根据已记录的甲方反馈，将方案关注点从细碎铺装转向入口节点；水景的建设和维护条件仍需进一步核验。':'基于现有概念效果图整理，原始方案说明待补录。',
      reason:i?'甲方认为 V1 铺装较细碎，希望避免预算过多集中在铺装，并提出探索水景节点。':'首版概念方案，建立后续迭代基线。',
      evidence:i?'设计师提供的项目说明与反馈摘要；会议纪要原件、日期及工程成本依据待补。':'已归档的 V1 效果图；原始设计任务书和说明待补。',
      requirementKeywords:i?'简化铺装、入口识别、投入分配':'主入口、空间体验',schemeKeywords:i?'铺装简化、水景节点、到达体验':'铺装层次、入口空间'
    }));
  }
  function projectVersions(id){return [...legacyVersions(id),...store.versions.filter(v=>v.projectId===id)].map(v=>({...v,confirmation:store.confirmations[v.id]||v.confirmation})).sort((a,b)=>(b.sequence||0)-(a.sequence||0)||b.at.localeCompare(a.at));}
  function version(id,pid=state.activeProjectId){return projectVersions(pid).find(v=>v.id===id);}
  function meta(v){return {concept:v.concept||v.output?.note||'',rationale:v.rationale||'',requirementKeywords:v.requirementKeywords||'',schemeKeywords:v.schemeKeywords||v.dimensions?.objects||'',area:'',layout:v.dimensions?.layout||'',reason:v.reason||v.requirement||'',changes:v.note||'',evidence:v.evidence||`设计对话中的需求与修改范围${v.requirementConfirmation?'；需求确认：'+v.requirementConfirmation.by:''}。`,...store.versionMeta[v.id]};}
  function images(v){return v.images||[v.output?.src].filter(Boolean);}
  function summary(p){const all=projectVersions(p.id),latest=all[0];return {all,latest,current:p.delivery?.snapshot||null,updatedAt:[p.updatedAt,latest?.at].filter(Boolean).sort().at(-1)||'',updatedBy:latest?.at>p.updatedAt?latest.by:p.updatedBy};}
  function chips(value){return value?String(value).split(/[、,，;；\n]/).filter(Boolean).map(x=>`<span>${safe(x.trim())}</span>`).join(''):'<span class="pc-muted">待补充</span>';}
  function empty(title,desc){return `<div class="pc-empty"><span>◇</span><h3>${title}</h3><p>${desc}</p></div>`;}
  function note(){return storageOK?'':'<div class="notice warn">本地存储暂不可用，新增改动无法保存。</div>';}
  function head(kicker,title,desc,buttons=''){return heading(kicker,title,desc,buttons);}
  function todos(){return visibleProjects().flatMap(p=>{
    const s=summary(p),items=[];
    if(!p.delivery&&s.all.length)items.push({id:p.id+'-delivery',pid:p.id,title:'确认并指定当前交付方案',detail:p.name,type:'方案确认'});
    s.all.filter(v=>!v.confirmation&&v.kind==='assistant').forEach(v=>items.push({id:p.id+'-'+v.id,pid:p.id,title:`${v.number} 设计成果待确认`,detail:p.name,type:'成果确认'}));
    if(p.id==='H001')items.push({id:'H001-material',pid:p.id,title:'补充甲方会议纪要原件',detail:'支撑 V1 → V2 的修改依据',type:'资料待补'});
    return items;
  }).filter(t=>!store.completedTodos[t.id]);}
  function projectCard(p){const s=summary(p),cover=s.current?images(s.current)[0]:p.cover;return `<article class="pc-project-card"><button class="pc-card-cover" data-pc="detail" data-id="${safe(p.id)}">${cover?`<img src="${safe(cover)}" alt="${safe(p.name)}方案预览">`:'<span class="pc-cover-empty">▦<small>项目封面待补</small></span>'}<span class="pc-cover-status">${safe(p.status)}</span></button><div class="pc-card-copy"><small>${safe(p.id)} / ${safe(p.projectType||'项目类型待补')}</small><h3><button data-pc="detail" data-id="${safe(p.id)}">${safe(p.name)}</button></h3><p>${s.current?'当前交付 · '+safe(s.current.number):s.latest?'最新方案 · '+safe(s.latest.number)+' · 交付待指定':'尚未形成方案版本'}</p><div class="pc-card-bottom"><span>${s.all.length} 个方案版本</span>${action('查看项目 ↗','detail',`data-id="${safe(p.id)}"`)}</div></div></article>`;}
  function dashboard(){
    const projects=visibleProjects(),tasks=todos(),featured=projects.filter(p=>p.featured&&p.status!=='已归档'),ongoing=projects.filter(p=>p.status==='进行中'&&!p.featured);
    return `<div class="pc-center">${head('PROJECT WORKSPACE','项目工作台','聚焦正在推进的设计，让下一步工作更清晰。',nav('全部项目 ↗','project-list')+(hasPermission('projects','create')?action('＋ 新建项目','new','',true):''))}${note()}<div class="pc-overview"><div class="pc-overview-intro"><span>LANDSPIRE / PROJECTS</span><h2>${safe(actor())}，欢迎回来。</h2><p>从方案到交付，让每次推进都有依据。</p></div><div class="pc-metrics"><div><strong>${projects.filter(p=>p.status==='进行中').length.toString().padStart(2,'0')}</strong><span>进行中项目</span></div><div><strong>${tasks.length.toString().padStart(2,'0')}</strong><span>待处理事项</span></div><div><strong>${projects.filter(p=>p.delivery).length.toString().padStart(2,'0')}</strong><span>已指定交付</span></div></div></div><div class="pc-dashboard-grid"><section><div class="pc-section-head"><div><span class="pc-kicker">PRIORITY PROJECTS</span><h2>重点项目</h2></div><span>${featured.length} 个重点关注</span></div><div class="pc-project-grid">${featured.length?featured.map(projectCard).join(''):empty('暂无重点项目','在项目列表编辑项目，开启重点关注。')}</div>${ongoing.length?`<div class="pc-section-head"><h2>进行中的项目</h2>${nav('查看全部','project-list')}</div><div class="pc-project-grid">${ongoing.slice(0,4).map(projectCard).join('')}</div>`:''}</section><aside class="pc-todo-panel"><div class="pc-section-head"><div><span class="pc-kicker">NEXT ACTIONS</span><h2>待处理事项</h2></div><span class="pc-count">${tasks.length}</span></div>${tasks.length?tasks.map((t,i)=>`<button class="pc-todo" data-pc="todo" data-id="${safe(t.id)}" data-project-id="${safe(t.pid)}"><span>${String(i+1).padStart(2,'0')}</span><div><small>${safe(t.type)}</small><b>${safe(t.title)}</b><p>${safe(t.detail)}</p></div><i>↗</i></button>`).join(''):empty('暂无待处理事项','所有当前事项均已处理。')}<div class="pc-tip">打开项目查看具体版本、反馈与资料依据。</div></aside></div><section class="pc-recent"><div class="pc-section-head"><h2>最近更新</h2>${nav('进入项目列表 →','project-list')}</div>${projects.slice().sort((a,b)=>summary(b).updatedAt.localeCompare(summary(a).updatedAt)).slice(0,3).map(p=>`<button class="pc-recent-row" data-pc="detail" data-id="${safe(p.id)}"><span class="pc-project-symbol">▦</span><b>${safe(p.name)}</b><span>${safe(summary(p).updatedBy)}</span><span>${date(summary(p).updatedAt)}</span><i>→</i></button>`).join('')}</section></div>`;
  }
  function list(){
    let projects=visibleProjects().filter(p=>(filter==='all'||p.status===filter)&&`${p.name} ${p.id} ${p.createdBy} ${summary(p).updatedBy}`.toLowerCase().includes(search.toLowerCase()));
    projects.sort((a,b)=>sort==='name'?a.name.localeCompare(b.name,'zh-CN'):sort==='start'?(b.startDate||'').localeCompare(a.startDate||''):summary(b).updatedAt.localeCompare(summary(a).updatedAt));
    const count=projects.length,pages=Math.max(1,Math.ceil(count/8));listPage=Math.min(listPage,pages);
    return `<div class="pc-center">${head('PROJECT DIRECTORY','项目列表','浏览和管理当前权限范围内的全部项目。',nav('← 项目工作台','projects')+(hasPermission('projects','create')?action('＋ 新建项目','new','',true):''))}${note()}<div class="pc-list-card"><div class="pc-list-toolbar"><label class="pc-search">⌕<input id="pc-search" aria-label="搜索项目" placeholder="搜索项目名称、编号或成员" value="${safe(search)}"></label><label>项目状态<select id="pc-filter" aria-label="项目状态筛选"><option value="all">全部状态</option>${statuses.map(s=>`<option ${s===filter?'selected':''}>${s}</option>`).join('')}</select></label><label>排序<select id="pc-sort" aria-label="项目排序"><option value="updated" ${sort==='updated'?'selected':''}>最近更新</option><option value="name" ${sort==='name'?'selected':''}>项目名称</option><option value="start" ${sort==='start'?'selected':''}>开始时间</option></select></label></div><div class="pc-list-caption"><b>全部项目 <span>${count}</span></b><small>项目进度与方案交付分别管理</small></div><div class="pc-table-scroll"><table class="pc-table"><thead><tr><th>项目名称</th><th>项目时间</th><th>创建人</th><th>最后修改人</th><th>当前状态</th><th>操作</th></tr></thead><tbody>${projects.slice((listPage-1)*8,listPage*8).map(p=>{const s=summary(p);return `<tr><td><div class="pc-table-project">${p.cover?`<img src="${safe(p.cover)}" alt="">`:'<span class="pc-project-symbol">▦</span>'}<div><button data-pc="detail" data-id="${safe(p.id)}">${safe(p.name)}</button><small>${safe(p.id)}${p.featured?' · 重点关注':''}${p.id.startsWith('DEMO')?' · 示例项目':''}</small></div></div></td><td>${safe(p.startDate||'待补录')}<small>至 ${safe(p.endDate||'待补录')}</small></td><td>${safe(p.createdBy)}</td><td>${safe(s.updatedBy)}<small>${date(s.updatedAt)}</small></td><td><span class="pc-status ${p.status==='进行中'?'green':''}">${safe(p.status)}</span><small>${s.current?'交付 '+safe(s.current.number):'交付待指定'}</small></td><td><div class="pc-row-actions">${action('查看详情','detail',`data-id="${safe(p.id)}"`)}${canEdit()?action('编辑','edit',`data-id="${safe(p.id)}"`):''}</div></td></tr>`;}).join('')}</tbody></table></div>${count?'':empty('没有匹配的项目','调整关键词或项目状态后重试。')}<div class="pc-pagination"><span>共 ${count} 个项目 · 每页 8 个</span><div>${action('← 上一页','prev',listPage===1?'disabled':'')}<span>${listPage} / ${pages}</span>${action('下一页 →','next',listPage===pages?'disabled':'')}</div></div></div><p class="pc-footnote">项目时间指计划起止日期；未提供的成员和日期保留为待补录。</p></div>`;
  }
  function scheme(v,delivery){
    const m=delivery?v.presentation:meta(v),pictures=images(v);galleryIndex=Math.min(galleryIndex,Math.max(0,pictures.length-1));
    return `<section class="pc-scheme"><div class="pc-scheme-gallery">${pictures.length?`<button class="pc-main-image" data-pc="image" data-src="${safe(pictures[galleryIndex])}" data-title="${safe(v.title)}"><img src="${safe(pictures[galleryIndex])}" alt="${safe(v.title)}方案效果图"><span>查看大图 ↗</span></button><div class="pc-thumbnails">${pictures.map((src,i)=>`<button class="${galleryIndex===i?'selected':''}" data-pc="gallery" data-index="${i}" aria-label="查看方案图片 ${i+1}" aria-pressed="${galleryIndex===i}"><img src="${safe(src)}" alt="方案缩略图 ${i+1}"></button>`).join('')}<span>${v.kind==='assistant'?'交互示意图 · 非真实生成':'概念效果图 · 来源：项目归档'}</span></div>`:empty('方案图片待补','请在设计助手中保存方案成果。')}</div><div class="pc-scheme-copy"><div class="pc-scheme-label"><span>${delivery?'CURRENT DELIVERY':'LATEST DESIGN'}</span><b>${safe(v.number)}</b></div><h2>${safe(v.title)}</h2><p class="pc-concept">${safe(m.concept||'方案理念待补充')}</p><div class="pc-info-block"><h3>设计思路</h3><p>${safe(m.rationale||'待补充设计思路及其与需求的对应关系。')}</p></div><div class="pc-keywords"><div><h3>需求关键词</h3><div>${chips(m.requirementKeywords)}</div></div><div><h3>方案关键词</h3><div>${chips(m.schemeKeywords)}</div></div></div><div class="pc-layout"><div><span>设计面积</span><b>${safe(m.area||'待补录')}</b></div><div><span>布局与功能分区</span><p>${safe(m.layout||'详细布局信息待补录')}</p></div></div></div></section>`;
  }
  function historyCard(v,p){
    const m=meta(v),parent=version(v.parentVersion,p.id)||projectVersions(p.id).find(x=>x.sequence===v.sequence-1);
    return `<article class="pc-version"><div class="pc-version-rail"><b>${safe(v.number)}</b><i></i></div><div class="pc-version-body"><div class="pc-version-top"><div><h3>${safe(v.title)}</h3><small>${date(v.at)} · ${safe(v.by)}</small></div><div class="pc-version-badges">${p.delivery?.versionId===v.id?'<span class="pc-status green">当前交付</span>':''}<span class="pc-status ${v.confirmation?'green':''}">${v.confirmation?'成果已确认':'成果待确认'}</span></div></div><div class="pc-version-summary"><p><b>为什么修改</b>${safe(m.reason||'修改原因待补充')}</p><p><b>回应的需求</b>${safe(v.requirement||'需求记录待补充')}</p><p><b>${parent?'相比 '+safe(parent.number)+' 的变化':'本版设计内容'}</b>${safe(m.changes||'变化说明待补充')}</p><p><b>修改依据</b>${safe(m.evidence||'依据待补充')}</p></div><details><summary>展开方案图片与确认记录</summary><div class="pc-version-images">${images(v).map(src=>`<button data-pc="image" data-src="${safe(src)}" data-title="${safe(v.title)}"><img src="${safe(src)}" alt="${safe(v.title)}"></button>`).join('')}</div><p class="pc-muted">${v.confirmation?'成果确认：'+safe(v.confirmation.by)+' · '+timestamp(v.confirmation.at):'成果尚未确认，不能设为当前交付方案。'}${v.kind==='assistant'?' · 图片为交互示意':''}</p></details><div class="pc-version-actions">${action(v.kind==='assistant'?'查看设计对话 ↗':'查看来源依据 ↗','source',`data-id="${safe(v.id)}"`)}${parent?action('对比 '+safe(parent.number),'compare',`data-id="${safe(v.id)}" data-parent="${safe(parent.id)}"`):''}${canEdit()?action('编辑方案说明','edit-version',`data-id="${safe(v.id)}"`):''}${canReview()&&!v.confirmation?action('确认成果','confirm',`data-id="${safe(v.id)}"`):''}${canReview()&&v.confirmation?action(p.delivery?.versionId===v.id?'更新交付快照':'设为当前交付方案','designate',`data-id="${safe(v.id)}"`,true):''}</div></div></article>`;
  }
  function materials(p){return `<details class="pc-materials"><summary><span>资料与设计依据 <small>${p.id==='H001'?'3 类资料 · 原件缺失项待补':'来源与支撑关系'}</small></span><span>展开查看 ＋</span></summary><div class="pc-material-table">${p.id==='H001'?`<div><b>V1 / V2 概念效果图</b><span>来源：项目归档 · 共 4 张</span><p>支撑方案视觉呈现和版本差异核对。</p><span class="pc-status green">已接入</span></div><div><b>甲方会议反馈</b><span>来源：设计师提供的反馈摘要</span><p>支撑简化铺装、调整投入重点和探索入口水景的需求；关联 V2。</p><span class="pc-status">纪要原件、日期待补</span></div><div><b>总平面 / 手绘与面积资料</b><span>来源：原始项目文件待归档</span><p>用于核验功能分区、尺寸和设计面积；当前不据效果图推算数值。</p><span class="pc-status">待补资料</span></div>`:empty('尚未归档项目依据','可在方案说明中记录需求来源与引用资料。')}</div></details>`;}
  function reports(p){const items=window.landspireDesign.projectReports(p.id);return items.length?`<details class="pc-materials"><summary><span>我的项目报告 <small>${items.length} 份已保存文档</small></span><span>展开查看 ＋</span></summary><div class="pc-report-list">${items.slice().reverse().map(r=>`<div><b>${safe(r.title)}</b><small>${safe(r.versionNumber)} · ${date(r.at)}</small><button class="btn btn-sm" data-dw="report" data-id="${safe(r.id)}">预览报告</button><button class="btn btn-sm" data-dw="export-report" data-id="${safe(r.id)}">导出 HTML</button></div>`).join('')}</div></details>`:'';}
  function detail(){
    const p=project(state.activeProjectId);if(!p||!allowed(p.id))return empty('项目不可访问','请返回项目列表选择当前权限范围内的项目。');
    const s=summary(p),v=s.current||s.latest;
    return `<div class="pc-center ${reportMode?'pc-report-mode':''}"><div class="pc-detail-nav">${nav('← 项目列表','project-list')}<span>项目 / ${safe(p.id)}</span>${reportMode?action('退出汇报视图','report-mode'):''}</div>${head('PROJECT / '+safe(p.id),safe(p.name),safe(p.projectType||'项目类型待补')+' · '+safe(p.subtitle||'项目概况待补'),reportMode?'':action('汇报视图','report-mode')+(s.current?action('导出交付方案','export'):''))}<div class="pc-project-meta"><span class="pc-status green">${safe(p.status)}</span><span>计划时间 ${safe(p.startDate||'待补录')} — ${safe(p.endDate||'待补录')}</span><span>${s.all.length} 个方案版本</span>${!reportMode&&canEdit()?action('编辑项目信息','edit',`data-id="${safe(p.id)}"`):''}</div>${note()}<div class="pc-section-head pc-delivery-heading"><div><span class="pc-kicker">${s.current?'CURRENT DELIVERY':'DESIGN OVERVIEW'}</span><h2>${s.current?'当前交付方案':'最新方案预览'}</h2></div><span>${s.current?'由 '+safe(p.delivery.by)+' 指定 · '+date(p.delivery.at):'尚未指定交付方案'}</span></div>${!s.current?'<div class="pc-delivery-note">项目经理或超级管理员确认成果后，可从下方版本中指定当前交付方案。</div>':''}${v?scheme(v,!!s.current):empty('从第一个方案开始','在设计助手中关联本项目，保存首个方案版本。')}${!reportMode?`<div class="pc-detail-actions">${action('在此项目继续设计 ↗','design','',true)}<span>新版本独立保存，不会自动替换当前交付。</span></div>`:''}<section class="pc-history"><div class="pc-section-head"><div><span class="pc-kicker">DESIGN EVOLUTION</span><h2>方案迭代</h2></div><span>最新在前 · 每一步都有依据</span></div>${s.all.length?s.all.map(v=>historyCard(v,p)).join(''):empty('暂无历史版本','方案保存后，需求与修改记录会汇集在这里。')}</section>${materials(p)}${!reportMode?reports(p):''}<p class="pc-footnote">${reportMode?'内部汇报视图 · 由项目成员展示，无需客户账号':'交付方案与知识发布独立管理 · 当前方案保存为指定时的快照'} · 数据保存在当前浏览器</p></div>`;
  }
  function showModal(title,body,footer=''){modal(title,body,footer||action('关闭','close'));document.querySelector('.modal')?.classList.add('pc-modal');}
  function close(){document.getElementById('modal-root').innerHTML='';}
  const field=(label,id,value='',type='text')=>`<label class="pc-field">${label}<input id="${id}" type="${type}" value="${safe(value)}" ${type==='text'?'maxlength="120"':''}></label>`;
  const textarea=(label,id,value='')=>`<label class="pc-field">${label}<textarea id="${id}" rows="3" maxlength="2500">${safe(value)}</textarea></label>`;
  function editProject(id){
    const p=id?project(id):{name:'',projectType:'商业景观',status:'进行中'};
    showModal(id?'编辑项目信息':'新建项目',`${field('项目名称','pc-name',p.name)}${field('项目类型','pc-type',p.projectType)}<div class="pc-form-grid">${field('计划开始日期','pc-start',p.startDate,'date')}${field('计划结束日期','pc-end',p.endDate,'date')}</div><label class="pc-field">项目状态<select id="pc-status">${statuses.map(s=>`<option ${s===p.status?'selected':''}>${s}</option>`).join('')}</select></label>${field('项目概况','pc-subtitle',p.subtitle)}<label class="pc-check"><input type="checkbox" id="pc-featured" ${p.featured?'checked':''}>在工作台重点关注</label><p class="pc-muted">保存项目信息，不会改变当前交付方案。</p>`,action('取消','close')+action('保存项目','save-project',id?`data-id="${safe(id)}"`:'',true));
  }
  function editVersion(v){const m=meta(v);showModal('编辑 '+safe(v.number)+' 方案说明',`${textarea('方案理念','pc-concept',m.concept)}${textarea('设计思路','pc-rationale',m.rationale)}<div class="pc-form-grid">${field('需求关键词（用顿号分隔）','pc-req-tags',m.requirementKeywords)}${field('方案关键词（用顿号分隔）','pc-scheme-tags',m.schemeKeywords)}</div>${field('设计面积（含单位）','pc-area',m.area)}${textarea('布局与功能分区','pc-layout',m.layout)}${textarea('为什么修改','pc-reason',m.reason)}${textarea('相比上一版改了什么','pc-changes',m.changes)}${textarea('修改依据与资料来源','pc-evidence',m.evidence)}<p class="pc-muted">已指定的交付快照保持原样。补充说明后，由负责人更新交付快照。</p>`,action('取消','close')+action('保存说明','save-version-meta',`data-id="${safe(v.id)}"`,true));}
  function source(v){
    if(v.kind==='assistant'&&v.owner===state.currentAccount&&window.landspireDesign.openSource(v.id))return;
    showModal(v.kind==='assistant'?'设计对话来源':'历史方案来源',`<div class="pc-source"><span class="pc-status">${safe(v.number)}</span><h3>${safe(v.title)}</h3><dl><dt>来源</dt><dd>${v.kind==='assistant'?'设计助手 · '+safe(v.by)+' 保存的项目版本':'项目归档效果图与设计师提供的项目说明'}</dd><dt>回应的需求</dt><dd>${safe(v.requirement)}</dd><dt>修改依据</dt><dd>${safe(meta(v).evidence)}</dd></dl><p class="pc-muted">${v.kind==='assistant'?'完整对话保留在创建者账号下。使用该账号登录后，可直接定位到原始设计对话。':'此历史版本未关联平台内设计对话；不生成虚构对话。'}</p></div>`);
  }
  function compare(v,parent){showModal(`${safe(parent.number)} → ${safe(v.number)} · 版本对比`,`<div class="pc-compare">${[parent,v].map(x=>`<section><h3>${safe(x.number)} · ${safe(x.title)}</h3>${images(x)[0]?`<img src="${safe(images(x)[0])}" alt="${safe(x.title)}">`:''}<h4>方案内容</h4><p>${safe(meta(x).changes)}</p><h4>布局</h4><p>${safe(meta(x).layout||'待补充')}</p></section>`).join('')}</div><div class="pc-compare-note"><h4>本轮修改原因</h4><p>${safe(meta(v).reason)}</p><h4>依据</h4><p>${safe(meta(v).evidence)}</p></div>`);}
  async function exportDelivery(){
    const p=project(state.activeProjectId),v=p.delivery?.snapshot;if(!v){toast('请先指定当前交付方案');return;}
    try{
      const embedded=await Promise.all(images(v).map(async src=>{const r=await fetch(src);if(!r.ok)throw Error();const blob=await r.blob();return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});}));
      const m=v.presentation,body=`<header><small>LANDSPIRE / DESIGN DELIVERY</small><h1>${safe(p.name)}</h1><p>${safe(v.number)} · ${safe(v.title)}</p><p>指定人：${safe(p.delivery.by)} · ${timestamp(p.delivery.at)}</p></header>${embedded.map(src=>`<img src="${src}" alt="方案成果">`).join('')}<p>${v.kind==='assistant'?'交互示意图，非真实生成效果图':'概念方案效果图'}</p>${[['方案理念',m.concept],['设计思路',m.rationale],['需求关键词',m.requirementKeywords],['方案关键词',m.schemeKeywords],['设计面积',m.area],['布局与功能分区',m.layout],['回应的需求',v.requirement],['修改内容',m.changes],['修改依据',m.evidence]].map(([k,val])=>`<h2>${k}</h2><p>${safe(val||'待补充')}</p>`).join('')}<footer>当前交付方案的指定时快照 · 项目资料仅按实际提供内容展示</footer>`;
      const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${safe(p.name)} · ${safe(v.number)} 交付方案</title><style>body{max-width:900px;margin:48px auto;padding:24px;font:15px/1.9 system-ui;color:#243e32}header{border-bottom:1px solid #ddd;margin-bottom:28px}h1{font-size:32px}h2{font-size:18px;margin-top:28px}img{max-width:100%;max-height:600px;display:block;margin:16px auto}p{white-space:pre-wrap}footer{border-top:1px solid #ddd;margin-top:40px;padding-top:20px;color:#6b796f}@media print{body{margin:0;padding:0}img{max-height:450px;break-inside:avoid}h2{break-after:avoid}}</style></head><body>${body}</body></html>`;
      const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=(p.name+'-'+v.number+'-交付方案.html').replace(/[<>:"/\\|?*]/g,'_');link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已导出包含图片的独立 HTML，可打印为 PDF');
    }catch{toast('导出失败，图片未能读取，请确认本地预览服务正常。');}
  }
  const handlers={
    detail:b=>{state.activeProjectId=b.dataset.id;state.page='project-detail';reportMode=false;galleryIndex=0;render();window.scrollTo(0,0);},
    new:()=>editProject(),edit:b=>editProject(b.dataset.id),close,
    'save-project':b=>{const name=document.getElementById('pc-name').value.trim(),start=document.getElementById('pc-start').value,end=document.getElementById('pc-end').value;if(!name){toast('请填写项目名称');return;}if(start&&end&&end<start){toast('结束日期不能早于开始日期');return;}const existing=b.dataset.id?project(b.dataset.id):null,id=existing?.id||'PRJ-'+crypto.randomUUID().slice(0,8).toUpperCase();store.projects[id]={...(existing||{id,created:true,placeholder:true,createdBy:actor(),createdAt:stamp()}),name,projectType:document.getElementById('pc-type').value.trim(),subtitle:document.getElementById('pc-subtitle').value.trim(),startDate:start,endDate:end,status:document.getElementById('pc-status').value,featured:document.getElementById('pc-featured').checked,updatedBy:actor(),updatedAt:stamp()};if(!persist())return;if(rolePermissions[state.currentRole].scope==='assigned'&&!rolePermissions[state.currentRole].projectIds.includes(id))rolePermissions[state.currentRole].projectIds.push(id);hydrate();close();render();toast('项目信息已保存到此浏览器');},
    prev:()=>{listPage--;render();},next:()=>{listPage++;render();},
    gallery:b=>{galleryIndex=Number(b.dataset.index);render();},
    image:b=>showModal(safe(b.dataset.title),`<img class="pc-preview-image" src="${safe(b.dataset.src)}" alt="${safe(b.dataset.title)}">`),
    'report-mode':()=>{reportMode=!reportMode;render();window.scrollTo(0,0);},
    export:exportDelivery,
    design:()=>window.openDesignConversation(state.activeProjectId),
    source:b=>source(version(b.dataset.id)),
    compare:b=>compare(version(b.dataset.id),version(b.dataset.parent)),
    'edit-version':b=>editVersion(version(b.dataset.id)),
    'save-version-meta':b=>{const v=version(b.dataset.id),map={concept:'pc-concept',rationale:'pc-rationale',requirementKeywords:'pc-req-tags',schemeKeywords:'pc-scheme-tags',area:'pc-area',layout:'pc-layout',reason:'pc-reason',changes:'pc-changes',evidence:'pc-evidence'};store.versionMeta[v.id]=Object.fromEntries(Object.entries(map).map(([k,id])=>[k,document.getElementById(id).value.trim()]));store.projects[v.projectId]={...project(v.projectId),updatedBy:actor(),updatedAt:stamp()};if(persist()){close();render();toast('方案说明已保存');}},
    confirm:b=>{const v=version(b.dataset.id);showModal('确认 '+safe(v.number)+' 设计成果',`<p>确认你已核对本版设计成果及修改依据。确认后，可以将其指定为当前交付方案。</p><p class="pc-muted">${safe(v.title)} · 此操作不表示资料或工程条件已全部核验。</p>`,action('取消','close')+action('确认成果','confirm-save',`data-id="${safe(v.id)}"`,true));},
    'confirm-save':b=>{const v=version(b.dataset.id);if(!v)return;const c={by:actor(),at:stamp()};store.confirmations[v.id]=c;if(persist()){window.landspireDesign.confirmVersion(v.id,c);close();render();toast('成果已确认，可设为当前交付方案');}},
    designate:b=>{const v=version(b.dataset.id);if(!v?.confirmation){toast('请先确认设计成果');return;}const p=project(v.projectId);showModal('指定当前交付方案',`<p>将 <b>${safe(v.number)} · ${safe(v.title)}</b> 设为项目首页展示与导出的交付方案。</p><p>${p.delivery?'现有 '+safe(p.delivery.snapshot.number)+' 仍保留在迭代历史中。':'其他版本继续保留在迭代历史中。'}</p><p class="pc-muted">保存当前方案及说明的快照，后续新增版本不会自动替换。</p>`,action('取消','close')+action('确认指定','designate-save',`data-id="${safe(v.id)}"`,true));},
    'designate-save':b=>{const v=version(b.dataset.id);if(!v?.confirmation)return;const p=project(v.projectId);store.projects[p.id]={...p,delivery:{versionId:v.id,by:actor(),at:stamp(),snapshot:{...clone(v),presentation:clone(meta(v))}},updatedBy:actor(),updatedAt:stamp()};if(persist()){close();galleryIndex=0;render();window.scrollTo(0,0);toast(v.number+' 已设为当前交付方案');}},
    todo:b=>{const t=todos().find(t=>t.id===b.dataset.id);if(!t)return;showModal(safe(t.title),`<p>${safe(t.detail)}</p><p class="pc-muted">进入项目核对相关版本和依据，完成后可标记处理。</p>`,action('查看项目','detail',`data-id="${safe(t.pid)}"`,true)+(canEdit()?action('标记已处理','todo-done',`data-id="${safe(t.id)}"`):''));},
    'todo-done':b=>{store.completedTodos[b.dataset.id]={by:actor(),at:stamp()};if(persist()){close();render();toast('事项已标记处理');}}
  };
  const writeActions=new Set(['new','edit','save-project','edit-version','save-version-meta','todo-done']);
  const reviewActions=new Set(['confirm','confirm-save','designate','designate-save']);
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-pc]');if(!b||b.disabled)return;e.preventDefault();e.stopPropagation();
    if(!state.currentRole||!hasPermission('projects','read'))return;
    const a=b.dataset.pc;
    if((writeActions.has(a)&&!hasPermission('projects',a==='new'||a==='save-project'&&!b.dataset.id?'create':'update'))||(reviewActions.has(a)&&!canReview())){toast('当前角色无此操作权限');return;}
    const target=['detail','edit'].includes(a)?b.dataset.id:state.activeProjectId;
    if(target&&!allowed(target)&&a!=='close'){toast('当前项目不可访问');return;}
    if(a==='detail')close();handlers[a]?.(b);
  });
  document.addEventListener('input',e=>{if(e.target.id!=='pc-search')return;search=e.target.value;listPage=1;const position=e.target.selectionStart;render();const input=document.getElementById('pc-search');input.focus();input.setSelectionRange(position,position);});
  document.addEventListener('change',e=>{if(e.target.id==='pc-filter'){filter=e.target.value;listPage=1;render();}if(e.target.id==='pc-sort'){sort=e.target.value;listPage=1;render();}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('.pc-modal'))close();});
  pageModules['project-list']='projects';navNames['project-list']='项目列表';navNames.projects='项目工作台';
  const projectNav=document.querySelector('#design-nav [data-page="projects"]');
  projectNav.insertAdjacentHTML('afterend','<button class="nav-item" data-page="project-list"><span class="nav-icon">☷</span>项目列表</button>');
  const previousRender=render;
  render=function(){
    if(state.currentRole&&['projects','project-list','project-detail'].includes(state.page)&&pageAllowed(state.page)){
      hydrate();window.landspireDesign.syncProjectVersions();document.body.classList.remove('design-workspace-page');
      document.getElementById('crumb-current').textContent=navNames[state.page];
      document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===(state.page==='project-detail'?'project-list':state.page)));
      document.getElementById('view').innerHTML=state.page==='projects'?dashboard():state.page==='project-list'?list():detail();return;
    }
    reportMode=false;previousRender();
  };
})();
